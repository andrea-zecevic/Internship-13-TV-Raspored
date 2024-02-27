document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();
});

let currentIndex = 0;
const programsPerPage = 2;

function loadSchedule() {
  fetch("data/schedule.json")
    .then((response) => response.json())
    .then((data) => displaySchedule(data.channels))
    .catch((error) => console.error("Error loading schedule:", error));
}

function displaySchedule(channels) {
  const now = new Date();
  const container = document.getElementById("schedule-container");
  container.innerHTML = "";

  channels.forEach((channel) => {
    const channelElement = document.createElement("div");
    const channelName = document.createElement("h2");
    channelName.textContent = channel.name;
    channelElement.appendChild(channelName);

    const sortedPrograms = channel.programs.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    const displayedPrograms = sortedPrograms.slice(
      currentIndex,
      currentIndex + programsPerPage
    );

    displayedPrograms.forEach((program) => {
      const programElement = document.createElement("div");
      programElement.classList.add("program");
      if (
        new Date(program.startTime) <= now &&
        new Date(program.endTime) > now
      ) {
        programElement.classList.add("highlight");
      }

      programElement.innerHTML = `
          <h3>${program.name}</h3>
          <p>${new Date(program.startTime).toLocaleTimeString()} - ${new Date(
        program.endTime
      ).toLocaleTimeString()}</p>
          <p>${program.description}</p>
          <p>Kategorija: ${program.category}</p>
          <p>Ocjena: ${program.rating}</p>
        `;
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
