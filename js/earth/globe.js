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

const shadowSphere = new THREE.Mesh(
    globeGeometry,
    new THREE.ShadowMaterial({
        opacity: 0.3,
    })
);
shadowSphere.receiveShadow = true;
shadowSphere.scale.set(1.001, 1.001, 1.001);
earthGroup.add(shadowSphere);

export const globeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        dayMap: { value: earthDayTexture },
        nightMap: { value: earthNightTexture },
        normalMap: { value: earthNormalTexture },
        roughnessMap: { value: earthRoughnessTexture },
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        roughness: { value: 0.4 },
        metalness: { value: 0.3 },
        specularStrength: { value: 0.5 },
        shininess: { value: 184.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying mat3 vTBN;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec3 pos = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vViewPosition = -pos;
            
            vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
            vec3 bitangent = normalize(cross(normal, tangent));
            vTBN = mat3(tangent, bitangent, normal);
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform sampler2D normalMap;
        uniform sampler2D roughnessMap;
        uniform vec3 lightDirection;
        uniform float roughness;
        uniform float metalness;
        uniform float specularStrength;
        uniform float shininess;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying mat3 vTBN;
        
        void main() {
            vec3 normal = normalize(vNormal);
            vec3 normalTex = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
            normal = normalize(vTBN * normalTex);
            
            float NdotL = max(dot(normal, lightDirection), 0.0);
            
            vec4 dayColor = texture2D(dayMap, vUv);
            vec4 nightColor = texture2D(nightMap, vUv);

            float transition = smoothstep(0.0, 0.3, NdotL);
            vec3 finalColor = mix(nightColor.rgb, dayColor.rgb, transition);
            
            // Add some ambient light to prevent complete darkness
            finalColor += nightColor.rgb * 0.1;
            
            vec3 viewDir = normalize(vViewPosition);
            vec3 lightDir = normalize(lightDirection);
            vec3 halfDir = normalize(lightDir + viewDir);
            float spec = pow(max(dot(normal, halfDir), 0.0), shininess);

            spec *= step(0.01, NdotL);
            finalColor += specularStrength * spec * vec3(1.0, 0.95, 0.8);
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `,
    lights: false
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
