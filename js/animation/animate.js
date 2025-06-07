import * as THREE from "three";
import { controls, renderer, scene, camera, sunLight } from "../core/scene.js";
import { flights } from "../flight/flight.js";
import { controls as guiControls } from "../ui/gui.js";
import {
    earthGroup,
    globeMaterial,
    atmosphere,
    clouds,
} from "../earth/globe.js";

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    atmosphere.material.uniforms.lightDirection.value.copy(
        globeMaterial.uniforms.lightDirection.value
    );

    if (guiControls.autoRotate) {
        earthGroup.rotation.y += guiControls.rotationSpeed * 0.01;
    }

    const baseSun = new THREE.Vector3(1, 1.2, 1);
    const combinedRotation = earthGroup.rotation.y + guiControls.sunRotation;
    const rotatedSun = baseSun
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -combinedRotation);
    globeMaterial.uniforms.lightDirection.value.copy(rotatedSun.normalize());
    sunLight.position.copy(rotatedSun.multiplyScalar(10));

    flights.forEach((flight) => {
        if (!flight.visible) return;

        flight.progress += flight.speed;
        if (flight.progress > 1) flight.progress = 0;
        const idx = Math.floor(flight.progress * flight.steps);
        const frame = flight.frames[idx];
        flight.plane.position.copy(frame.point);

        const matrix = new THREE.Matrix4().makeBasis(
            frame.binormal,
            frame.tangent,
            frame.normal
        );
        flight.plane.setRotationFromMatrix(matrix);
    });
    clouds.rotation.y += 0.0003;

    renderer.render(scene, camera);
}

export { animate };
