import * as THREE from "three";
import { earthGroup } from "../earth/globe.js";
import { generateIntermediatePoints, createCurveFromPoints } from "./routeGenerator.js";

const flights = [];

function createFlight(fromVec, toVec, color = 0xffff00, customPoints = null) {
    const routePoints = customPoints || generateIntermediatePoints(fromVec, toVec, 10);
    const curve = createCurveFromPoints(routePoints);
    
    const tube = new THREE.TubeGeometry(curve, 100, 0.02, 8, false);
    const material = new THREE.MeshBasicMaterial({ color });
    const tubeMesh = new THREE.Mesh(tube, material);
    earthGroup.add(tubeMesh);

    const frames = [];
    const steps = 200;
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t).normalize();
        
        const normal = point.clone().normalize();
        
        const binormal = new THREE.Vector3()
            .crossVectors(tangent, normal)
            .normalize();
        
        const correctedNormal = new THREE.Vector3()
            .crossVectors(binormal, tangent)
            .normalize();
        
        frames.push({ 
            point, 
            tangent, 
            normal: correctedNormal, 
            binormal 
        });
    }

    const plane = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.05, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    earthGroup.add(plane);
    const flight = {
        plane,
        tube: tubeMesh,
        frames,
        steps,
        progress: Math.random(),
        speed: 0.002,
        visible: true
    };
    flights.push(flight);

    return flight;
}

export { createFlight, flights }; 