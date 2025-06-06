import * as THREE from "three";

function generateIntermediatePoints(fromVec, toVec, numPoints = 3) {
    const points = [];
    const baseRadius = 5.05;
    
    points.push(fromVec.clone());
    
    for (let i = 1; i <= numPoints; i++) {
        const t = i / (numPoints + 2);

        const intermediatePoint = fromVec.clone().lerp(toVec, t);
        
        const heightVariation = Math.floor(Math.random() * 0) + 0.15; 
        intermediatePoint.normalize().multiplyScalar(baseRadius + heightVariation);

        const sideVariation = Math.floor(Math.random() * 0) + 0.005; 
        const rotationAxis = new THREE.Vector3().crossVectors(fromVec, toVec).normalize();
        intermediatePoint.applyAxisAngle(rotationAxis, sideVariation);
        
        points.push(intermediatePoint);
    }
    
    points.push(toVec.clone());
    
    return points;
}

function createCurveFromPoints(points) {
    return new THREE.CatmullRomCurve3(points);
}

export { generateIntermediatePoints, createCurveFromPoints }; 