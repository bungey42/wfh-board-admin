
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

  // Check that the half day toggle is visible and functional
  const toggleCheck = document.createElement("div");
  toggleCheck.innerHTML = `
<!-- Added at top of HTML body in the real app -->
<div style="margin: 10px 0;">
  <label>
    <input type="checkbox" id="halfDayToggle" />
    Enable Half Day Mode
  </label>
</div>
`;
  document.body.prepend(toggleCheck);

  // Console log only — no change to board behavior yet
  document.getElementById("halfDayToggle").addEventListener("change", function (e) {
    console.log("Half Day Mode: " + (e.target.checked ? "ON" : "OFF"));
  });

  console.log("✅ Half Day Toggle loaded safely.");
});
