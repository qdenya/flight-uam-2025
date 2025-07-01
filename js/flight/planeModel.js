import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { scene } from "../core/scene.js";

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const trailTexture = textureLoader.load(
    "assets/model/mask.png"
);

export function loadPlaneModel(callback) {
    loader.load(
        "assets/model/boeing_777_airplane.glb",
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.0001, 0.0001, 0.0001);
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        metalness: 0.7,
                        roughness: 0.2,
                        envMap: scene.environment || null,
                        envMapIntensity: 1.2,
                        clearcoat: 0.3,
                        transparent: false
                    });
                }
            });

            const trail = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.2),
                new THREE.MeshPhysicalMaterial({
                    envMap: scene.environment || null,
                    envMapIntensity: 3,
                    roughness: 0.4,
                    metalness: 0,
                    transmission: 1,
                    transparent: true,
                    opacity: 0.4,
                    alphaMap: trailTexture,
                    side: THREE.DoubleSide,
                })
            );
            
            trail.rotateX(Math.PI / 2); 
            trail.rotateZ(Math.PI); 
            trail.position.x = 0.17; 
            trail.position.y = 0.1;
            
            const group = new THREE.Group();
            group.add(model);
            group.add(trail);
            
            group.updateTrail = function(position, rotation) {
                trail.position.copy(position);
                trail.quaternion.copy(rotation);
            };

            callback(group);
        },
        undefined,
        (error) => {
            console.error(error);
        }
    );
}
