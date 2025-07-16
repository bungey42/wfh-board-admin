
// Safe modal-enabled script with robust error wrapping
document.addEventListener("DOMContentLoaded", function () {
  try {
    const toggleDiv = document.createElement("div");
    toggleDiv.innerHTML = '<label><input type="checkbox" id="halfDayToggle" /> Enable Half Day Mode</label>';
    document.body.prepend(toggleDiv);

    const toggle = document.getElementById("halfDayToggle");
    toggle.addEventListener("change", function () {
      console.log("✅ Half Day Mode Toggled:", toggle.checked);
    });

    // Simulate dropdown content
    const weekDropdown = document.getElementById("weekDropdown");
    if (weekDropdown) {
      for (let i = 0; i < 3; i++) {
        const opt = document.createElement("option");
        opt.value = "2025-W3" + i;
        opt.textContent = "Week commencing 2025-W3" + i;
        weekDropdown.appendChild(opt);
      }
      weekDropdown.selectedIndex = 0;
    }

    // Add modal logic — safe wrapper
    function createHalfDayModal(name, callback) {
      try {
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "30%";
        modal.style.left = "30%";
        modal.style.padding = "20px";
        modal.style.background = "white";
        modal.style.border = "1px solid black";
        modal.innerHTML = `
          <p><strong>${name}</strong></p>
          <label><input type="radio" name="half" value="AM" checked /> AM</label>
          <label><input type="radio" name="half" value="PM" /> PM</label><br>
          <label>Other half:</label>
          <select id="otherColumn">
            <option>In Office</option>
            <option>Working from Home</option>
            <option>On Annual Leave</option>
            <option>Sick Leave</option>
          </select><br><br>
          <button id="confirmBtn">Confirm</button>
        `;
        document.body.appendChild(modal);
        document.getElementById("confirmBtn").addEventListener("click", () => {
          const half = modal.querySelector('input[name="half"]:checked').value;
          const other = modal.querySelector("#otherColumn").value;
          console.log("✅ Modal confirmed:", name, half, other);
          modal.remove();
          callback({ name, halfDay: true, half, other });
        });
      } catch (err) {
        console.error("❌ Modal logic failed", err);
      }
    }

    console.log("✅ Modal logic active");
  } catch (error) {
    console.error("❌ Script failed to run:", error);
  }
});
