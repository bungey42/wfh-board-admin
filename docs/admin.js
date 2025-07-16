
// ✅ Full working admin.js with Firebase, week dropdown, drag-and-drop, and half-day toggle (no modal)
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

  const employeeNames = ["Jack Wheeler", "Joe Bungey", "Daniela Kent", "NAME4", "NAME5", "NAME6", "NAME7"];
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

  const toggleDiv = document.createElement("div");
  toggleDiv.innerHTML = '<label><input type="checkbox" id="halfDayToggle"> Enable Half Day Mode</label>';
  document.body.insertBefore(toggleDiv, weekDropdown.parentNode);

  document.getElementById("halfDayToggle").addEventListener("change", function(e) {
    console.log("Half Day Mode is " + (e.target.checked ? "ON" : "OFF"));
  });

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

        const title = document.createElement("h2");
        title.textContent = columnLabels[col];
        colDiv.appendChild(title);

        const people = boardState?.[idx]?.[col] || [];
        people.forEach(name => {
          const card = document.createElement("div");
          card.className = "card";
          card.textContent = name;
          card.dataset.name = name;
          card.draggable = true;
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

  function moveCard(day, col, name) {
    columns.forEach(c => {
      boardState[day][c] = boardState[day][c].filter(n => n !== name);
    });
    boardState[day][col].push(name);
    renderBoard();
  }

  function loadWeekData() {
    const key = weekDropdown.value;
    selectedWeekKey = key;

    db.collection("boards").doc(key).get().then(doc => {
      const data = doc.exists ? doc.data() : {};
      boardState = data.state || getPrefilledState();
      bankHolidayChk.checked = !!data.bankHoliday;
      renderBoard();
    });
  }

  releaseBtn.addEventListener("click", () => {
    db.collection("boards").doc(selectedWeekKey).set({
      state: boardState,
      released: true,
      bankHoliday: bankHolidayChk.checked
    }).then(() => {
      statusMsg.textContent = "✅ Board released to team.";
      setTimeout(() => statusMsg.textContent = "", 3000);
    });
  });

  weekDropdown.addEventListener("change", loadWeekData);
  weekDropdown.selectedIndex = 0;
  loadWeekData();
});
