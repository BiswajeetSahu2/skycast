import { initChart, updateChartUnits } from "./charts.js";

const OWM_KEY = "080ad6a80a7585356ea43862e3d2ccb4";

export function createUI(getRecents) {

    const errorDiv        = document.querySelector(".error");
    const loadingDiv      = document.querySelector(".loading");
    const placeholderDiv  = document.querySelector(".placeholder");
    const cityEl          = document.querySelector(".current-weather .city");
    const tempEl          = document.querySelector(".current-weather .temp");
    const humidityEl      = document.querySelector(".current-weather .humidity");
    const windEl          = document.querySelector(".current-weather .wind");
    const weatherIcon     = document.querySelector(".current-weather .weather-icon");
    const weatherDiv      = document.querySelector(".current-weather");
    const chartDiv        = document.querySelector(".hourly-chart-section");
    const forecastDiv     = document.querySelector(".forecast-grid-section");
    const pressureEl      = document.querySelector(".pressure");
    const aqiEl           = document.querySelector(".aqi");
    const precipitationEl = document.querySelector(".precipitation");
    const unitToggle      = document.getElementById("unitToggle");

    let isFahrenheit = false;
    let lastTempC    = null;

    // Initial state
    errorDiv.style.display    = "none";
    loadingDiv.style.display  = "none";
    placeholderDiv.style.display = "block";
    weatherDiv.style.display  = "none";
    chartDiv.style.display    = "none";
    forecastDiv.style.display = "none";

    // Unit toggle
    if (unitToggle) {
        unitToggle.addEventListener("change", () => {
            isFahrenheit = unitToggle.checked;
            if (lastTempC !== null) {
                tempEl.textContent = isFahrenheit
                    ? Math.round(lastTempC * 9/5 + 32) + "°F"
                    : Math.round(lastTempC) + "°C";
            }
            // ✅ Update chart temperatures + labels
            updateChartUnits(isFahrenheit);
        });
    }

    return {

        async updateAll(current, forecast) {
            this.setState("state-loaded");
            this.updateWeather(current, forecast);
            this.setBackground(current.weather[0].main.toLowerCase());
            initChart(forecast.list, isFahrenheit);
            renderForecast(forecast.list);

            // Fetch AQI from Air Pollution API
            try {
                const { lat, lon } = current.coord;
                const res  = await fetch(
                    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_KEY}`
                );
                const data = await res.json();
                const aqi  = data.list?.[0]?.main?.aqi;
                const labels = { 1:"Good 🟢", 2:"Fair 🟡", 3:"Moderate 🟠", 4:"Poor 🔴", 5:"Very Poor 🟣" };
                if (aqiEl) aqiEl.textContent = labels[aqi] ?? "—";
            } catch {
                if (aqiEl) aqiEl.textContent = "—";
            }
        },

        updateWeather(data, forecast) {
            lastTempC = data.main.temp;

            cityEl.textContent     = data.name;
            tempEl.textContent     = isFahrenheit
                ? Math.round(lastTempC * 9/5 + 32) + "°F"
                : Math.round(lastTempC) + "°C";
            humidityEl.textContent = data.main.humidity + "%";
            windEl.textContent     = data.wind.speed + " km/h";

            if (pressureEl) pressureEl.textContent = data.main.pressure + " hPa";

            // Precipitation: probability of precipitation from nearest forecast slot
            if (precipitationEl && forecast) {
                const pop = forecast.list?.[0]?.pop ?? 0;
                precipitationEl.textContent = Math.round(pop * 100) + "%";
            }

            const icon = data.weather[0].main.toLowerCase();
            weatherIcon.src = `images/${icon}.png`;
            weatherIcon.onerror = () => { weatherIcon.src = "images/clouds.png"; };

            weatherDiv.style.display  = "block";
            chartDiv.style.display    = "block";
            forecastDiv.style.display = "block";
            errorDiv.style.display    = "none";
            placeholderDiv.style.display = "none";
        },

        setBackground(condition) {
            document.body.classList.remove("clear","clouds","rain","mist","snow");
            document.body.classList.add(condition);
        },

        setState(state) {
            document.body.classList.remove("state-initial","state-loaded","state-search");
            document.body.classList.add(state);
        },

        showLoading() {
            loadingDiv.style.display  = "block";
            weatherDiv.style.display  = "none";
            errorDiv.style.display    = "none";
        },

        hideLoading() {
            loadingDiv.style.display = "none";
        },

        showError() {
            errorDiv.style.display    = "block";
            weatherDiv.style.display  = "none";
            chartDiv.style.display    = "none";
            forecastDiv.style.display = "none";
            placeholderDiv.style.display = "none";
            loadingDiv.style.display  = "none";
        }
    };

    function renderForecast(list) {
        const container = document.querySelector(".forecast-grid");
        const daily = list.filter(item => item.dt_txt.includes("12:00:00"));
        container.innerHTML = daily.slice(0, 5).map(item => {
            const date  = new Date(item.dt * 1000);
            const day   = date.toLocaleDateString("en-US", { weekday: "short" });
            const tempC = Math.round(item.main.temp);
            return `
                <div class="forecast-item">
                    <p>${day}</p>
                    <img src="images/${item.weather[0].main.toLowerCase()}.png"
                         onerror="this.src='images/clouds.png'">
                    <p>${tempC}°C</p>
                </div>
            `;
        }).join("");
    }
}