const pool = {
    clear: ["pikachu", "raichu"],
    rain: ["poliwag", "psyduck"],
    clouds: ["swablu"],
    snow: ["snom"],
    mist: ["gastly"]
};

export function spawnPokemon(condition) {
    const list = pool[condition] || ["pikachu"];
    const name = list[Math.floor(Math.random() * list.length)];

    const img = document.createElement("img");
    img.src = `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`;
    img.className = "pokemon";

    const fromLeft = Math.random() > 0.5;
    img.style.left = fromLeft ? "-150px" : "100%";
    img.style.transform = fromLeft ? "scaleX(1)" : "scaleX(-1)";
    img.style.bottom = Math.random() * 60 + "px";

    const duration = 5 + Math.random() * 5;
    img.style.animation = `walk ${duration}s linear`;

    document.body.appendChild(img);

    setTimeout(() => img.remove(), duration * 1000);
}