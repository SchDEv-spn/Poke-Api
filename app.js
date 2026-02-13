// ============================================
// POKÉDEX - APP.JS (VANILLA JAVASCRIPT)
// ============================================

// ============ CONFIG ============
const API_BASE = 'https://pokeapi.co/api/v2/pokemon';
const MAX_POKEMON = 1025; // Gen 1-9 aproximadamente

// ============ STATE ============
let state = {
    currentPokemonId: 1,
    isLoading: false,
    maxPokemonId: MAX_POKEMON
};

// ============ DOM ELEMENTS ============
const elements = {
    pokemon: {
        image: document.getElementById('pokemonImage'),
        name: document.getElementById('pokemonName'),
        id: document.getElementById('pokemonId'),
        type1: document.getElementById('type1'),
        type2: document.getElementById('type2')
    },
    stats: {
        hp: document.getElementById('statHP'),
        atk: document.getElementById('statATK'),
        def: document.getElementById('statDEF'),
        hpValue: document.getElementById('statHPValue'),
        atkValue: document.getElementById('statATKValue'),
        defValue: document.getElementById('statDEFValue')
    },
    buttons: {
        previous: document.getElementById('btnPrevious'),
        random: document.getElementById('btnRandom'),
        next: document.getElementById('btnNext')
    },
    status: {
        area: document.getElementById('statusArea'),
        message: document.getElementById('statusMessage')
    }
};

// ============ UTILITIES ============
function showStatus(message, type = 'error') {
    elements.status.area.classList.remove('hidden');
    elements.status.message.textContent = message;
    elements.status.message.style.color = type === 'error' ? '#ff6b6b' : '#4CAF50';
}

function hideStatus() {
    elements.status.area.classList.add('hidden');
}

function disableButtons(disabled = true) {
    elements.buttons.previous.disabled = disabled;
    elements.buttons.next.disabled = disabled;
    elements.buttons.random.disabled = disabled;
}

function getTypeClass(typeObj) {
    return `type-${typeObj.type.name}`;
}

function calculateStatPercentage(value) {
    return Math.min((value / 255) * 100, 100);
}

// ============ FETCH ============
async function fetchPokemon(id) {
    // Validaciones
    if (id < 1 || id > state.maxPokemonId) {
        showStatus('ID de Pokémon inválido');
        return null;
    }

    state.isLoading = true;
    disableButtons(true);
    showStatus('Cargando Pokémon...');

    try {
        const response = await fetch(`${API_BASE}/${id}`);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();
        state.currentPokemonId = data.id;
        hideStatus();
        return data;

    } catch (error) {
        console.error('Error fetching Pokémon:', error);
        showStatus(`Error: ${error.message}`, 'error');
        return null;

    } finally {
        state.isLoading = false;
        disableButtons(false);
    }
}

// ============ RENDER ============
function updateUI(pokemonData) {
    if (!pokemonData) return;

    // Imagen
    const imageUrl = pokemonData.sprites.other['official-artwork']?.front_default
        || pokemonData.sprites.front_default
        || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E';

    elements.pokemon.image.src = imageUrl;
    elements.pokemon.image.alt = pokemonData.name;

    // Nombre e ID
    elements.pokemon.name.textContent = pokemonData.name.toUpperCase();
    elements.pokemon.id.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;

    // Tipos
    const types = pokemonData.types;
    if (types[0]) {
        elements.pokemon.type1.textContent = types[0].type.name.toUpperCase();
        elements.pokemon.type1.className = `type-badge ${getTypeClass(types[0])}`;
        elements.pokemon.type1.classList.remove('hidden');
    }

    if (types[1]) {
        elements.pokemon.type2.textContent = types[1].type.name.toUpperCase();
        elements.pokemon.type2.className = `type-badge ${getTypeClass(types[1])}`;
        elements.pokemon.type2.classList.remove('hidden');
    } else {
        elements.pokemon.type2.classList.add('hidden');
    }

    // Stats
    const stats = pokemonData.stats;
    const statMap = {
        0: { elm: elements.stats.hp, valueElm: elements.stats.hpValue },
        1: { elm: elements.stats.atk, valueElm: elements.stats.atkValue },
        2: { elm: elements.stats.def, valueElm: elements.stats.defValue }
    };

    Object.keys(statMap).forEach(index => {
        const stat = stats[index];
        const value = stat.base_stat;
        const percentage = calculateStatPercentage(value);

        statMap[index].elm.style.width = percentage + '%';
        statMap[index].valueElm.textContent = value;
    });
}

// ============ NAVIGATION ============
async function goToPokemon(id) {
    if (state.isLoading) return;

    const data = await fetchPokemon(id);
    if (data) {
        updateUI(data);
    }
}

async function previous() {
    let newId = state.currentPokemonId - 1;
    if (newId < 1) {
        newId = state.maxPokemonId;
    }
    await goToPokemon(newId);
}

async function next() {
    let newId = state.currentPokemonId + 1;
    if (newId > state.maxPokemonId) {
        newId = 1;
    }
    await goToPokemon(newId);
}

async function random() {
    const randomId = Math.floor(Math.random() * state.maxPokemonId) + 1;
    await goToPokemon(randomId);
}

// ============ EVENT LISTENERS ============
elements.buttons.previous.addEventListener('click', previous);
elements.buttons.next.addEventListener('click', next);
elements.buttons.random.addEventListener('click', random);

// Tecla Enter para siguiente
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.isLoading) {
        next();
    }
});

// ============ INIT ============
window.addEventListener('DOMContentLoaded', async () => {
    await goToPokemon(state.currentPokemonId);
});

