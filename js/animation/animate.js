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
    const offset = -0.05;

    requestAnimationFrame(animate);
    controls.update();

    // atmosphere.material.uniforms.lightDirection.value.copy(
    //     globeMaterial.uniforms.lightDirection.value
    // );

    if (guiControls.autoRotate) {
        earthGroup.rotation.y += guiControls.rotationSpeed * 0.01;
    }

    const baseSun = new THREE.Vector3(1, 0.5, 1).normalize();
    const combinedRotation = earthGroup.rotation.y + guiControls.sunRotation;
    const rotatedSun = baseSun
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), -combinedRotation);

    globeMaterial.uniforms.lightDirection.value.copy(rotatedSun);
    sunLight.position.copy(rotatedSun.multiplyScalar(20));

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

        const adjustedPoint = frame.point
            .clone()
            .addScaledVector(frame.normal, offset);
        flight.plane.position.copy(adjustedPoint);
        flight.plane.setRotationFromMatrix(matrix);
        flight.plane.rotateZ(-Math.PI / 2);
        flight.plane.rotateX(Math.PI / 2);
    });
    clouds.rotation.y += 0.0003;

    renderer.render(scene, camera);
}

export { animate };
