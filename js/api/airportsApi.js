import data from '../api/airportDatabase.json';
import { airportsManager } from '../airports/airports.js';

/**
 * Загружает данные аэропортов и добавляет их в одну Points-геометрию для оптимизации
 */
export function loadAirports() {
    try {
        console.log('Loading airports data...');
        airportsManager.loadAirports(data);
        console.log('Airports loaded successfully');
    } catch (error) {
        console.error('Error loading airports:', error);
    }
} 