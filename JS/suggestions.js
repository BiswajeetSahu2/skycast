export function setupSuggestions(searchBox, suggestionsEl, apiKey, onSelect, getRecents) {
    let timeout;
    let selectedIndex = -1;

    const highlightItem = (items) => {
        items.forEach((li, i) => {
            li.classList.toggle("highlighted", i === selectedIndex);
        });
    };

    function showRecents() {
        const recents = getRecents ? getRecents() : [];
        if (!recents.length) {
            suggestionsEl.style.display = "none";
            return;
        }

        suggestionsEl.innerHTML = `
            <li class="recents-header">Recent Searches</li>
            ${recents.map(city => `
                <li class="recent-item" data-name="${city}">
                    <span class="recent-icon">🕐</span> ${city}
                </li>
            `).join("")}
        `;
        suggestionsEl.style.display = "block";

        suggestionsEl.querySelectorAll(".recent-item").forEach(li => {
            li.addEventListener("click", () => {
                const name = li.dataset.name;
                searchBox.value = name;
                suggestionsEl.style.display = "none";
                onSelect(name); // recent searches are plain strings
            });
        });
    }

    // Keyboard navigation
    searchBox.addEventListener("keydown", (e) => {
        const items = suggestionsEl.querySelectorAll("li:not(.recents-header)");
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % items.length;
            highlightItem(items);
            e.preventDefault();
        }
        else if (e.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            highlightItem(items);
            e.preventDefault();
        }
        else if (e.key === "Enter") {
            if (selectedIndex > -1) {
                items[selectedIndex].click();
                e.preventDefault();
            }
        }
    });

    // Show recents on focus if input is empty
    searchBox.addEventListener("focus", () => {
        if (searchBox.value.trim() === "") {
            showRecents();
        }
    });

    // Typing city
    searchBox.addEventListener("input", () => {
        clearTimeout(timeout);
        selectedIndex = -1;

        const query = searchBox.value.trim();

        // Empty input → show recents
        if (query.length === 0) {
            showRecents();
            return;
        }

        // Too short for city search
        if (query.length < 2) {
            suggestionsEl.style.display = "none";
            return;
        }

        timeout = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
                );

                const data = await res.json();

                if (!data.length) {
                    suggestionsEl.style.display = "none";
                    return;
                }

                suggestionsEl.innerHTML = data.map(c => {
                    const flag = `https://flagcdn.com/16x12/${c.country.toLowerCase()}.png`;
                    const state = c.state ? `${c.state}, ` : "";

                    return `
                        <li data-name="${c.name}" data-lat="${c.lat}" data-lon="${c.lon}">
                            <img src="${flag}" class="flag"> ${c.name}, ${state}${c.country}
                        </li>
                    `;
                }).join("");

                suggestionsEl.style.display = "block";

                suggestionsEl.querySelectorAll("li").forEach(li => {
                    li.addEventListener("click", () => {
                        const name = li.dataset.name;
                        const lat = parseFloat(li.dataset.lat);
                        const lon = parseFloat(li.dataset.lon);

                        searchBox.value = name;
                        suggestionsEl.style.display = "none";

                        onSelect({ name, lat, lon });
                    });
                });

            } catch (err) {
                console.error("Suggestion error:", err);
            }
        }, 300);
    });

    // Click outside closes suggestions
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-wrapper")) {
            suggestionsEl.style.display = "none";
        }
    });
}