import { airportsManager } from '../airports/airports.js';
import { loaderManager } from '../ui/loader.js';
import airportDatabase from './airportDatabase.json';

const API_KEY = 'b9810f-e890fa';
const BASE_URL = 'https://aviation-edge.com/v2/public';

export async function loadAirports() {
    try {
        loaderManager.setText('Ładowanie lotnisk');
        loaderManager.show();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        airportsManager.loadAirports(airportDatabase);
        console.log('Airports loaded successfully');
        
        loaderManager.hide();
    } catch (error) {
        console.error('Error loading airports:', error);
        try {
            console.log('Falling back to local data...');
            loaderManager.setText('Ładowanie lokanlnych danych...');
            const localData = await import('../api/airportDatabase.json');
            airportsManager.loadAirports(localData.default);
            console.log('Local airports loaded successfully');
            loaderManager.hide();
        } catch (fallbackError) {
            console.error('Error loading local airports:', fallbackError);
            loaderManager.setText('Ładowanie lotów nie powiodło się');
            setTimeout(() => {
                loaderManager.hide();
            }, 2000);
        }
    }
}

export async function getFlights(departureIata) {
    try {
        console.log('Loading flights for airport:', departureIata);
        const response = await fetch(`${BASE_URL}/routes?key=${API_KEY}&departureIata=${departureIata}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Flights data received:', data.length, 'flights');
        return data;
    } catch (error) {
        console.error('Error loading flights:', error);
        throw error;
    }
} 