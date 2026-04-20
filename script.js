let allEpisodes = [];
let allShows = [];
const cache = {};
let currentShowId = null;

function formatEpisodeCode(season, episode) {
  const seasonString = String(season).padStart(2, "0");
  const episodeString = String(episode).padStart(2, "0");
  return `S${seasonString}E${episodeString}`;
}

function createPageStructure() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const heading = document.createElement("h1");
  heading.textContent = "Game of Thrones Episodes";
  rootElem.appendChild(heading);

  const count = document.createElement("p");
  count.id = "count";
  count.textContent = "Loading episodes...";
  rootElem.appendChild(count);

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  const statusMessage = document.createElement("p");
  statusMessage.id = "status-message";
  rootElem.appendChild(statusMessage);

  const controls = document.createElement("div");
  controls.className = "controls";
  rootElem.appendChild(controls);

  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  controls.appendChild(showSelect);

  const select = document.createElement("select");
  select.id = "episode-select";
  controls.appendChild(select);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  searchInput.id = "search-input";
  controls.appendChild(searchInput);
  
  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);
}

async function loadShows() {
  if (cache["shows"]) {
    allShows = cache["shows"];
    populateShowSelect(allShows);
    return;
  }

  const res = await fetch("https://api.tvmaze.com/shows");
  allShows = await res.json();

  cache["shows"] = allShows;

  allShows.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  populateShowSelect(allShows);
}

function populateShowSelect(shows) {
  const select = document.getElementById("show-select");
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a show...";
  defaultOption.value = "";
  select.appendChild(defaultOption);

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    select.appendChild(option);
  });
}

async function loadEpisodesByShow(showId) {
  const statusMessage = document.getElementById("status-message");

  if (!showId) return;

  currentShowId = showId;

  if (cache[showId]) {
    allEpisodes = cache[showId];
    renderEpisodes(allEpisodes);
    populateSelect(allEpisodes);
    return;
  }

  try {
    statusMessage.textContent = "Loading episodes...";

    const res = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );

    if (!res.ok) throw new Error("Fetch failed");

    allEpisodes = await res.json();
    cache[showId] = allEpisodes;

    statusMessage.textContent = "";

    populateSelect(allEpisodes);
    renderEpisodes(allEpisodes);
  } catch (err) {
    statusMessage.textContent =
      "Error loading episodes. Please try again.";
  }
}

function populateSelect(episodeList) {
  const select = document.getElementById("episode-select");
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Jump to episode...";
  select.appendChild(defaultOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number
    )} - ${episode.name}`;
    select.appendChild(option);
  });
}

function renderEpisodes(list) {
  const container = document.getElementById("episodes-container");
  const count = document.getElementById("count");

  container.innerHTML = "";

  count.textContent = `Displaying ${list.length} episode(s)`;

  list.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";
    card.id = `episode-${episode.id}`;

    const title = document.createElement("h2");
    title.textContent = `${episode.name} - ${formatEpisodeCode(
      episode.season,
      episode.number
    )}`;

    const image = document.createElement("img");
    image.src = episode.image?.medium || "";
    image.alt = episode.name;

    const summary = document.createElement("div");
    summary.innerHTML = episode.summary || "No summary";

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);

    container.appendChild(card);
  });
}

function handleSearch() {
  const term = document.getElementById("search-input").value.toLowerCase();

  if (!term) {
    renderEpisodes(allEpisodes);
    return;
  }

  const filtered = allEpisodes.filter((ep) => {
    return (
      ep.name.toLowerCase().includes(term) ||
      (ep.summary || "").toLowerCase().includes(term)
    );
  });

  renderEpisodes(filtered);
}

function handleSelect() {
  const select = document.getElementById("episode-select");
  const id = select.value;

  if (!id) return;

  const el = document.getElementById(`episode-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

async function setup() {
  createPageStructure();

  await loadShows();

  document.getElementById("count").textContent =
    "Select a show to begin";

  document
    .getElementById("search-input")
    .addEventListener("input", handleSearch);

  document
    .getElementById("episode-select")
    .addEventListener("change", handleSelect);

  document
  .getElementById("show-select")
  .addEventListener("change", (e) => {
    document.getElementById("search-input").value = "";
    document.getElementById("episode-select").innerHTML = "";
    loadEpisodesByShow(e.target.value);
  });
}

window.onload = setup;