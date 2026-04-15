import { getFullWeatherData, getWeatherByCoords } from "./weather.js";
import { createUI } from "./ui.js";
import { setupTheme } from "./theme.js";
import { setupSuggestions } from "./suggestions.js";
import { getRecents, cleanRecents } from "./storage.js";

// ✅ Clean up any "null" entries left over from before the fix
cleanRecents();

let userSearched = false;

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const suggestionBox = document.querySelector(".suggestions");
const toggleBtn = document.getElementById("themeToggle");

const ui = createUI(getRecents);

setupTheme(toggleBtn);

document.body.classList.add("state-initial");

// Suggestions — pass getRecents so recents show when input is empty (Google-style)
setupSuggestions(
    searchBox,
    suggestionBox,
    "080ad6a80a7585356ea43862e3d2ccb4",
    (data) => {
        userSearched = true;
        suggestionBox.style.display = "none";
        getFullWeatherData(data, ui);
    },
    getRecents   // ✅ enables Google-style recent searches in dropdown
);


function handleSearch() {
    const city = searchBox.value.trim();

    if (!city) return;

    userSearched = true;
    suggestionBox.style.display = "none";

    getFullWeatherData(city, ui);
}

// Click
searchBtn.addEventListener("click", handleSearch);

// Enter
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
    }
});

// UI state
searchBox.addEventListener("focus", () => {
    document.body.classList.add("state-search");
});

searchBox.addEventListener("blur", () => {
    setTimeout(() => {
        document.body.classList.remove("state-search");
    }, 150); // allow click on suggestions
});

// Auto Detect
window.addEventListener("load", () => {
    if (navigator.geolocation && !userSearched) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                getWeatherByCoords(
                    pos.coords.latitude,
                    pos.coords.longitude,
                    ui
                );
            },
            () => {
                console.log("Geolocation denied or failed");
            }
        );
    }
});