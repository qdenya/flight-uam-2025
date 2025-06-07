import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

const loader = new GLTFLoader();

export function loadPlaneModel(callback) {
    loader.load(
        "assets/model/boeing_777_airplane.glb",
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.0001, 0.0001, 0.0001);
            callback(model);
        },
        undefined,
        (error) => {
            console.error(error);
        }
    );
}
