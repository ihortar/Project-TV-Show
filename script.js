let allShows = [];
let allEpisodes = [];
let currentShow = null;

const cache = {
  shows: null,
  episodesByShowId: {},
};

function setup() {
  createPageSkeleton();
  loadShows();
}

function createPageSkeleton() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const header = document.createElement("header");
  header.className = "top-bar";

  const homeButton = document.createElement("button");
  homeButton.id = "home-button";
  homeButton.textContent = "Back to shows";
  homeButton.style.display = "none";

  const pageTitle = document.createElement("h1");
  pageTitle.id = "page-title";
  pageTitle.textContent = "TV Shows";

  header.append(homeButton, pageTitle);

  const statusMessage = document.createElement("p");
  statusMessage.id = "status-message";

  const showsControls = document.createElement("div");
  showsControls.id = "shows-controls";

  const showSearchInput = document.createElement("input");
  showSearchInput.id = "show-search";
  showSearchInput.type = "text";
  showSearchInput.placeholder = "Search shows by name, genre or summary...";

  const showCount = document.createElement("p");
  showCount.id = "show-count";
  showCount.textContent = "Displaying 0/0 shows";

  showsControls.append(showSearchInput, showCount);

  const showsView = document.createElement("section");
  showsView.id = "shows-view";

  const showsContainer = document.createElement("div");
  showsContainer.id = "shows-container";
  showsView.appendChild(showsContainer);

  const episodesControls = document.createElement("div");
  episodesControls.id = "episodes-controls";
  episodesControls.style.display = "none";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";

  const defaultEpisodeOption = document.createElement("option");
  defaultEpisodeOption.value = "all";
  defaultEpisodeOption.textContent = "All episodes";
  episodeSelect.appendChild(defaultEpisodeOption);

  const episodeSearchInput = document.createElement("input");
  episodeSearchInput.id = "episode-search";
  episodeSearchInput.type = "text";
  episodeSearchInput.placeholder = "Search episodes...";

  const episodeCount = document.createElement("p");
  episodeCount.id = "episode-count";
  episodeCount.textContent = "Displaying 0/0 episodes";

  episodesControls.append(episodeSelect, episodeSearchInput, episodeCount);

  const episodesView = document.createElement("section");
  episodesView.id = "episodes-view";
  episodesView.style.display = "none";

  const episodesContainer = document.createElement("div");
  episodesContainer.id = "episodes-container";
  episodesView.appendChild(episodesContainer);

  const credit = document.createElement("p");
  credit.id = "credit";
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';

  root.append(
    header,
    statusMessage,
    showsControls,
    showsView,
    episodesControls,
    episodesView,
    credit,
  );

  showSearchInput.addEventListener("input", updateShowsDisplay);
  episodeSearchInput.addEventListener("input", updateEpisodesDisplay);
  episodeSelect.addEventListener("change", updateEpisodesDisplay);
  homeButton.addEventListener("click", showShowsListing);
}

function loadShows() {
  const statusMessage = document.getElementById("status-message");

  if (cache.shows) {
    allShows = cache.shows;
    updateShowsDisplay();
    return;
  }

  statusMessage.textContent = "Loading shows...";

  fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load shows");
      }
      return response.json();
    })
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      );
      cache.shows = allShows;
      statusMessage.textContent = "";
      updateShowsDisplay();
    })
    .catch((error) => {
      statusMessage.textContent = "❌ Error loading shows.";
      console.error(error);
    });
}

