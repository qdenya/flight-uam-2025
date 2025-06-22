import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createSkybox } from "./skybox.js";

const scene = new THREE.Scene();
scene.background = createSkybox();
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;

const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(1, 2, 1);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2512;
sunLight.shadow.mapSize.height = 2512;
sunLight.shadow.camera.near = 2.5;
sunLight.shadow.camera.far = 10000;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

const debugCamera = new THREE.CameraHelper(sunLight.shadow.camera);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

function updateCameraPosition() {
    const width = window.innerWidth;

    if (width <= 600) {
        camera.position.set(0, 15, 20);
        controls.minDistance = 4;
        controls.maxDistance = 15;
        scene.position.y = -4;
    } else if (width <= 1024) {
        camera.position.set(0, 10, 20);
        controls.minDistance = 5;
        controls.maxDistance = 30;
    } else {
        camera.position.set(0, 8, 15);
        controls.minDistance = 6;
        controls.maxDistance = 40;
    }
}

updateCameraPosition();

// window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     updateCameraPosition();
// });

export { scene, camera, renderer, controls, sunLight, debugCamera };
