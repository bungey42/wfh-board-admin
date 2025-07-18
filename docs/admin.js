// Full admin.js with: half-day toggle, drag memory, reset button, emoji-safe
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

  const employeeNames = [ "Joe Bungey", "Jeni Jones", "Phil Boshier", "Daniela Kent", "Gregg Raven",
    "Oscar Dixon-Barrow", "Jack Perks", "Elaine Connell", "Martha Cumiskey", "Matt Owen",
    "Charlotte Berrow", "Hannah Lawry", "Molly McGuire", "Ben McKenna-Smith",
    "Ben Hackston", "Summer Bolitho", "Jack Wheeler" ];

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

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🔁 Reset Week";
  releaseBtn.parentNode.insertBefore(resetBtn, releaseBtn.nextSibling);

  const halfDayToggle = document.createElement("label");
  halfDayToggle.innerHTML = `<input type="checkbox" id="halfDayToggle"> Enable Half-Day Mode`;
  releaseBtn.parentNode.insertBefore(halfDayToggle, releaseBtn);

  let selectedWeekKey = "";
  let boardState = [];
  let activeTabIndex = 0;

  function getWeekKeyFromDate(dateObj) {
    const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");
  }

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

  function getPrefilledState() {
    return Array(5).fill().map(() => {
      return {
        "In Office": employeeNames.map(name => name),
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
        activeTabIndex = idx;
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
        people.forEach(entry => {
          const isObj = typeof entry === "object";
          const name = isObj ? entry.name : entry;
          const label = isObj && entry.half ? `${name} (${entry.half})` : name;

          const card = document.createElement("div");
          card.className = "card";
          card.textContent = label;
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
          const halfDayEnabled = document.getElementById("halfDayToggle").checked;

if (halfDayEnabled) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.background = "#fff";
  modal.style.padding = "20px";
  modal.style.border = "1px solid #ccc";
  modal.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  modal.style.zIndex = 1000;

  modal.innerHTML = `
    <h3>Select half-day options for ${name}</h3>
    <label>Which half is <strong>${col}</strong>?
      <select id="halfSelect">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </label>
    <br><br>
    <label>Other half location:
      <select id="otherSelect">
        ${columns.filter(c => c !== col).map(c => `<option value="${c}">${columnLabels[c]}</option>`).join("")}
      </select>
    </label>
    <br><br>
    <button id="confirmHalf">Confirm</button>
    <button id="cancelHalf">Cancel</button>
  `;

  document.body.appendChild(modal);

  document.getElementById("cancelHalf").onclick = () => {
    document.body.removeChild(modal);
  };

  document.getElementById("confirmHalf").onclick = () => {
    const half = document.getElementById("halfSelect").value;
    const other = document.getElementById("otherSelect").value;

    columns.forEach(c => {
      boardState[idx][c] = boardState[idx][c].filter(n =>
        (typeof n === "object" ? n.name : n) !== name
      );
    });

    boardState[idx][col].push({ name, half });
    boardState[idx][other].push({ name, half: half === "AM" ? "PM" : "AM" });

    document.body.removeChild(modal);
    renderBoard();
  };

  return;
}


          renderBoard(); // keep current tab
        });

        columnsDiv.appendChild(colDiv);
      });

      dayDiv.appendChild(columnsDiv);
      tabContent.appendChild(dayDiv);
    });

    tabs.children[activeTabIndex]?.click();
  }

  function moveCard(day, col, name) {
    columns.forEach(c => {
      boardState[day][c] = boardState[day][c].filter(n => {
        const entry = typeof n === "object" ? n.name : n;
        return entry !== name;
      });
    });
    boardState[day][col].push(name);
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

  resetBtn.addEventListener("click", () => {
    if (confirm("This will permanently reset the board for this week. Are you sure?")) {
      db.collection("boards").doc(selectedWeekKey).delete().then(() => {
        statusMsg.textContent = "🔁 Week reset.";
        boardState = getPrefilledState();
        renderBoard();
        setTimeout(() => statusMsg.textContent = "", 3000);
      });
    }
  });

  weekDropdown.addEventListener("change", loadWeekData);
  weekDropdown.selectedIndex = 0;
  loadWeekData();
});
