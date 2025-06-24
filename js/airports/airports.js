// src/airports/airports.js
import * as THREE from 'three';
import { earthGroup } from '../earth/globe.js';
import { latLonToVec3 } from '../earth/latlon.js';

class AirportsManager {
  constructor() {
    this.points = null;
    this.colors = new Map();
    this.defaultColor = 0x808080;
    this.airportsData = [];
    this.radius = 5.05;
  }

  generateColor(countryCode) {
    if (!countryCode) return this.defaultColor;
    
    if (countryCode === 'PL') {
      return 0xff0000; 
    }
    
    if (this.colors.has(countryCode)) return this.colors.get(countryCode);

    let hash = 0;
    for (let i = 0; i < countryCode.length; i++) {
      hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    const color = (r << 16) | (g << 8) | b;

    this.colors.set(countryCode, color);
    return color;
  }

  createPoints(data) {
    console.log('Creating points from data:', data.length, 'records');

    const uniqueAirports = new Map();
    
    data.forEach(airport => {

      // Pomijanie stacji kolejowych
      if (airport.nameAirport && airport.nameAirport.toLowerCase().includes('railway')) {
      return;
      }

      if (!Number.isFinite(airport.latitudeAirport) ||
        !Number.isFinite(airport.longitudeAirport) ||
        airport.latitudeAirport < -90 || airport.latitudeAirport > 90 ||
        airport.longitudeAirport < -180 || airport.longitudeAirport > 180) {
        return;
      }
      const lat = Math.round(airport.latitudeAirport * 10000) / 10000;
      const lon = Math.round(airport.longitudeAirport * 10000) / 10000;
      const key = `${lat},${lon}`;

      if (!uniqueAirports.has(key) || 
        (!uniqueAirports.get(key).codeIataAirport && airport.codeIataAirport)) {
        uniqueAirports.set(key, airport);
      }
    });

    const validAirports = Array.from(uniqueAirports.values());
    console.log('Unique valid airports:', validAirports.length);

    const count = validAirports.length;
    const positions = new Float32Array(count * 3);
    const colorsArr = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    validAirports.forEach((airport, i) => {
      const pos = latLonToVec3(airport.latitudeAirport, airport.longitudeAirport, this.radius);
      positions.set([pos.x, pos.y, pos.z], i * 3);
      originalPositions.set([pos.x, pos.y, pos.z], i * 3);

      const colorHex = this.generateColor(airport.codeIso2Country);
      const color = new THREE.Color(colorHex);
      colorsArr.set([color.r, color.g, color.b], i * 3);
    });

    this.airportsData = validAirports;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));
    geometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });

    const pointsGroup = new THREE.Group();
    const points = new THREE.Points(geometry, material);
    pointsGroup.add(points);

    points.updateMatrix();
    points.updateMatrixWorld(true);
    
    this.points = pointsGroup;
    return pointsGroup;
  }

  loadAirports(data) {
    console.log('Loading airports data...');
    if (this.points) earthGroup.remove(this.points);
    const points = this.createPoints(data);
    earthGroup.add(points);
    console.log('Airports loaded successfully');
  }

  getAirportData(index) {
    return this.airportsData[index];
  }
}

const airportsManager = new AirportsManager();
export { airportsManager };
