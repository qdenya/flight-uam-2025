import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;

function updateCameraPosition() {
    const width = window.innerWidth;
    
    if (width <= 600) { 
        camera.position.set(0, 15, 20);  
        controls.minDistance = 8;
        controls.maxDistance = 15;

        scene.position.y = -4;
    } else if (width <= 1024) { 
        camera.position.set(0, 10, 20);  
        controls.minDistance = 10;
        controls.maxDistance = 30;
    } else { // Десктоп
        camera.position.set(0, 8, 15);  
        controls.minDistance = 12;
        controls.maxDistance = 40;
    }
}

updateCameraPosition();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition();
});

export { scene, camera, renderer, controls }; 