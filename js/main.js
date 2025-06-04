import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.minDistance = 6;
controls.maxDistance = 50;

// Light
scene.add(new THREE.AmbientLight(0xffffff, 1));

// Earth group
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Globe
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
);
const globe = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshPhongMaterial({ map: earthTexture })
);
earthGroup.add(globe);

camera.position.set(0, 5, 12);

// LatLon -> Vec3
function latLonToVec3(lat, lon, radius = 5.05) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function addCityMarker(lat, lon, color = 0xff0000) {
    const pos = latLonToVec3(lat, lon);
    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color })
    );
    marker.position.copy(pos);
    earthGroup.add(marker);
    return pos;
}

const flights = [];

// PTF
function createFlight(fromVec, toVec, color = 0xffff00) {
    const arcPoints = [];
    const baseRadius = 5.05;
    const peakRadius = 5.2;
    const steps = 200;

    const omega = Math.acos(
        fromVec.clone().normalize().dot(toVec.clone().normalize())
    );
    const sinOmega = Math.sin(omega);

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = fromVec
            .clone()
            .multiplyScalar(Math.sin((1 - t) * omega))
            .add(toVec.clone().multiplyScalar(Math.sin(t * omega)))
            .divideScalar(sinOmega);
        const currentRadius =
            baseRadius + (peakRadius - baseRadius) * Math.sin(Math.PI * t);
        p.normalize().multiplyScalar(currentRadius);
        arcPoints.push(p);
    }

    const curve = new THREE.CatmullRomCurve3(arcPoints);
    const tube = new THREE.TubeGeometry(curve, 100, 0.03, 8, false);
    const material = new THREE.MeshBasicMaterial({ color });
    earthGroup.add(new THREE.Mesh(tube, material));

    const frames = [];
    let up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();

        if (i === 0) {
            const normal = new THREE.Vector3()
                .crossVectors(up, tangent)
                .normalize();
            const binormal = new THREE.Vector3()
                .crossVectors(tangent, normal)
                .normalize();
            frames.push({ point, tangent, normal, binormal });
        } else {
            const prev = frames[i - 1];
            const axis = new THREE.Vector3()
                .crossVectors(prev.tangent, tangent)
                .normalize();
            const angle = Math.acos(
                THREE.MathUtils.clamp(prev.tangent.dot(tangent), -1, 1)
            );
            const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
            up.applyQuaternion(q);
            const normal = new THREE.Vector3()
                .crossVectors(up, tangent)
                .normalize();
            const binormal = new THREE.Vector3()
                .crossVectors(tangent, normal)
                .normalize();
            frames.push({ point, tangent, normal, binormal });
        }
    }

    const plane = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.05, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    earthGroup.add(plane);

    flights.push({
        plane,
        frames,
        progress: Math.random(),
        steps,
    });
}

// Cities and routes
const warsaw = addCityMarker(52.2297, 21.0122, 0xff0000);
const london = addCityMarker(51.5074, -0.1278, 0x0000ff);
const moscow = addCityMarker(55.7558, 37.6173, 0x00ff00);
const newYork = addCityMarker(40.7128, -74.006, 0xff00ff);
const tokyo = addCityMarker(35.6762, 139.6503, 0xffff00);
const sydney = addCityMarker(-33.8688, 151.2093, 0x00ffff);
const capeTown = addCityMarker(-33.9249, 18.4241, 0x800080);

createFlight(warsaw, london, 0xff9900);
createFlight(warsaw, moscow, 0xffcc00);
createFlight(warsaw, newYork, 0xcc66ff);
createFlight(warsaw, tokyo, 0x00ccff);
createFlight(warsaw, sydney, 0x33ff99);
createFlight(warsaw, capeTown, 0xff3399);

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    flights.forEach((flight) => {
        flight.progress += 0.002;
        if (flight.progress > 1) flight.progress = 0;
        const idx = Math.floor(flight.progress * flight.steps);
        const frame = flight.frames[idx];
        flight.plane.position.copy(frame.point);
        const matrix = new THREE.Matrix4().makeBasis(
            frame.normal,
            frame.binormal,
            frame.tangent
        );
        flight.plane.setRotationFromMatrix(matrix);
    });

    renderer.render(scene, camera);
}
animate();
