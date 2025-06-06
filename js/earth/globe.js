import * as THREE from "three";
import { scene } from "../core/scene.js";

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
);

const globe = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshPhongMaterial({ map: earthTexture })
);
earthGroup.add(globe);

export { earthGroup }; 