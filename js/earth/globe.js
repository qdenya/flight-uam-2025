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

export const globeMaterial = new THREE.ShaderMaterial({
    uniforms: {
        dayMap: { value: earthDayTexture },
        nightMap: { value: earthNightTexture },
        normalMap: { value: earthNormalTexture },
        roughnessMap: { value: earthRoughnessTexture },
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
        cameraPosition: { value: camera.position },
        roughness: { value: 0.4 },
        metalness: { value: 0.3 },
        ambientLight: { value: new THREE.Color(0.25, 0.25, 0.3) },
        lightColor: { value: new THREE.Color(1.0, 0.95, 0.85) },
        saturation: { value: 1.2 },
        contrast: { value: 1.4 },
        colorBoost: { value: new THREE.Vector3(0.6, 0.6, 0.7) }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying mat3 vTBN;
        varying vec3 vWorldPosition;
    
        uniform sampler2D normalMap;
    
        void main() {
            vUv = uv;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
            vec3 objectNormal = normalize(normal);
            vec3 pos = (modelViewMatrix * vec4(position, 1.0)).xyz;
            vViewPosition = -pos;
    
            // Tangent space approximation
            vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
            vec3 bitangent = normalize(cross(objectNormal, tangent));
            vTBN = mat3(tangent, bitangent, objectNormal);
    
            vNormal = normalize(normalMatrix * objectNormal);
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
        uniform vec3 ambientLight;
        uniform vec3 lightColor;
        uniform float saturation;
        uniform float contrast;
        uniform vec3 colorBoost;
    
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying mat3 vTBN;
        varying vec3 vWorldPosition;
    
        const float PI = 3.14159265359;
    
        vec3 adjustSaturation(vec3 color, float saturation) {
            float grey = dot(color, vec3(0.2126, 0.7152, 0.0722));
            return mix(vec3(grey), color, saturation);
        }
    
        vec3 adjustContrast(vec3 color, float contrast) {
            return 0.5 + (contrast * (color - 0.5));
        }
    
        vec3 getNormal() {
            vec3 normalTex = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
            return normalize(vTBN * normalTex);
        }
    
        float DistributionGGX(vec3 N, vec3 H, float roughness) {
            float a = roughness * roughness;
            float a2 = a * a;
            float NdotH = max(dot(N, H), 0.0);
            float NdotH2 = NdotH * NdotH;
    
            float num = a2;
            float denom = (NdotH2 * (a2 - 1.0) + 1.0);
            denom = PI * denom * denom;
    
            return num / denom;
        }
    
        float GeometrySchlickGGX(float NdotV, float roughness) {
            float r = (roughness + 1.0);
            float k = (r * r) / 8.0;
            return NdotV / (NdotV * (1.0 - k) + k);
        }
    
        float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
            float NdotV = max(dot(N, V), 0.0);
            float NdotL = max(dot(N, L), 0.0);
            float ggx2 = GeometrySchlickGGX(NdotV, roughness);
            float ggx1 = GeometrySchlickGGX(NdotL, roughness);
            return ggx1 * ggx2;
        }
    
        vec3 fresnelSchlick(float cosTheta, vec3 F0) {
            return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
        }
    
        void main() {
            vec3 N = getNormal();
            vec3 V = normalize(vViewPosition);
            vec3 L = normalize(lightDirection);
            vec3 H = normalize(V + L);
    
            float roughnessValue = roughness * texture2D(roughnessMap, vUv).r;
            float NDF = DistributionGGX(N, H, roughnessValue);
            float G = GeometrySmith(N, V, L, roughnessValue);
            vec3 F0 = vec3(0.04);
            F0 = mix(F0, vec3(1.0), metalness);
            vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
            vec3 numerator = NDF * G * F;
            float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
            vec3 specular = numerator / denominator;
    
            float NdotL = max(dot(N, L), 0.0);
            vec3 kS = F;
            vec3 kD = vec3(1.0) - kS;
            kD *= 1.0 - metalness;
    
            vec4 dayColor = texture2D(dayMap, vUv);
            vec4 nightColor = texture2D(nightMap, vUv);
            
            vec3 enhancedDayColor = adjustSaturation(dayColor.rgb, saturation);
            enhancedDayColor = adjustContrast(enhancedDayColor, contrast);
            
            enhancedDayColor *= colorBoost;
            
            vec3 albedo = mix(nightColor.rgb, enhancedDayColor, NdotL);
    
            vec3 Lo = (kD * albedo / PI + specular) * NdotL * lightColor;
            vec3 ambient = ambientLight * albedo;
            vec3 color = ambient + Lo;
    
            // HDR tonemapping
            color = color / (color + vec3(1.0));
            // Gamma correction
            color = pow(color, vec3(1.0/2.2));
    
            gl_FragColor = vec4(color, 1.0);
        }
    `,
    lights: false,
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
earthGroup.add(globe);

const atmosphere = createAtmosphere();
earthGroup.add(atmosphere);

const clouds = createClouds();
earthGroup.add(clouds);

export { earthGroup, atmosphere, clouds };
