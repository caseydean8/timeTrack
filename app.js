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
// firebase.analytics();
const db = firebase.database();

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  sendFireBase(task);
  $("input").val("");
});

const sendFireBase = task => {
  const newTask = {
    task: task,
    duration: 0
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

const taskButtons = (task, key) => {
  const taskForm = $("<form>").attr({id: key, "class": "tasks"});
  const taskLabel = $("<label>")
    .attr("name", key)
    .text("press to start");
  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
    "data-start": false
  });
  const deleteBtn = $("<button>").attr({"class": "delete-button", "data-delete": key});
  $(deleteBtn).text("delete");
  $(taskBtn).text(task);
  $(taskForm).append(taskLabel, taskBtn, deleteBtn);
  $("#task-list").append(taskForm);
};

db.ref().on("child_added", function(snapshot) {
  const databaseTask = snapshot.val().task;
  const key = snapshot.key;
  taskButtons(databaseTask, key);
});

let startTime;
let duration;

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  let timeStart = $(this).data("start");
  const name = $(this).attr("id");
  let totalDuration;
  db.ref(name).on("value", function(snapshot) {
    totalDuration = snapshot.val().duration;
  });

  const labelChange = $(`label[name="${name}"]`);
  if (!timeStart) {
    $(this).data("start", true);
    $(labelChange).text("press to stop tracking time");
    startTime = moment.utc();
    console.log(`start time is ${startTime}`);
    // startTaskTimer(startTime);
  } else {
    $(this).data("start", false);
    let endTime = moment.utc();
    duration = moment.duration(endTime.diff(startTime));
    totalDuration += duration;
    $(labelChange).text(
      `press to start ${moment(totalDuration).format("mm:ss")} minutes spent`
    );
    db.ref(name).update({ duration: totalDuration });
  }
});

$(document).on("click", ".delete-button", function(event) {
  event.preventDefault();
  const remove = $(this).data("delete");
  $(`#${remove}`).remove();
  db.ref(remove).remove();
})


// parse time using 24-hour clock and use UTC to prevent DST issues
// var start = moment.utc(startTime, "HH:mm");
// var end = moment.utc(endTime, "HH:mm");

// account for crossing over to midnight the next day
// if (end.isBefore(start)) end.add(1, "day");

// calculate the duration
// var d = moment.duration(end.diff(start));

// subtract the lunch break
// d.subtract(30, "minutes");

// format a string result
// var s = moment.utc(+d).format("H:mm");
