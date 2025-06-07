import * as THREE from "three";

export function createClouds(
    textureUrl = "assets/textures/earth_clouds_1024.png"
) {
    const cloudTexture = new THREE.TextureLoader().load(textureUrl);

    const geometry = new THREE.SphereGeometry(5.05, 64, 64);
    const material = new THREE.MeshLambertMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "clouds";

    return mesh;
}
