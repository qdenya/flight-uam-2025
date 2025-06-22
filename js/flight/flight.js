import * as THREE from "three";
import { earthGroup } from "../earth/globe.js";
import {
    generateIntermediatePoints,
    createCurveFromPoints,
} from "./routeGenerator.js";
import { loadPlaneModel } from "./planeModel.js";

const flights = [];

function createFlight(fromVec, toVec, color = 0xffff00, customPoints = null) {
    const routePoints =
        customPoints || generateIntermediatePoints(fromVec, toVec, 10);
    const curve = createCurveFromPoints(routePoints);

    const tube = new THREE.TubeGeometry(curve, 50, 0.003, 6, false);
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
            binormal,
        });
    }

    const flight = {
        plane: null,
        tube: tubeMesh,
        frames,
        steps,
        progress: Math.random(),
        speed: 0.002,
        visible: true,
    };

    flights.push(flight);

    loadPlaneModel((model) => {
        const plane = model.clone();
        plane.scale.set(0.3, 0.3, 0.3);
        plane.castShadow = true;
        plane.receiveShadow = false;
        earthGroup.add(plane);
        flight.plane = plane;
    });

    return flight;
}

function clearAllFlights() {
    flights.forEach(flight => {
        if (flight.tube) {
            earthGroup.remove(flight.tube);
            flight.tube.geometry.dispose();
            flight.tube.material.dispose();
        }
        
        if (flight.plane) {
            earthGroup.remove(flight.plane);
        }
    });
    
    flights.length = 0;
    
    console.log('All flights cleared');
}

export { createFlight, flights, clearAllFlights };
