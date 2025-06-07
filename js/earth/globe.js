import * as THREE from "three";
import { scene, camera } from "../core/scene.js";
import { createClouds } from "./clouds.js";
import { createAtmosphere } from "../earth/atmosphereShader.js";

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const textureLoader = new THREE.TextureLoader();

const earthDayTexture = textureLoader.load(
    "assets/textures/earth_day_4096.jpg"
);
const earthNightTexture = textureLoader.load(
    "assets/textures/earth_night_4096.jpg"
);
const earthNormalTexture = textureLoader.load(
    "assets/textures/earth_normal_2048.jpg"
);
const earthRoughnessTexture = textureLoader.load(
    "assets/textures/earth_bump_roughness_clouds_4096.jpg"
);

const globeGeometry = new THREE.SphereGeometry(5, 64, 64);

// const shadowSphere = new THREE.Mesh(
//     globeGeometry,
//     new THREE.ShadowMaterial({
//         opacity: 1.0,
//     })
// );
// shadowSphere.receiveShadow = true;
// shadowSphere.scale.set(1.005, 1.005, 1.005); // Чуть больше
// или наоборот:
// shadowSphere.scale.set(0.999, 0.999, 0.999);

// earthGroup.add(shadowSphere);

export const globeMaterial = new THREE.MeshStandardMaterial({
    map: earthDayTexture,
    normalMap: earthNormalTexture,
    roughnessMap: earthRoughnessTexture,
    roughness: 10.5,
    metalness: 0.1,
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
globe.castShadow = true;
globe.receiveShadow = true;
earthGroup.add(globe);

const atmosphere = createAtmosphere();
earthGroup.add(atmosphere);

const clouds = createClouds();
earthGroup.add(clouds);

export { earthGroup, atmosphere, clouds };
