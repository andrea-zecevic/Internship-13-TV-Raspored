let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
  updateWatchlistDisplay();
});

let currentIndex = 0;
const programsPerPage = 2;
let parentalControlPIN = "1234";

function loadSchedule() {
  fetch("data/schedule.json")
    .then((response) => response.json())
    .then((data) => displaySchedule(data.channels))
    .catch((error) => console.error("Error loading schedule:", error));
}
function displaySchedule(channels) {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  const container = document.getElementById("schedule-container");
  container.innerHTML = "";

  channels.forEach((channel) => {
    const channelElement = document.createElement("div");
    const channelName = document.createElement("h2");
    channelName.textContent = channel.name;
    channelElement.appendChild(channelName);

    const sortedPrograms = channel.programs.sort((a, b) => {
      const [aHours, aMinutes] = a.startTime.split(":").map(Number);
      const [bHours, bMinutes] = b.startTime.split(":").map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });

    const displayedPrograms = sortedPrograms.slice(
      currentIndex,
      currentIndex + programsPerPage
    );

    displayedPrograms.forEach((program, index) => {
      const programElement = document.createElement("div");
      programElement.classList.add("program");

      const programId = `program-${program.name}-${program.startTime}`;
      programElement.setAttribute("data-program-id", programId);
      const isWatchlisted = watchlist.includes(programId);

      const [startHours, startMinutes] = program.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = program.endTime.split(":").map(Number);
      const programStartTotalMinutes = startHours * 60 + startMinutes;
      const programEndTotalMinutes = endHours * 60 + endMinutes;

      if (
        currentTotalMinutes >= programStartTotalMinutes &&
        currentTotalMinutes <= programEndTotalMinutes
      ) {
        programElement.classList.add("highlight");
      }

      programElement.innerHTML = `
  <h3>${program.name}</h3>
  <p>${program.startTime} - ${program.endTime}</p>
  <p>Kategorija: ${program.category}</p>
  <button class="watchlist-toggle" data-program-id="${programId}">${
        isWatchlisted ? "Ukloni iz Watchliste" : "Dodaj u Watchlistu"
      }</button>
`;

      const watchlistButton = programElement.querySelector(".watchlist-toggle");

      watchlistButton.addEventListener("click", function (e) {
        e.stopPropagation();
        const programId = this.getAttribute("data-program-id");
        const isAdded = watchlist.some((item) => item.id === programId);
        if (isAdded) {
          watchlist = watchlist.filter((item) => item.id !== programId);
          this.textContent = "Dodaj u Watchlistu";
        } else {
          watchlist.push({ id: programId, name: program.name });
          this.textContent = "Ukloni iz Watchliste";
        }
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        updateWatchlistDisplay();
      });

      programElement.addEventListener("click", () =>
        displayProgramDetails(program)
      );
      channelElement.appendChild(programElement);
    });

    container.appendChild(channelElement);
  });
}

document.getElementById("prev").addEventListener("click", () => {
  currentIndex = Math.max(currentIndex - programsPerPage, 0);
  loadSchedule();
});

document.getElementById("next").addEventListener("click", () => {
  currentIndex += programsPerPage;
  loadSchedule();
});

document
  .getElementById("change-pin")
  .addEventListener("click", changeParentalControlPIN);

function changeParentalControlPIN() {
  const newPin = prompt("Unesite novi PIN:");
  if (newPin.length >= 4 && newPin.length <= 8 && !isNaN(newPin)) {
    parentalControlPIN = newPin;
    alert("PIN je uspješno promijenjen.");
  } else {
    alert("PIN mora biti broj između 4 i 8 znamenki.");
  }
}

function displayProgramDetails(program) {
  if (program.category === "odrasli program") {
    const pin = prompt("Unesite PIN za roditeljsku zaštitu:");
    if (pin !== parentalControlPIN) {
      alert("Neispravan PIN!");
      return;
    }
  }

  document.getElementById("programName").textContent = program.name;
  document.getElementById(
    "programDescription"
  ).textContent = `Opis: ${program.description}`;
  document.getElementById(
    "programCategory"
  ).textContent = `Kategorija: ${program.category}`;
  document.getElementById(
    "programRating"
  ).textContent = `Ocjena: ${program.rating}/5`;
  document.getElementById("programRepeat").textContent = `Repriza: ${
    program.isRepeat ? "Da" : "Ne"
  }`;

  document.getElementById("programModal").style.display = "block";
}

document.querySelector(".close").onclick = function () {
  document.getElementById("programModal").style.display = "none";
};
window.onclick = function (event) {
  if (event.target == document.getElementById("programModal")) {
    document.getElementById("programModal").style.display = "none";
  }
};

function updateWatchlistDisplay() {
  const watchlistElement = document.getElementById("watchlist");
  watchlistElement.innerHTML = "";

  watchlist.forEach((item) => {
    if (item && item.name) {
      const listItem = document.createElement("li");
      listItem.textContent = item.name;
      watchlistElement.appendChild(listItem);
    }
  });
}
