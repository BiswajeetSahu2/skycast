import { spawnPokemon } from "./pokemon.js";
import { addToRecents } from "./storage.js";

const apiKey = "080ad6a80a7585356ea43862e3d2ccb4";

export async function getFullWeatherData(city, ui) {
    try {
        ui.showLoading();

        let query = "";

        if (typeof city === "string") {
            query = `q=${city}`;
        } else {
            query = `lat=${city.lat}&lon=${city.lon}`;
        }

        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${apiKey}&units=metric`)
        ]);

        if (currentRes.status === 404) {
            throw new Error("City not found");
        }

        const current = await currentRes.json();
        const forecast = await forecastRes.json();

        // ✅ Always use the real city name returned by the API
        // This prevents "null" being stored when using geolocation
        addToRecents(current.name);

        ui.updateAll(current, forecast);

        spawnPokemon(current.weather[0].main.toLowerCase());

    } catch (error) {
        console.error("Weather data fetch failed", error);

        if (typeof city === "string") {
            ui.showError("City not found. Please try again.");
        }
    } finally {
        ui.hideLoading();
    }
}

export async function getWeatherByCoords(lat, lon, ui) {
    getFullWeatherData({ lat, lon }, ui);
}