
// Safe week dropdown formatting with labels like "Week commencing 21 July"
document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.getElementById("weekDropdown");

  function getMonday(iWeeksAhead = 0) {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (iWeeksAhead * 7);
    return new Date(now.setDate(diff));
  }

  for (let i = 0; i < 4; i++) {
    const monday = getMonday(i);
    const keyDate = new Date(monday);
    const weekKey = keyDate.toISOString().slice(0, 10); // for example '2025-07-21'

    const iso = new Date(Date.UTC(keyDate.getFullYear(), keyDate.getMonth(), keyDate.getDate()));
    const dayNum = iso.getUTCDay() || 7;
    iso.setUTCDate(iso.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(iso.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((iso - yearStart) / 86400000) + 1) / 7);
    const weekKeyFormatted = iso.getUTCFullYear() + "-W" + String(weekNum).padStart(2, "0");

    const label = "Week commencing " + monday.toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });

    const opt = document.createElement("option");
    opt.value = weekKeyFormatted;
    opt.textContent = label;
    dropdown.appendChild(opt);
  }

  dropdown.selectedIndex = 0;
});
