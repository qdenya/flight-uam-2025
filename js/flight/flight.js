import * as THREE from "three";
import { earthGroup } from "../earth/globe.js";

const flights = [];

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

export { createFlight, flights }; 