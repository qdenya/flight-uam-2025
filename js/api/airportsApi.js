import data from '../api/airportDatabase.json';
import { airportsManager } from '../airports/airports.js';

export function loadAirports() {
    try {
        console.log('Loading airports data...');
        airportsManager.loadAirports(data);
        console.log('Airports loaded successfully');
    } catch (error) {
        console.error('Error loading airports:', error);
    }
} 