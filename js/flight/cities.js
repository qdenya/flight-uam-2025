import { addCityMarker, latLonToVec3 } from "../earth/latlon.js";
import { createFlight } from "./flight.js";
import * as THREE from "three";

// const warsaw = addCityMarker(52.2297, 21.0122, 0xff0000);
// const london = addCityMarker(51.5074, -0.1278, 0x0000ff);
// const moscow = addCityMarker(55.7558, 37.6173, 0x00ff00);
// const newYork = addCityMarker(40.7128, -74.006, 0xff00ff);
// const tokyo = addCityMarker(35.6762, 139.6503, 0xffff00);
// const sydney = addCityMarker(-33.8688, 151.2093, 0x00ffff);
// const capeTown = addCityMarker(-33.9249, 18.4241, 0x800080);

// const warsawToLondonPoints = [
//     warsaw.clone(),  
//     latLonToVec3(52.0, 15.0, 5.15),  //(широта, долгота, высота)
//     latLonToVec3(51.8, 13.0, 5.20),  
//     latLonToVec3(51.7, 6.0, 5.20),  
//     latLonToVec3(51.6, 5.0, 5.15),   
//     london.clone()   
// ];

// createFlight(warsaw, london, 0xff9900, warsawToLondonPoints);  
// createFlight(warsaw, moscow, 0xffcc00); 
// createFlight(warsaw, newYork, 0xcc66ff);
// createFlight(warsaw, tokyo, 0x00ccff);
// createFlight(warsaw, sydney, 0x33ff99);
// createFlight(warsaw, capeTown, 0xff3399); 