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

// console.log(moment().format());
// let taskID = 0;
$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  sendFireBase(task);
  taskButtons(task);
  $("input").val("");
  // taskID++;
});

const sendFireBase = task => {
  const newTask = {
    task: task, 
    duration: 0
  }
  db.ref()
    .push(newTask)
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
  const databaseTask = snapshot.val().task;
  const key = snapshot.key;
  console.log(snapshot.key);
  // console.log(databaseTask);
  taskButtons(databaseTask, key);
});
let startTime;
let duration;
let totalDuration = 0;

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  let timeStart = $(this).data("start");
  const name = $(this).attr("id");
  console.log(typeof(name))
  console.log(name.task);
  const labelChange = $(`label[name="${name}"]`);
  // let start = 0;
  if (!timeStart) {
    $(this).data("start", true);
    $(labelChange).text("press to stop");
    console.log("timeStart is false");
    startTime = moment.utc();
    console.log(`start time is ${startTime}`);
    // startTaskTimer(startTime);
  } else if (timeStart) {
    $(this).data("start", false);
    $(labelChange).text("press to start");
    console.log("timeStart is true");
    let endTime = moment.utc();
   
    duration = moment.duration(endTime.diff(startTime));
    // duration = moment.utc(+duration).format("H:mm:ss");
    totalDuration += duration;
    
    // totalDuration = moment.utc(totalDuration).format("H:mm:ss");
    console.log(`end time is ${endTime}`);
    console.log(`total time is ${duration}`);
    console.log(`total duration is ${totalDuration}`);
    db.ref(name).update({duration: totalDuration});
  }
});

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
