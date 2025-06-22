import { GUI } from "dat.gui";
import * as THREE from "three";
import { scene, camera, debugCamera } from "../core/scene.js";
import { flights } from "../flight/flight.js";
import { cityMarkers } from "../earth/latlon.js";
import { airportsManager } from "../airports/airports.js";
import { showAirportInfo } from "../airports/interaction.js";
import { getFlights } from "../api/airportsApi.js";
import { loaderManager } from "./loader.js";
import { clearAllFlights, createFlight } from "../flight/flight.js";
import { latLonToVec3 } from "../earth/latlon.js";
import { showInfoMsg } from "../airports/interaction.js";

class Controls {
    constructor() {
        this.flightSpeed = 0.002;
        this.showCities = true;
        this.showFlights = true;
        this.cameraDistance = 12;
        this.rotationSpeed = 0.5;
        this.autoRotate = false;
        this.sunRotation = 0;
        this.isDebugMode = false;
    }
}

const controls = new Controls();
const gui = new GUI();

const mainFolder = gui.addFolder("Ustawienia główne");
mainFolder
    .add(controls, "flightSpeed", 0.001, 0.01)
    .name("Prędkość lotu")
    .onChange((value) => {
        flights.forEach((flight) => {
            flight.speed = value;
        });
    });

mainFolder
    .add(controls, "cameraDistance", 6, 50)
    .name("Odległość kamery")
    .onChange((value) => {
        camera.position.z = value;
    });

// mainFolder.add(controls, "rotationSpeed", 0, 2).name("Prędkość obrotu");
// mainFolder.add(controls, "autoRotate").name("Auto obrót");
mainFolder
    .add(controls, "sunRotation", -Math.PI, Math.PI)
    .name("Pozycja Słońca");

const displayFolder = gui.addFolder("Wyświetlanie");
displayFolder
    .add(controls, "showCities")
    .name("Pokaż miasta")
    .onChange((value) => {
        cityMarkers.forEach((marker) => {
            marker.visible = value;
        });
        if (airportsManager.points) {
            airportsManager.points.visible = value;
        }
    });

displayFolder
    .add(controls, "showFlights")
    .name("Pokaż loty")
    .onChange((value) => {
        flights.forEach((flight) => {
            flight.visible = value;
            if (flight.plane) flight.plane.visible = value;
            if (flight.tube) flight.tube.visible = value;
        });
    });

displayFolder
    .add(controls, "isDebugMode")
    .name("Debug kamery")
    .onChange((value) => {
        if (value) {
            scene.add(debugCamera);
        } else {
            scene.remove(debugCamera);
        }
    });

mainFolder.open();
displayFolder.open();

