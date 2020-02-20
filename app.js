var firebaseConfig = {
  apiKey: "AIzaSyD98tdru_9Lj2pbzUUK2RGyuQADgvdKGJU",
  authDomain: "timetracker-9b3d1.firebaseapp.com",
  databaseURL: "https://timetracker-9b3d1.firebaseio.com",
  projectId: "timetracker-9b3d1",
  storageBucket: "timetracker-9b3d1.appspot.com",
  messagingSenderId: "1048812785668",
  appId: "1:1048812785668:web:cfe809c025700bd996a551",
  measurementId: "G-M2K5902JEQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.database();

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  sendFireBase(task);
  taskButtons(task);
  $("input").val("");
})

const sendFireBase = (task) => {
  db.ref().push(task);
}

const taskButtons = (task) => {
  const taskLabel = $("<label>").text("press to start");
  const taskBtn = $("<button>").addClass("task-button");
  $(taskBtn).text(task);
  $("#task-list").append(taskLabel, taskBtn);
}

db.ref().on("child_added", function(snapshot) {
  const databaseTask = snapshot.val();
  console.log(databaseTask);
  taskButtons(databaseTask);
})