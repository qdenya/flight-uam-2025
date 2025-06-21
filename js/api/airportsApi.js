import { airportsManager } from '../airports/airports.js';

const API_KEY = 'b9810f-e890fa';
const BASE_URL = 'https://aviation-edge.com/v2/public';

export async function loadAirports() {
    try {
        console.log('Loading airports data from external API...');
        const response = await fetch(`${BASE_URL}/airportDatabase?key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Airports data received:', data.length, 'airports');
        airportsManager.loadAirports(data);
        console.log('Airports loaded successfully');
    } catch (error) {
        console.error('Error loading airports:', error);
        try {
            console.log('Falling back to local data...');
            const localData = await import('../api/airportDatabase.json');
            airportsManager.loadAirports(localData.default);
            console.log('Local airports loaded successfully');
        } catch (fallbackError) {
            console.error('Error loading local airports:', fallbackError);
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