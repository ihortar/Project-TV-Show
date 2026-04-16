//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function formatEpisodeCode(season, episode) {
  const seasonString = String(season).padStart(2, "0");
  const episodeString = String(episode).padStart(2, "0");
  return `S${seasonString}E${episodeString}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const heading = document.createElement("h1");
  heading.textContent = "Game of Thrones Episodes";
  rootElem.appendChild(heading);

  const count = document.createElement("p");
  count.textContent = `Displaying ${episodeList.length} episode(s)`;
  rootElem.appendChild(count);

  const credit = document.createElement("p");
  credit.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank" rel="noopener noreferrer">TVMaze.com</a>';
  rootElem.appendChild(credit);

  // ===== CONTROLS =====
  const controls = document.createElement("div");
  controls.className = "controls";
  rootElem.appendChild(controls);

  // SEARCH INPUT
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  controls.appendChild(searchInput);

  // SELECT DROPDOWN
  const select = document.createElement("select");

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Jump to episode...";
  select.appendChild(defaultOption);

  controls.appendChild(select);

  const episodesContainer = document.createElement("div");
  episodesContainer.className = "episodes-container";
  rootElem.appendChild(episodesContainer);

  function renderEpisodes(list) {
    episodesContainer.innerHTML = "";

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
    image.src = episode.image.medium;
    image.alt = `${episode.name} episode image`;

    const summary = document.createElement("div");
    summary.className = "episode-summary";
    summary.innerHTML = episode.summary;

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
 
function populateSelect() {
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

  populateSelect();

  // ===== SEARCH LOGIC =====
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();

    if (!term) {
      renderEpisodes(episodeList);
      return;
    }

    const filtered = episodeList.filter((ep) =>
      ep.name.toLowerCase().includes(term) ||
      ep.summary.toLowerCase().includes(term)
    );

    renderEpisodes(filtered);
  });

  // ===== SELECT LOGIC =====
  select.addEventListener("change", () => {
      const id = select.value;
   if (!id) return;

  // ✅ remove old highlights
   document.querySelectorAll(".episode-card").forEach(card => {
    card.style.background = "white";
   });

  const element = document.getElementById(`episode-${id}`);

   if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // ✅ highlight new one only
    element.style.background = "#fff3a0";
   }
  });
  // ===== INITIAL RENDER =====
  renderEpisodes(episodeList);
}

window.onload = setup;
