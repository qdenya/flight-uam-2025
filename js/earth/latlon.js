import * as THREE from "three";
import { earthGroup } from "./globe.js";

const cityMarkers = [];

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
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color })
    );
    marker.position.copy(pos);
    earthGroup.add(marker);
    cityMarkers.push(marker);
    return pos;
}

export { latLonToVec3, addCityMarker, cityMarkers }; 