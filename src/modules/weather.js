const url = 'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true';

export async function getCurrentWeather(lat, lng) {
    const response = await fetch(url.replace('{lat}', lat).replace('{lng}', lng));
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    return data.current_weather;
}