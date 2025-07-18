
// ✅ Fixed admin.js with safe emoji encoding
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

  const employeeNames = [
    "Joe Bungey", "Jeni Jones", "Phil Boshier", "Daniela Kent", "Gregg Raven",
    "Oscar Dixon-Barrow", "Jack Perks", "Elaine Connell", "Martha Cumiskey",
    "Matt Owen", "Charlotte Berrow", "Hannah Lawry", "Molly McGuire",
    "Ben McKenna-Smith", "Ben Hackston", "Summer Bolitho", "Jack Wheeler"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const columns = ["In Office", "Working from Home", "On Annual Leave", "Sick Leave"];
  const columnLabels = {
    "In Office": "\uD83C\uDFE2 In Office",
    "Working from Home": "\uD83C\uDFE0 Working from Home",
    "On Annual Leave": "\u2600\uFE0F On Annual Leave",
    "Sick Leave": "\uD83E\uDD12 Sick Leave"
  };

  // Remainder of logic will go in next step
});
