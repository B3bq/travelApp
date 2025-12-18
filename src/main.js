import './style.css'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentWeather } from './modules/weather';
import { getLocationInfo } from './modules/location';
import { weatherCodes, weatherIcons } from './modules/weatherCodes';

let goals = [];
const btnArrow = document.createElement('button');
btnArrow.id = 'openList';
btnArrow.textContent = '🢀';
btnArrow.addEventListener('click', () => {
    const divList = document.getElementById('goalsList');
    divList.classList.add('show');
    btnArrow.classList.remove('show');
});
app.appendChild(btnArrow);
const divList = document.createElement('div');
divList.id = 'goalsList';
const header = document.createElement('header');
const arrow = document.createElement('button');
arrow.id = 'closeList';
arrow.textContent = '🢂';
arrow.addEventListener('click', () => {
    divList.classList.remove('show');
    btnArrow.classList.add('show');
});
header.appendChild(arrow);
const headerH2 = document.createElement('h2');
headerH2.textContent = 'Lista miejsc do odwiedzenia:';
header.appendChild(headerH2);
const goalsContainer = document.createElement('div');
goalsContainer.id = 'goalsContainer';
divList.appendChild(header);
divList.appendChild(goalsContainer);

function countryCodeToFlag(code) {
  return code
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt())
    );
}

var map = L.map('map').setView([0, 0], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var popup = L.popup();

async function onMapClick(e) {

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    let location = await getLocationInfo(lat, lng);
    console.log(location);

    getCurrentWeather(lat, lng)
        .then(weather => {
            let isDay = 'Day';

            if(weather.is_day === 0) {
                isDay = "Night";
            }

            const content = `<h2>${location.city || location.town || location.village || 'N/A'}, ${location.country} ${countryCodeToFlag(location.country_code)}</h2>
                             <h3>${weatherCodes[weather.weathercode]} ${weatherIcons[weather.weathercode]?.[isDay == "Day" ? "day": "night"]}</h3><br>
                             Aktualnie jest ${isDay == "Day" ? "Dzień" : "Noc"}<br>
                             Temperatura: ${weather.temperature}°C<br>
                             Prędkość wiatru: ${weather.windspeed} km/h<br><br>
                             <button id="addToList">Dodaj do listy miejsc do odwiedzenia</button>`;
            
            map.once('popupopen', () => {
                const btn = document.getElementById('addToList');
                if (!btn) return;

                btn.addEventListener('click', () => {
                    goals.push({
                        country: location.country,
                        city: location.city || location.town || location.village || 'N/A',
                        country_code: location.country_code,    
                        latitude: lat,
                        longitude: lng,
                        weather: weatherCodes[weather.weathercode],
                        temperature: weather.temperature,
                        note: ''
                    });
                    goalsContainer.innerHTML = '';
                    goals.forEach((goal, index) => {
                        const goalItem = document.createElement('div');
                        goalItem.className = 'goal-item';
                        goalItem.innerHTML = `
                            <h3>${goal.city}, ${goal.country} ${countryCodeToFlag(goal.country_code)}</h3>
                            <p>Pogoda: ${goal.weather}, ${goal.temperature}°C</p>
                            <input type='text' placeholder='Notatki... ' value="${goal.note || ''}"/>
                        `;

                        const input = goalItem.querySelector('input');
                        input.addEventListener('input', (e) => {
                            goals[index].note = e.target.value;
                        });

                        goalsContainer.appendChild(goalItem);
                    });
                    btnArrow.classList.remove('show');
                    divList.classList.add('show');
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
