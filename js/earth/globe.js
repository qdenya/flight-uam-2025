import * as THREE from "three";
import { scene } from "../core/scene.js";

const earthGroup = new THREE.Group();
scene.add(earthGroup);

const textureLoader = new THREE.TextureLoader();

const earthDayTexture = textureLoader.load(
    "assets/textures/earth_day_4096.jpg"
);

const earthNightTexture = textureLoader.load(
    "assets/textures/earth_night_4096.jpg"
);

const globeGeometry = new THREE.SphereGeometry(5, 64, 64);

export const globeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayMap: { value: earthDayTexture },
    nightMap: { value: earthNightTexture },
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform vec3 lightDirection;

    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float lighting = dot(normalize(vNormal), normalize(lightDirection));
      lighting = clamp(lighting, 0.0, 1.0);

      vec4 dayColor = texture2D(dayMap, vUv);
      vec4 nightColor = texture2D(nightMap, vUv);

      gl_FragColor = mix(nightColor, dayColor, lighting);
    }
  `
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
earthGroup.add(globe);




export { earthGroup }; 