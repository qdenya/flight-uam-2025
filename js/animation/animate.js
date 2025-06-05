import * as THREE from "three";
import { controls, renderer, scene, camera } from "../core/scene.js";
import { flights } from "../flight/flight.js";

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

export { animate }; 