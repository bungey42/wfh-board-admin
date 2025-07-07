
document.addEventListener("DOMContentLoaded", function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCxHyL3-ecLuVjGrM2HjEbfAV7Kgh-Ufs8",
    authDomain: "wfh-board.firebaseapp.com",
    projectId: "wfh-board",
    storageBucket: "wfh-board.appspot.com",
    messagingSenderId: "204510362340",
    appId: "1:204510362340:web:77f93cb517cbbee2f70af1"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const employees = [{"Name": "Joe Bungey", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2022/03/Joe-Bungey.png"}, {"Name": "Jeni Jones", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2025/07/Untitled-design-6.png"}, {"Name": "Phil Boshier", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2020/11/38.jpg"}, {"Name": "Daniela Kent", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2023/02/11.jpg"}, {"Name": "Gregg Raven", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2022/09/Gregg-Raven.png"}, {"Name": "Oscar Dixon-Barrow", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2022/03/Oscar-Dixon-Barrow.png"}, {"Name": "Jack Perks", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2023/08/Headshots-1.png"}, {"Name": "Elaine Connell", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2022/06/14.jpg"}, {"Name": "Martha Cumiskey", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2023/07/Headshots-3.png"}, {"Name": "Matt Owen", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2025/05/matt-e1747131126274.png"}, {"Name": "Charlotte Berrow", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2025/05/Untitled-design-3-e1747750363328.png"}, {"Name": "Hannah Lawry", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2020/11/Hannah-Lawry-low-re.png"}, {"Name": "Molly McGuire", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2023/10/Molly-McGuire.png"}, {"Name": "Ben McKenna-Smith", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2023/04/Ben-McKenna-Smith-1.png"}, {"Name": "Ben Hackston", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2022/01/Headshots-2.png"}, {"Name": "Summer Bolitho", "Photo URL": "https://www.mustardjobs.co.uk/wp-content/uploads/2025/05/summer-e1747140054919.png"}];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const columns = ["In Office", "Working from Home", "On Annual Leave", "Sick Leave"];
  const columnLabels = {"In Office": "\ud83c\udfe2 In Office", "Working from Home": "\ud83c\udfe0 Working from Home", "On Annual Leave": "\u2600\ufe0f On Annual Leave", "Sick Leave": "\ud83e\udd12 Sick Leave"};
  const weekDropdown = document.getElementById("weekDropdown");
  const boardContainer = document.getElementById("adminBoardContainer");
  const releaseBtn = document.getElementById("releaseBtn");
  const statusMsg = document.getElementById("statusMessage");
  const bankHolidayChk = document.getElementById("bankHoliday");
  const mandatoryChk = document.getElementById("mandatoryInOffice");

  let selectedWeekKey = "";
  let selectedWeekLabel = "";
  let boardState = {};

  const today = new Date();
  const currentMonday = new Date(today.setDate(today.getDate() - (today.getDay() - 1)));
  const startWeeks = [];
  for (let i = 0; i < 4; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(currentMonday.getDate() + i * 7);
    startWeeks.push(monday);
  }

  startWeeks.forEach(date => {
    const key = getWeekKeyFromDate(date);
    const label = "Week commencing " + date.toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    weekDropdown.appendChild(opt);
  });

  weekDropdown.addEventListener("change", () => {
    selectedWeekKey = weekDropdown.value;
    selectedWeekLabel = weekDropdown.selectedOptions[0].textContent;
    loadWeekData();
  });

  function getWeekKeyFromDate(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");
  }

  function loadWeekData() {
    db.collection("boards").doc(selectedWeekKey).get().then(doc => {
      const data = doc.exists ? doc.data() : {};
      boardState = data.state || Array(5).fill().map(() =>
        Object.fromEntries(columns.map(c => [c, []]))
      );
      bankHolidayChk.checked = !!data.bankHoliday;
      mandatoryChk.checked = (data.mandatoryOfficeDays || []).includes(2); // Wednesday
      renderBoard();
    });
  }

  function renderBoard() {
    boardContainer.innerHTML = "";
    const tabs = document.createElement("div");
    tabs.className = "tabs";
    boardContainer.appendChild(tabs);

    const tabContent = document.createElement("div");
    boardContainer.appendChild(tabContent);

    days.forEach((day, idx) => {
      const btn = document.createElement("button");
      btn.className = "tab-button";
      btn.textContent = day;
      btn.addEventListener("click", () => {
        tabContent.querySelectorAll(".day-container").forEach(d => d.classList.remove("active"));
        tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("day-" + idx).classList.add("active");
      });
      tabs.appendChild(btn);

      const dayDiv = document.createElement("div");
      dayDiv.className = "day-container";
      dayDiv.id = "day-" + idx;

      const columnsDiv = document.createElement("div");
      columnsDiv.className = "columns";

      columns.forEach(col => {
        const colDiv = document.createElement("div");
        colDiv.className = "column";
        colDiv.dataset.day = idx;
        colDiv.dataset.column = col;

        const titleEl = document.createElement("h2");
        titleEl.textContent = columnLabels[col];
        colDiv.appendChild(titleEl);

        const names = boardState?.[idx]?.[col] || [];
        names.forEach(name => {
          const person = employees.find(p => p.Name === name);
          if (person) {
            const card = document.createElement("div");
            card.className = "card";
            card.draggable = true;
            card.dataset.name = person.Name;
            card.innerHTML = `<img src='${person["Photo URL"]}'><span>${person.Name}</span>`;
            card.addEventListener("dragstart", e => {
              e.dataTransfer.setData("text", person.Name);
            });
            colDiv.appendChild(card);
          }
        });

        colDiv.addEventListener("dragover", e => e.preventDefault());
        colDiv.addEventListener("drop", e => {
          const name = e.dataTransfer.getData("text");
          moveCard(idx, col, name);
        });

        columnsDiv.appendChild(colDiv);
      });

      dayDiv.appendChild(columnsDiv);
      tabContent.appendChild(dayDiv);
    });
    tabs.firstChild?.click();
  }

  function moveCard(day, column, name) {
    columns.forEach(col => {
      boardState[day][col] = (boardState[day][col] || []).filter(n => n !== name);
    });
    boardState[day][column].push(name);
    renderBoard();
  }

  releaseBtn.addEventListener("click", () => {
    const payload = {
      state: boardState,
      released: true,
      bankHoliday: bankHolidayChk.checked,
      mandatoryOfficeDays: mandatoryChk.checked ? [2] : []  // Wednesday
    };
    db.collection("boards").doc(selectedWeekKey).set(payload).then(() => {
      statusMsg.textContent = "Board released to team.";
      setTimeout(() => statusMsg.textContent = "", 3000);
    });
  });

  // Load first week by default
  weekDropdown.selectedIndex = 1;
  selectedWeekKey = weekDropdown.value;
  selectedWeekLabel = weekDropdown.selectedOptions[0].textContent;
  loadWeekData();
});
