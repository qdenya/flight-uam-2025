import { GUI } from 'dat.gui';
import { scene, camera } from "../core/scene.js";
import { flights } from "../flight/flight.js";
import { cityMarkers } from "../earth/latlon.js";

class Controls {
    constructor() {
        this.flightSpeed = 0.002;
        this.showCities = true;
        this.showFlights = true;
        this.cameraDistance = 12;
        this.rotationSpeed = 0.5;
        this.autoRotate = false;
        this.sunRotation = 0; 

    }
}

const controls = new Controls();
const gui = new GUI();

const mainFolder = gui.addFolder('Ustawienia główne');
mainFolder.add(controls, 'flightSpeed', 0.001, 0.01).name('Prędkość lotu').onChange((value) => {
    flights.forEach(flight => {
        flight.speed = value;
    });
});

mainFolder.add(controls, 'cameraDistance', 6, 50).name('Odległość kamery').onChange((value) => {
    camera.position.z = value;
});

mainFolder.add(controls, 'rotationSpeed', 0, 2).name('Prędkość obrotu');
mainFolder.add(controls, 'autoRotate').name('Auto obrót');
mainFolder.add(controls, 'sunRotation', -Math.PI, Math.PI).name('Pozycja Słońca');


const displayFolder = gui.addFolder('Wyświetlanie');
displayFolder.add(controls, 'showCities').name('Pokaż miasta').onChange((value) => {
    cityMarkers.forEach(marker => {
        marker.visible = value;
    });
});

displayFolder.add(controls, 'showFlights').name('Pokaż loty').onChange((value) => {
    flights.forEach(flight => {
        flight.visible = value;
        if (flight.plane) flight.plane.visible = value;
        if (flight.tube) flight.tube.visible = value;
    });
});


mainFolder.open();
displayFolder.open();

export { controls, gui };

