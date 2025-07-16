
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

  const employeeNames = ["Phil Boshier", "Oscar Dixon-Barrow", "Jack Perks", "Elaine Connell", "Martha Cumiskey", "Matt Owen", "Charlotte Berrow", "Hannah Lawry", "Molly McGuire", "Ben McKenna-Smith", "Ben Hackston", "Summer Bolitho", "Jack Wheeler"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const columns = ["In Office", "Working from Home", "On Annual Leave", "Sick Leave"];
  const columnLabels = {
    "In Office": "🏢 In Office",
    "Working from Home": "🏠 Working from Home",
    "On Annual Leave": "☀️ On Annual Leave",
    "Sick Leave": "🤒 Sick Leave"
  };

  const weekDropdown = document.getElementById("weekDropdown");
  const boardContainer = document.getElementById("adminBoardContainer");
  const releaseBtn = document.getElementById("releaseBtn");
  const statusMsg = document.getElementById("statusMessage");
  const bankHolidayChk = document.getElementById("bankHoliday");
  const mandatoryContainer = document.getElementById("mandatoryDaysContainer");

  let selectedWeekKey = "";
  let boardState = [];

  const currentMonday = new Date();
  currentMonday.setDate(currentMonday.getDate() - (currentMonday.getDay() - 1));
  for (let i = 0; i < 4; i++) {
    const monday = new Date(currentMonday);
    monday.setDate(monday.getDate() + (i * 7));
    const key = getWeekKeyFromDate(monday);
    const label = "Week commencing " + monday.toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    weekDropdown.appendChild(opt);
  }

  days.forEach((d, i) => {
    const label = document.createElement("label");
    label.innerHTML = '<input type="checkbox" class="mandatory-day" value="' + i + '"> ' + d;
    mandatoryContainer.appendChild(label);
  });

  function getWeekKeyFromDate(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");
  }

  function getPrefilledState() {
    return Array(5).fill().map(() => {
      return {
        "In Office": [...employeeNames],
        "Working from Home": [],
        "On Annual Leave": [],
        "Sick Leave": []
      };
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
          const card = document.createElement("div");
          card.className = "card";
          card.draggable = true;
          card.dataset.name = name;
          card.textContent = name;
          card.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text", name);
          });
          colDiv.appendChild(card);
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

  function loadWeekData() {
    const key = weekDropdown.value;
    selectedWeekKey = key;

    db.collection("boards").doc(key).get().then(doc => {
      const data = doc.exists ? doc.data() : {};

      if (!doc.exists) {
        boardState = getPrefilledState();  // auto fill new week
      } else {
        boardState = data.state || getPrefilledState();
      }

      bankHolidayChk.checked = !!data.bankHoliday;
      const mandays = data.mandatoryOfficeDays || [];
      document.querySelectorAll(".mandatory-day").forEach(cb => {
        cb.checked = mandays.includes(parseInt(cb.value));
      });

      renderBoard();
    });
  }

  releaseBtn.addEventListener("click", () => {
    const mandays = Array.from(document.querySelectorAll(".mandatory-day"))
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));

    db.collection("boards").doc(selectedWeekKey).set({
      state: boardState,
      released: true,
      bankHoliday: bankHolidayChk.checked,
      mandatoryOfficeDays: mandays
    }).then(() => {
      statusMsg.textContent = "✅ Board released to team.";
      setTimeout(() => statusMsg.textContent = "", 3000);
    });
  });

  weekDropdown.addEventListener("change", loadWeekData);
  weekDropdown.selectedIndex = 1;
  loadWeekData();
});
