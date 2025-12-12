export async function getLocationInfo(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.address;
}