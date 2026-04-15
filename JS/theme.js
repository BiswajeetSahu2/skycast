import { refreshChartTheme } from "./charts.js";

export function setupTheme(toggleBtn) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        toggleBtn.textContent = "☀️";
    }

    toggleBtn.onclick = () => {
        document.body.classList.toggle("dark");

        const dark = document.body.classList.contains("dark");
        localStorage.setItem("theme", dark ? "dark" : "light");
        toggleBtn.textContent = dark ? "☀️" : "🌙";

        // ✅ Refresh chart text/grid colors to match new theme
        const isFahrenheit = document.getElementById("unitToggle")?.checked ?? false;
        refreshChartTheme(isFahrenheit);
    };
}