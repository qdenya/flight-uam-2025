import "./core/scene.js";
import "./core/lights.js";
import "./earth/globe.js";
import "./earth/latlon.js";
import "./flight/flight.js";
import "./flight/cities.js";
import "./ui/gui.js";
import { animate } from "./animation/animate.js";
import {loadAirports} from  "./api/airportsApi.js";
import "./airports/interaction.js";

loadAirports();
animate();