function updateShowsDisplay() {
  const searchTerm = document
    .getElementById("show-search")
    .value.toLowerCase()
    .trim();

  const filteredShows = allShows.filter((show) => {
    const name = show.name ? show.name.toLowerCase() : "";
    const genres = show.genres ? show.genres.join(" ").toLowerCase() : "";
    const summary = show.summary ? show.summary.toLowerCase() : "";

    return (
      name.includes(searchTerm) ||
      genres.includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  });

  renderShows(filteredShows);
  updateShowCount(filteredShows.length, allShows.length);
}

function renderShows(showList) {
  const showsContainer = document.getElementById("shows-container");
  showsContainer.innerHTML = "";

  showList.forEach((show) => {
    const card = document.createElement("article");
    card.className = "show-card";

    const titleButton = document.createElement("button");
    titleButton.className = "show-title-button";
    titleButton.textContent = show.name;
    titleButton.addEventListener("click", () => openShow(show));

    const image = document.createElement("img");
    image.className = "show-image";
    image.src = show.image ? show.image.medium : "";
    image.alt = show.name;

    const meta = document.createElement("p");
    meta.className = "show-meta";
    meta.innerHTML = `
      <strong>Genres:</strong> ${show.genres?.join(", ") || "Unknown"}<br>
      <strong>Status:</strong> ${show.status || "Unknown"}<br>
      <strong>Rating:</strong> ${show.rating?.average ?? "N/A"}<br>
      <strong>Runtime:</strong> ${show.runtime ?? "N/A"} mins
    `;

    const summary = document.createElement("div");
    summary.className = "show-summary";
    summary.innerHTML = show.summary || "<p>No summary available.</p>";

    card.append(titleButton, image, meta, summary);
    showsContainer.appendChild(card);
  });
}

function updateShowCount(current, total) {
  document.getElementById("show-count").textContent =
    `Displaying ${current}/${total} shows`;
}

function openShow(show) {
  currentShow = show;
  document.getElementById("page-title").textContent = show.name;
  document.getElementById("home-button").style.display = "inline-block";
  document.getElementById("shows-controls").style.display = "none";
  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-controls").style.display = "grid";
  document.getElementById("episodes-view").style.display = "block";
  document.getElementById("episode-search").value = "";
  loadEpisodesForShow(show.id);
}

function showShowsListing() {
  document.getElementById("page-title").textContent = "TV Shows";
  document.getElementById("home-button").style.display = "none";
  document.getElementById("shows-controls").style.display = "grid";
  document.getElementById("shows-view").style.display = "block";
  document.getElementById("episodes-controls").style.display = "none";
  document.getElementById("episodes-view").style.display = "none";
  document.getElementById("episode-search").value = "";
  resetEpisodeSelector();
}

function loadEpisodesForShow(showId) {
  const statusMessage = document.getElementById("status-message");

  if (cache.episodesByShowId[showId]) {
    allEpisodes = cache.episodesByShowId[showId];
    populateEpisodeSelector(allEpisodes);
    updateEpisodesDisplay();
    return;
  }

  statusMessage.textContent = "Loading episodes...";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }
      return response.json();
    })
    .then((episodes) => {
      cache.episodesByShowId[showId] = episodes;
      allEpisodes = episodes;
      populateEpisodeSelector(allEpisodes);
      statusMessage.textContent = "";
      updateEpisodesDisplay();
    })
    .catch((error) => {
      statusMessage.textContent = "❌ Error loading episodes.";
      console.error(error);
    });
}

function populateEpisodeSelector(episodeList) {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    option.value = String(episode.id);
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  episodeSelect.value = "all";
}

function resetEpisodeSelector() {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All episodes";
  episodeSelect.appendChild(allOption);
}

function updateEpisodesDisplay() {
  const searchTerm = document
    .getElementById("episode-search")
    .value.toLowerCase()
    .trim();

  const selectedEpisodeId = document.getElementById("episode-select").value;

  let filteredEpisodes = allEpisodes.filter((episode) => {
    const summary = episode.summary ? episode.summary.toLowerCase() : "";
    return (
      episode.name.toLowerCase().includes(searchTerm) ||
      summary.includes(searchTerm)
    );
  });

  if (selectedEpisodeId !== "all") {
    filteredEpisodes = filteredEpisodes.filter(
      (episode) => String(episode.id) === selectedEpisodeId,
    );
  }

  renderEpisodes(filteredEpisodes);
  updateEpisodeCount(filteredEpisodes.length, allEpisodes.length);
}

function renderEpisodes(episodeList) {
  const episodesContainer = document.getElementById("episodes-container");
  episodesContainer.innerHTML = "";

  episodeList.forEach((episode) => {
    const card = document.createElement("article");
    card.className = "episode-card";

    const title = document.createElement("h2");
    title.className = "episode-title";
    title.textContent = `${episode.name} - ${getEpisodeCode(episode)}`;

    const image = document.createElement("img");
    image.className = "episode-image";
    image.src = episode.image ? episode.image.medium : "";
    image.alt = episode.name;

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary || "<p>No summary available.</p>";

    card.append(title, image, summary);
    episodesContainer.appendChild(card);
  });
}

function updateEpisodeCount(current, total) {
  document.getElementById("episode-count").textContent =
    `Displaying ${current}/${total} episodes`;
}

function getEpisodeCode(episode) {
  const season = String(episode.season).padStart(2, "0");
  const number = String(episode.number).padStart(2, "0");
  return `S${season}E${number}`;
}

window.onload = setup;
