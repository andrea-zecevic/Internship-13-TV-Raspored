document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
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

    displayedPrograms.forEach((program) => {
      const programElement = document.createElement("div");
      programElement.classList.add("program");

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
      `;
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

function displayProgramDetails(program) {
  if (program.category === "odrasli program") {
    const pin = prompt("Unesite PIN za roditeljsku zaštitu:");
    if (pin !== parentalControlPIN) {
      alert("Neispravan PIN!");
      return;
    }
  }

  alert(
    `Detalji programa: ${program.name}\nOpis: ${
      program.description
    }\nRepriza: ${program.isRepeat ? "Da" : "Ne"}\nOcjena: ${program.rating}/5`
  );
}

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
