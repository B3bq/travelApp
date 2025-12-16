import './style.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentWeather } from './modules/weather';
import { getLocationInfo } from './modules/location';
import { weatherCodes, weatherIcons } from './modules/weatherCodes';

let goals = [];
const divList = document.createElement('div');

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
            let isDay = 'Day';

            if(weather.is_day === 0) {
                isDay = "Night";
            }

            const content = `<h2>${location.country}</h2><br>
                             <h4>${weatherCodes[weather.weathercode]} ${weatherIcons[weather.weathercode]?.[isDay == "Day" ? "day": "night"]}</h4><br>
                             Miasto: ${location.city || location.town || location.village || 'N/A'}<br>
                             Aktualnie jest ${isDay == "Day" ? "Dzień" : "Noc"}<br>
                             Temperatura: ${weather.temperature}°C<br>
                             Prędkość wiatru: ${weather.windspeed} km/h<br>
                             <button id="addToList">Dodaj do listy miejsc do odwiedzenia</button>`;
            
            map.once('popupopen', () => {
                const btn = document.getElementById('addToList');
                if (!btn) return;

                btn.addEventListener('click', () => {
                    goals.push({
                        country: location.country,
                        city: location.city || location.town || location.village || 'N/A',
                        latitude: lat,
                        longitude: lng,
                        weather: weatherCodes[weather.weathercode],
                        temperature: weather.temperature
                    });
                    divList.innerHTML = '<h2>Lista miejsc do odwiedzenia:</h2>';
                    goals.forEach(goal => {
                        const goalItem = document.createElement('div');
                        goalItem.className = 'goal-item';
                        goalItem.innerHTML = `
                            <h3>${goal.city}, ${goal.country}</h3>
                            <p>Pogoda: ${goal.weather}, ${goal.temperature}°C</p>
                        `;
                        divList.appendChild(goalItem);
                    });
                    app.appendChild(divList);
                });
            });

            
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
