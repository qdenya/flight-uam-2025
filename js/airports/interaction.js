import * as THREE from 'three';
import { camera, renderer, scene } from '../core/scene.js';
import { airportsManager } from './airports.js';
import { getFlights } from '../api/airportsApi.js';
import { latLonToVec3 } from '../earth/latlon.js';
import { createFlight, clearAllFlights } from '../flight/flight.js';
import { loaderManager } from '../ui/loader.js';

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
                Kraj: ${airport.nameCountry}<br>
                Lokalizacja: ${airport.latitudeAirport.toFixed(2)}°, ${airport.longitudeAirport.toFixed(2)}°<br>
                Strefa czasowa: ${airport.timezone || 'N/A'}<br>
                <em style="color: #aaa; font-size: 12px;">Kliknij dwukrotnie, aby wyświetlić loty</em>
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

function onAirportClick(event) {
    if (!airportsManager.points) return;

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    raycaster.params.Points.threshold = 0.1;

    const points = airportsManager.points.children[0];
    const intersects = raycaster.intersectObject(points);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        const index = intersect.index;
        const airport = airportsManager.getAirportData(index);
        if (!airport || !airport.codeIataAirport) return;

        const pointPosition = new THREE.Vector3();
        pointPosition.fromBufferAttribute(points.geometry.attributes.position, index);

        if (!isPointVisible(pointPosition, camera)) {
            console.log('Clicked on invisible airport, ignoring');
            return;
        }

        clearAllFlights();

        console.log('Loading flights for airport:', airport.nameAirport, '(', airport.codeIataAirport, ')');

        loaderManager.setText(`Ładowanie lotów z ${airport.nameAirport}...`);
        loaderManager.show();

        getFlights(airport.codeIataAirport).then(routes => {
            if (!Array.isArray(routes)) {
                loaderManager.hide();
                return;
            }
            
            const uniqueRoutes = new Map();
            
            routes.forEach(route => {
                const routeKey = `${route.departureIata}-${route.arrivalIata}`;
                
                if (!uniqueRoutes.has(routeKey)) {
                    uniqueRoutes.set(routeKey, route);
                }
            });
            
            console.log(`Found ${routes.length} total routes, showing ${uniqueRoutes.size} unique routes`);
            
            uniqueRoutes.forEach(route => {
                const fromAirport = airport;
                const toAirport = airportsManager.airportsData.find(a => a.codeIataAirport === route.arrivalIata);
                if (!toAirport) return;
                
                const fromVec = latLonToVec3(fromAirport.latitudeAirport, fromAirport.longitudeAirport, 5.05);
                const toVec = latLonToVec3(toAirport.latitudeAirport, toAirport.longitudeAirport, 5.05);

                createFlight(fromVec, toVec);
            });

            loaderManager.hide();
        }).catch(error => {
            console.error('Error loading flights:', error);
            loaderManager.setText('Ошибка загрузки рейсов');
            setTimeout(() => {
                loaderManager.hide();
            }, 2000);
        });
    }
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('dblclick', onAirportClick);
console.log('Mouse move and double-click event listeners added');

export { onMouseMove, onAirportClick }; 