import * as THREE from 'three';

function createSkybox() {
    const loader = new THREE.CubeTextureLoader();
    loader.setPath('/assets/skybox/');

    const texture = loader.load([
        'right.jpg',  
        'left.jpg',   
        'top.jpg',   
        'bottom.jpg',
        'front.jpg',  
        'back.jpg'  
    ]);

    return texture;
}

export { createSkybox }; 