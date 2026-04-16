let allEpisodes = [];

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

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  searchInput.id = "search-input";
  controls.appendChild(searchInput);

  const select = document.createElement("select");
  select.id = "episode-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Jump to episode...";
  select.appendChild(defaultOption);

  controls.appendChild(select);

  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";
  episodesContainer.id = "episodes-container";
  rootElem.appendChild(episodesContainer);
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
  const episodesContainer = document.getElementById("episodes-container");
  const count = document.getElementById("count");
  episodesContainer.innerHTML = "";

  count.textContent = `Displaying ${list.length}/${allEpisodes.length} episode(s)`;

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
    image.src = episode.image ? episode.image.medium : "";
    image.alt = `${episode.name} episode image`;

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "<p>No summary available.</p>";

    const link = document.createElement("a");
    link.href = episode.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View on TVMaze";

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);
    card.appendChild(link);

    episodesContainer.appendChild(card);
  });
}

function getFilteredEpisodes() {
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.toLowerCase();

  return allEpisodes.filter((episode) => {
    const summaryText = episode.summary ? episode.summary.toLowerCase() : "";
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      summaryText.includes(searchTerm)
    );
  });
}

function handleSearch() {
  const filteredEpisodes = getFilteredEpisodes();
  renderEpisodes(filteredEpisodes);
}

function handleSelect() {
  const select = document.getElementById("episode-select");
  const id = select.value;

  document.querySelectorAll(".episode-card").forEach((card) => {
    card.style.background = "#f9f9f9";
  });

  if (!id) {
    return;
  }

  const element = document.getElementById(`episode-${id}`);

  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.style.background = "#fff3a0";
  }
}

async function loadEpisodes() {
  const statusMessage = document.getElementById("status-message");

  try {
    statusMessage.textContent = "Please wait, loading episode data...";

    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error("Failed to fetch episode data");
    }

    allEpisodes = await response.json();

    statusMessage.textContent = "";
    populateSelect(allEpisodes);
    renderEpisodes(allEpisodes);

    document
      .getElementById("search-input")
      .addEventListener("input", handleSearch);

    document
      .getElementById("episode-select")
      .addEventListener("change", handleSelect);
  } catch (error) {
    statusMessage.textContent =
      "Sorry, there was a problem loading episode data. Please try again later.";
    document.getElementById("count").textContent = "Displaying 0/0 episode(s)";
  }
}

function setup() {
  createPageStructure();
  loadEpisodes();
}

window.onload = setup;