import * as THREE from "three";
import { controls, renderer, scene, camera } from "../core/scene.js";
import { flights } from "../flight/flight.js";
import { controls as guiControls } from "../ui/gui.js";
import { earthGroup } from "../earth/globe.js";

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (guiControls.autoRotate) {
        earthGroup.rotation.y += guiControls.rotationSpeed * 0.01;
    }

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

    renderer.render(scene, camera);
}

export { animate }; 