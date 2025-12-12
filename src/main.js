import './style.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentWeather } from './modules/weather';
import { getLocationInfo } from './modules/location';

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

var map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var popup = L.popup();

async function onMapClick(e) {

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    let location = await getLocationInfo(lat, lng);

    getCurrentWeather(lat, lng)
        .then(weather => {
            let isDay = "Day";

            if(weather.is_day === 0) {
                isDay = "Night";
            }

            const content = `<h2>${location.country}</h2><br>
                             City: ${location.city || location.town || location.village || 'N/A'}<br>
                             It is currently ${isDay}<br>
                             Temperature: ${weather.temperature}°C<br>
                             Windspeed: ${weather.windspeed} km/h`;
            popup
                .setLatLng(e.latlng)
                .setContent(content)
                .openOn(map);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

map.on('click', onMapClick);
