import * as THREE from 'three';
import { camera, renderer, scene } from '../core/scene.js';
import { airportsManager } from './airports.js';

console.log('Initializing airport interaction...');

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredIndex = null;
let originalColors = null;

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
infoDiv.style.transform = 'translate(-50%, -100%)'; 

document.body.appendChild(infoDiv);

console.log('Info div created and added to document');

function isPointVisible(pointPosition, camera) {
    const cameraToPoint = pointPosition.clone().sub(camera.position).normalize();
    const sphereNormal = pointPosition.clone().normalize();
    
    const dotProduct = cameraToPoint.dot(sphereNormal);
    const isOnVisibleSide = dotProduct < 0;
    
    console.log('Dot product:', dotProduct, 'isOnVisibleSide:', isOnVisibleSide);
    
    if (!isOnVisibleSide) {
        return false;
    }

    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const angleToPoint = cameraDirection.angleTo(cameraToPoint);
    
    const maxAngle = (camera.fov * Math.PI / 180) / 2 + 0.1; 
    
    const isInFieldOfView = angleToPoint < maxAngle;
    console.log('Angle to point:', angleToPoint, 'maxAngle:', maxAngle, 'isInFieldOfView:', isInFieldOfView);
    
    return isInFieldOfView;
}

function onMouseMove(event) {
    if (!airportsManager.points) {
        console.log('No points available yet');
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    raycaster.params.Points.threshold = 0.1;

    const points = airportsManager.points.children[0];
    const intersects = raycaster.intersectObject(points);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const index = intersect.index;
        const airport = airportsManager.getAirportData(index);
        
        if (airport) {
            const pointPosition = new THREE.Vector3();
            pointPosition.fromBufferAttribute(points.geometry.attributes.position, index);

            if (!isPointVisible(pointPosition, camera)) {
                console.log('Point not visible:', airport.nameAirport, 'at', airport.latitudeAirport, airport.longitudeAirport);
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

            console.log('Point visible:', airport.nameAirport, 'at', airport.latitudeAirport, airport.longitudeAirport);
            const screenPosition = pointPosition.clone().project(camera);
            
            const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-screenPosition.y * 0.5 + 0.5) * window.innerHeight;

            console.log('Showing info for airport:', airport.nameAirport);
            
            infoDiv.style.display = 'block';
            
            infoDiv.style.left = `${x}px`;
            infoDiv.style.top = `${y}px`;

            infoDiv.innerHTML = `
                <strong>${airport.nameAirport}</strong><br>
                IATA: ${airport.codeIataAirport || 'N/A'}<br>
                Country: ${airport.nameCountry}<br>
                Location: ${airport.latitudeAirport.toFixed(2)}°, ${airport.longitudeAirport.toFixed(2)}°<br>
                Timezone: ${airport.timezone || 'N/A'}
            `;

            if (hoveredIndex !== index) {
                const colors = points.geometry.attributes.color.array;
                
                if (!originalColors) {
                    originalColors = new Float32Array(colors.length);
                    originalColors.set(colors);
                }

                if (hoveredIndex !== null) {
                    colors[hoveredIndex * 3] = originalColors[hoveredIndex * 3];
                    colors[hoveredIndex * 3 + 1] = originalColors[hoveredIndex * 3 + 1];
                    colors[hoveredIndex * 3 + 2] = originalColors[hoveredIndex * 3 + 2];
                }

                colors[index * 3] = Math.min(originalColors[index * 3] * 1.5, 1);
                colors[index * 3 + 1] = Math.min(originalColors[index * 3 + 1] * 1.5, 1);
                colors[index * 3 + 2] = Math.min(originalColors[index * 3 + 2] * 1.5, 1);
                
                points.geometry.attributes.color.needsUpdate = true;
                hoveredIndex = index;
            }
        }
    } else {
        infoDiv.style.display = 'none';

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

window.addEventListener('mousemove', onMouseMove);
console.log('Mouse move event listener added');

export { onMouseMove }; 