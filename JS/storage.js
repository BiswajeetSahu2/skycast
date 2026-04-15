export function getRecents() {
    return JSON.parse(localStorage.getItem("recents")) || [];
}

export function addToRecents(city) {
    // ✅ Guard: never store null, undefined, or empty strings
    if (!city || typeof city !== "string" || city.trim() === "") return;

    let recents = getRecents();

    recents = recents.filter(c => c !== city);
    recents.unshift(city);

    if (recents.length > 5) recents.pop();

    localStorage.setItem("recents", JSON.stringify(recents));
}

export function removeFromRecents(city) {
    let recents = JSON.parse(localStorage.getItem("recents")) || [];
    recents = recents.filter(c => c !== city);
    localStorage.setItem("recents", JSON.stringify(recents));
}

// ✅ Call this once to clean up any "null" entries already in storage
export function cleanRecents() {
    let recents = getRecents();
    recents = recents.filter(c => c && c !== "null" && c.trim() !== "");
    localStorage.setItem("recents", JSON.stringify(recents));
}