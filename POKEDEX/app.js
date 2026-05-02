const pokedex = document.getElementById("pokedex");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("pageNumbers");
const pageInput = document.getElementById("pageInput");
const goBtn = document.getElementById("goBtn");
const searchInput = document.getElementById("searchPokemon");
const searchBtn = document.getElementById("searchBtn");

const ALL_LIMIT = 1025; // всі покемони
let allPokemon = [];

const limit = 27;
let currentPage = 1;
let totalPages = 0;

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");
const moveCache = {};

const loadAllPokemon = async () => {
    const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${ALL_LIMIT}&offset=0`
    );

    const data = await res.json();
    allPokemon = data.results;
    fetchPage(1);
};

const fetchPage = async (page) => {
    currentPage = page;

    const offset = (page - 1) * limit;
    const pageItems = allPokemon.slice(offset, offset + limit);

    totalPages = Math.ceil(allPokemon.length / limit);

    const pokemonDetails = await Promise.all(
        pageItems.map(async (p) => {
            const res = await fetch(p.url);
            const data = await res.json();

            return {
                name: data.name,
                id: data.id,
                image: data.sprites.front_default,
                type: data.types.map(t => t.type.name).join(", "),
                abilities: data.abilities,
                height: data.height,
                weight: data.weight,
                moves: data.moves,
                species: data.species
            };
        })
    );

    displayPokemon(pokemonDetails);
    renderPagination();
};

const renderPagination = () => {
    pageNumbers.innerHTML = "";

    const maxVisible = 9;
    const half = Math.floor(maxVisible / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
        start = 1;
        end = maxVisible;
    }

    if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisible + 1;
        if (start < 1) start = 1;
    }

    // ← кнопка
    prevBtn.disabled = currentPage === 1;

    // перша сторінка + ...
    if (start > 1) {
        addPageButton(1);

        if (start > 2) {
            addDots();
        }
    }

    // основний діапазон
    for (let i = start; i <= end; i++) {
        addPageButton(i);
    }

    // ... + остання сторінка
    if (end < totalPages) {
        if (end < totalPages - 1) {
            addDots();
        }

        addPageButton(totalPages);
    }

    // → кнопка
    nextBtn.disabled = currentPage === totalPages;
};

const addPageButton = (page) => {
    const btn = document.createElement("div");
    btn.classList.add("page-number");

    if (page === currentPage) {
        btn.classList.add("active");
    }

    btn.innerText = page;

    btn.addEventListener("click", () => {
        currentPage = page;
        fetchPage(currentPage);
    });

    pageNumbers.appendChild(btn);
};

const addDots = () => {
    const dots = document.createElement("span");
    dots.innerText = "...";
    dots.style.padding = "6px";
    pageNumbers.appendChild(dots);
};

prevBtn.onclick = () => {
    if (currentPage > 1) {
        fetchPage(--currentPage);
    }
};

nextBtn.onclick = () => {
    if (currentPage < totalPages) {
        fetchPage(++currentPage);
    }
};

goBtn.addEventListener("click", () => {
    const page = Number(pageInput.value);

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        fetchPage(currentPage);
    }
});

const searchAndOpenPokemon = async () => {
    const name = searchInput.value.trim().toLowerCase();

    if (!name) return;

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();

        const pokemon = {
            name: data.name,
            id: data.id,
            image: data.sprites.front_default,
            type: data.types.map(t => t.type.name).join(", "),
            abilities: data.abilities,
            height: data.height,
            weight: data.weight,
            moves: data.moves,
            species: data.species
        };

        openModal(pokemon);

    } catch (err) {
        alert("Pokémon not found");
    }
};

const getEvolutionChain = async (pokemon) => {
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const chain = [];

    let current = evoData.chain;

    while (current) {
        chain.push({
            name: current.species.name,
        });

        current = current.evolves_to[0];
    }

    return chain;
};

const getPokemonSprite = async (name) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    return data.sprites.front_default;
};

const getMoveData = async (url) => {
    if (moveCache[url]) { return moveCache[url];}

    // інакше робимо fetch
    const res = await fetch(url);
    const data = await res.json();

    // зберігаємо в кеш
    moveCache[url] = data;

    return data;
    // const res = await fetch(url);
    // return await res.json();
};

const getAbilityDescription = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    const entry = data.effect_entries.find(
        (e) => e.language.name === "en"
    );

    return entry ? entry.short_effect : "No description available";
};

const openModal = async (pokemon) => {
    let abilitiesHTML = "";
    const evolutionChain = await getEvolutionChain(pokemon);

    let evolutionHTML = "";

    if (!evolutionChain || evolutionChain.length <= 1) {
        evolutionHTML = `<p class="no-evo">No evolution available</p>`;
    } else {
        const evoCards = await Promise.all(
            evolutionChain.map(async (evo, index) => {
                const img = await getPokemonSprite(evo.name);

                return `
                    <div class="evo-card">
                        <img src="${img}" />
                        <p>${evo.name}</p>
                    </div>
                    ${index < evolutionChain.length - 1 ? `<span class="evo-arrow"></span>` : ""}
                `;
            })
        );

        evolutionHTML = evoCards.join("");
    }

    for (let ab of pokemon.abilities) {
        const desc = await getAbilityDescription(ab.ability.url);

        abilitiesHTML += `
            <p><strong>${ab.ability.name}</strong>: ${desc}</p>
        `;
    }

    const movesData = await Promise.all(
        pokemon.moves.map(async (m) => {
            const data = await getMoveData(m.move.url);
            const description = data.flavor_text_entries.find(
                (entry) => entry.language.name === "en"
            )?.flavor_text || "No description";

            return {
                name: m.move.name,
                type: data.type?.name || "unknown",
                description: description.replace(/\f/g, " ")
            };
        })
    );
    const movesHTML = `
        <table class="moves-table">
            <thead>
                <tr>
                    <th>Move</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${movesData.map(m => `
                    <tr>
                        <td>${m.name}</td>
                        <td><span class="type ${m.type}">${m.type}</span></td>
                        <td>${m.description}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    const typesHTML = pokemon.type
        .split(", ")
        .map(t => `<span class="type ${t}">${t}</span>`)
        .join(" ");

    modalBody.innerHTML = `
        <div class="modal-header">
            <img class="modal-img" src="${pokemon.image}" />

            <div>
                <h1>${pokemon.id}. ${pokemon.name}</h1>

                <div class="modal-types">
                    ${typesHTML}
                </div>

                <p><strong>Height:</strong> ${pokemon.height} dm</p>
                <p><strong>Weight:</strong> ${pokemon.weight} dg</p>
            </div>
            <div class="evolution-box">
                <h3>Evolution</h3>
                <div class="evolution-line">
                    ${evolutionHTML}
                </div>
            </div>
        </div>

        <div class="modal-section">
            <h2>Abilities:</h2>
            ${abilitiesHTML}
        </div>

        <div class="modal-section">
            <h2>Moves:</h2>
            ${movesHTML}
        </div>

        
    `;

    modal.classList.remove("hidden");
};

const displayPokemon = (pokemon) => {
    const pokemonHTMLString = pokemon.map(p => `
        <li class="card" data-name="${p.name}">
            <img class="card-image" src="${p.image}"/>
            <h2 class="card-title">${p.id}. ${p.name}</h2>
            <p class="card-subtitle">
                Type: ${p.type
                    .split(", ")
                    .map(t => `<span class="type ${t}">${t}</span>`)
                    .join(", ")}
            </p>
        </li>
    `).join("");

    pokedex.innerHTML = pokemonHTMLString;

    document.querySelectorAll(".card").forEach((card, index) => {
        card.addEventListener("click", () => {
            openModal(pokemon[index]);
        });
    });
};

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

searchBtn.addEventListener("click", searchAndOpenPokemon);

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchAndOpenPokemon();
    }
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});


loadAllPokemon();

