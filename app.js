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

console.log(moment().format());
let taskID = 0;
$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  sendFireBase(task + " added");
  taskButtons(task);
  $("input").val("");
  taskID++;
});

const sendFireBase = task => {
  db.ref()
    .push(task)
    .then(err => console.log(err));
};

const taskButtons = (task, key) => {
  // const taskForm = $("<form>").attr("id", task);
  const taskForm = $("<form>").addClass("tasks");
  const taskLabel = $("<label>")
    .attr("name", key)
    .text("press to start");
  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
    "data-start": false
  });
  $(taskBtn).text(task);
  $(taskForm).append(taskLabel, taskBtn);
  $("#task-list").append(taskForm);
};

db.ref().on("child_added", function(snapshot) {
  const databaseTask = snapshot.val();
  const key = snapshot.key;
  // console.log(snapshot.key);
  console.log(databaseTask);
  taskButtons(databaseTask, key);
});

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  console.log($(this).text() + " clicked");
  console.log($(this).attr("id"));
  const name = $(this).attr("id");
  // console.log($(this).html("<label>"));
  const startTime = moment().format();
  console.log(startTime);
  const labelChange = $(`label[name="${name}"]`);
  console.log(labelChange);
  // console.log(labelChange[0].attributes);
  $(labelChange).text("press to stop");
});
