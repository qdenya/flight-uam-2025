import * as THREE from 'three';
import { camera, renderer, scene } from '../core/scene.js';
import { airportsManager } from './airports.js';

console.log('Initializing airport interaction...');

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredIndex = null;
let originalColors = null;

// Create info div
const infoDiv = document.createElement('div');
infoDiv.style.position = 'fixed';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoDiv.style.color = 'white';
infoDiv.style.padding = '10px';
infoDiv.style.borderRadius = '5px';
infoDiv.style.display = 'none';
infoDiv.style.fontFamily = 'Arial, sans-serif';
infoDiv.style.fontSize = '14px';
infoDiv.style.pointerEvents = 'none';
infoDiv.style.zIndex = '9999';
infoDiv.style.minWidth = '200px';
infoDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
infoDiv.style.transform = 'translate(-50%, -100%)'; // Center horizontally and position above cursor

document.body.appendChild(infoDiv);

console.log('Info div created and added to document');

function isPointVisible(pointPosition, camera) {
    // Получаем нормаль точки (направление от центра глобуса к точке)
    const normal = pointPosition.clone().normalize();
    
    // Получаем направление от камеры к точке
    const cameraToPoint = pointPosition.clone().sub(camera.position).normalize();
    
    // Если скалярное произведение положительное, значит точка видна
    return normal.dot(cameraToPoint) > 0;
}

function onMouseMove(event) {
    if (!airportsManager.points) {
        console.log('No points available yet');
        return;
    }

    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Устанавливаем параметры рейкастера
    raycaster.params.Points.threshold = 0.1;

    // Calculate objects intersecting the picking ray
    const points = airportsManager.points.children[0];
    const intersects = raycaster.intersectObject(points);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const index = intersect.index;
        const airport = airportsManager.getAirportData(index);
        
        if (airport) {
            // Get the point position in world coordinates
            const pointPosition = new THREE.Vector3();
            pointPosition.fromBufferAttribute(points.geometry.attributes.position, index);

            // Проверяем, видна ли точка
            if (!isPointVisible(pointPosition, camera)) {
                infoDiv.style.display = 'none';
                if (hoveredIndex !== null && originalColors) {
                    const colors = points.geometry.attributes.color.array;
                    colors[hoveredIndex * 3] = originalColors[hoveredIndex * 3];
                    colors[hoveredIndex * 3 + 1] = originalColors[hoveredIndex * 3 + 1];
                    colors[hoveredIndex * 3 + 2] = originalColors[hoveredIndex * 3 + 2];
                    points.geometry.attributes.color.needsUpdate = true;
                    hoveredIndex = null;
                }
                return;
            }

            // Project the point to screen coordinates
            const screenPosition = pointPosition.clone().project(camera);
            
            // Convert to pixel coordinates
            const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

            console.log('Showing info for airport:', airport.nameAirport);
            
            // Show info div
            infoDiv.style.display = 'block';
            
            // Position the info div at the projected point
            infoDiv.style.left = `${x}px`;
            infoDiv.style.top = `${y}px`;
            
            // Update info content
            infoDiv.innerHTML = `
                <strong>${airport.nameAirport}</strong><br>
                IATA: ${airport.codeIataAirport || 'N/A'}<br>
                Country: ${airport.nameCountry}<br>
                Location: ${airport.latitudeAirport.toFixed(2)}°, ${airport.longitudeAirport.toFixed(2)}°<br>
                Timezone: ${airport.timezone || 'N/A'}
            `;

            // Highlight point
            if (hoveredIndex !== index) {
                const colors = points.geometry.attributes.color.array;
                
                // Store original colors if not stored
                if (!originalColors) {
                    originalColors = new Float32Array(colors.length);
                    originalColors.set(colors);
                }

                // Reset previous point color
                if (hoveredIndex !== null) {
                    colors[hoveredIndex * 3] = originalColors[hoveredIndex * 3];
                    colors[hoveredIndex * 3 + 1] = originalColors[hoveredIndex * 3 + 1];
                    colors[hoveredIndex * 3 + 2] = originalColors[hoveredIndex * 3 + 2];
                }

                // Make current point brighter
                colors[index * 3] = Math.min(originalColors[index * 3] * 1.5, 1);
                colors[index * 3 + 1] = Math.min(originalColors[index * 3 + 1] * 1.5, 1);
                colors[index * 3 + 2] = Math.min(originalColors[index * 3 + 2] * 1.5, 1);
                
                points.geometry.attributes.color.needsUpdate = true;
                hoveredIndex = index;
            }
        }
    } else {
        // Hide info div
        infoDiv.style.display = 'none';
        
        // Reset point color if there was a hovered point
        if (hoveredIndex !== null && originalColors) {
            const colors = points.geometry.attributes.color.array;
            colors[hoveredIndex * 3] = originalColors[hoveredIndex * 3];
            colors[hoveredIndex * 3 + 1] = originalColors[hoveredIndex * 3 + 1];
            colors[hoveredIndex * 3 + 2] = originalColors[hoveredIndex * 3 + 2];
            
            points.geometry.attributes.color.needsUpdate = true;
            hoveredIndex = null;
        }
    }
}

// Add event listeners
window.addEventListener('mousemove', onMouseMove);
console.log('Mouse move event listener added');

export { onMouseMove }; 