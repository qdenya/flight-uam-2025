import * as THREE from "three";

export function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(5.55, 64, 64); 

    const material = new THREE.ShaderMaterial({
        uniforms: {
            lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
            atmosphereColor: { value: new THREE.Color(0x3399ff) },
            intensity: { value: 0.05 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            uniform vec3 lightDirection;
            uniform vec3 atmosphereColor;
            uniform float intensity;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                
                float sunInfluence = max(dot(normal, lightDirection), 0.0);
                
                float rim = 1.0 - max(dot(viewDir, normal), 0.0);
                float glow = pow(rim, 3.5);
                
                // Комбинируем эффекты
                float finalGlow = glow * (0.1 + 0.5 * sunInfluence);
                
                vec3 finalColor = atmosphereColor * finalGlow * intensity;
                gl_FragColor = vec4(finalColor, finalGlow);
            }
        `,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide
    });

    return new THREE.Mesh(geometry, material);
}
