
document.addEventListener("DOMContentLoaded", function () {
  // Firebase + Board Setup
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

  const employeeNames = ["Jack Wheeler","Joe Bungey","Daniela Kent","..."]; // ← truncate for brevity
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

  // Add Half Day Toggle
  const toggleDiv = document.createElement("div");
  toggleDiv.style.margin = "10px 0";
  toggleDiv.innerHTML = '<label><input type="checkbox" id="halfDayToggle" /> Enable Half Day Mode</label>';
  document.body.insertBefore(toggleDiv, weekDropdown.parentNode);
  document.getElementById("halfDayToggle").addEventListener("change", function(e) {
    console.log("Half Day Mode is " + (e.target.checked ? "ON" : "OFF"));
  });

  // Populate week dropdown
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

  // Dummy board state + rendering placeholder
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
    boardContainer.innerHTML = "<p><em>[Board would render here]</em></p>";
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

  weekDropdown.addEventListener("change", loadWeekData);
  weekDropdown.selectedIndex = 0;
  loadWeekData();
});