setTimeout(() => {
    const guiDom = gui.domElement;
    const searchDiv = document.createElement('div');
    searchDiv.style.margin = '10px 0';
    searchDiv.style.display = 'flex';
    searchDiv.style.flexDirection = 'column';
    searchDiv.style.gap = '6px';

    const inputWrap = document.createElement('div');
    inputWrap.style.position = 'relative';
    inputWrap.style.width = '100%';
    inputWrap.style.display = 'flex';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Wyszukaj lotnisko';
    input.style.fontSize = '16px';
    input.style.padding = '4px 8px';
    input.style.borderRadius = '4px';
    input.style.width = '100%';

    const dropdown = document.createElement('div');
    dropdown.style.position = 'absolute';
    dropdown.style.left = '0';
    dropdown.style.top = '100%';
    dropdown.style.marginTop = '2px';
    dropdown.style.background = 'white';
    dropdown.style.color = 'black';
    dropdown.style.zIndex = '10001';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.border = '1px solid #ccc';
    dropdown.style.width = '100%';
    dropdown.style.display = 'none';
    dropdown.style.fontSize = '16px';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

    let selectedAirportIata = null;
    let lastResults = [];

    function showDropdown(results) {
        dropdown.innerHTML = '';
        if (!results.length) {
            dropdown.style.display = 'none';
            return;
        }
        results.forEach(airport => {
            const item = document.createElement('div');
            item.textContent = `${airport.codeIataAirport} — ${airport.nameAirport} (${airport.nameCountry || airport.codeIso2Country})`;
            item.style.padding = '6px 10px';
            item.style.cursor = 'pointer';
            item.onmouseenter = () => item.style.background = '#eee';
            item.onmouseleave = () => item.style.background = 'white';
            item.onclick = () => {
                input.value = `${airport.codeIataAirport} — ${airport.nameAirport}`;
                selectedAirportIata = airport.codeIataAirport;
                showAirportInfo(airport);
                dropdown.style.display = 'none';
            };
            dropdown.appendChild(item);
        });
        dropdown.style.display = 'block';
    }

    input.addEventListener('input', () => {
        const value = input.value.trim().toLowerCase();
        if (!value) {
            showDropdown([]);
            selectedAirportIata = null;
            return;
        }

        const results = airportsManager.airportsData.filter(a =>
            (a.codeIataAirport && a.codeIataAirport.toLowerCase().includes(value)) ||
            (a.nameAirport && a.nameAirport.toLowerCase().includes(value))
        ).slice(0, 20);
        lastResults = results;
        showDropdown(results);
    });
    input.addEventListener('focus', () => {
        if (lastResults.length) showDropdown(lastResults);
    });
    input.addEventListener('blur', () => {
        setTimeout(() => dropdown.style.display = 'none', 200);
    });

    const btn = document.createElement('button');
    btn.textContent = 'Pokaż loty';
    btn.style.fontSize = '16px';
    btn.style.padding = '4px 8px';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';

    const infoMsg = document.createElement('div');
    infoMsg.style.color = 'red';
    infoMsg.style.fontSize = '15px';
    infoMsg.style.marginTop = '6px';
    infoMsg.style.display = 'none';

    btn.onclick = async () => {
        infoMsg.style.display = 'none';
        infoMsg.textContent = '';
        if (!selectedAirportIata) return;
        const airport = airportsManager.airportsData.find(a => a.codeIataAirport === selectedAirportIata);
        if (!airport) return;
        clearAllFlights();
        loaderManager.setText(`Ładowanie lotów z ${airport.nameAirport}...`);
        loaderManager.show();
        try {
            const routes = await getFlights(airport.codeIataAirport);
            if (!Array.isArray(routes) || routes.success === false || routes.error) {
                loaderManager.hide();
                showInfoMsg('Brak lotów dla wybranego lotniska');
                return;
            }
            const uniqueRoutes = new Map();
            routes.forEach(route => {
                const routeKey = `${route.departureIata}-${route.arrivalIata}`;
                if (!uniqueRoutes.has(routeKey)) {
                    uniqueRoutes.set(routeKey, route);
                }
            });
            if (uniqueRoutes.size === 0) {
                showInfoMsg('Brak lotów dla wybranego lotniska');
            }
            uniqueRoutes.forEach(route => {
                const fromAirport = airport;
                const toAirport = airportsManager.airportsData.find(a => a.codeIataAirport === route.arrivalIata);
                if (!toAirport) return;
                const fromVec = latLonToVec3(fromAirport.latitudeAirport, fromAirport.longitudeAirport, 5.05);
                const toVec = latLonToVec3(toAirport.latitudeAirport, toAirport.longitudeAirport, 5.05);
                createFlight(fromVec, toVec);
            });
            loaderManager.hide();
        } catch (error) {
            loaderManager.setText('Ошибка загрузки рейсов');
            setTimeout(() => loaderManager.hide(), 2000);
        }
    };

    inputWrap.appendChild(input);
    inputWrap.appendChild(dropdown);
    searchDiv.appendChild(inputWrap);
    searchDiv.appendChild(btn);
    searchDiv.appendChild(infoMsg);
    guiDom.insertBefore(searchDiv, guiDom.firstChild);
}, 500);

export { controls, gui };
