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

const taskButtons = (task, key, duration) => {
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });
  const taskLabel = $("<label>")
    .attr({ name: key, "data-name": task })
    .text(task);
  const taskBtn = $("<button>")
    .attr({
      class: "task-button",
      id: key,
      "data-start": false
    });
  (duration) ? $(taskBtn).text("resume") : $(taskBtn).text("start");
  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": key
    })
    .text("delete");

  $(taskForm).append(taskLabel, taskBtn, deleteBtn);
  $("#task-list").append(taskForm);
};

db.ref().on("child_added", function(snapshot) {
  const databaseTask = snapshot.val().task;
  const duration = snapshot.val().duration
  const key = snapshot.key;
  taskButtons(databaseTask, key, duration);
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
  })
  // .catch(err => console.log(err));

  const labelChange = $(`label[name="${name}"]`);
  const labelText = $(labelChange).data("name");
  if (!timeStart) {
    $(this).data("start", true);
    $(labelChange).text(`${labelText} . . .`);
    $(`button#${name}`).text("stop");
    startTime = moment.utc();
    // startTaskTimer(startTime);
  } else {
    $(this).data("start", false);
    let endTime = moment.utc();
    duration = moment.duration(endTime.diff(startTime));
    totalDuration += duration;
    db.ref(name).update({ duration: totalDuration });
    $(labelChange).html(
      `${labelText} <br>${moment(totalDuration).format("mm:ss")} minutes spent`
      );
    $(`button#${name}`).text("resume");
    }
});

$(document).on("click", ".delete-button", function(event) {
  event.preventDefault();
  const remove = $(this).data("delete");
  $(`#${remove}`).remove();
  db.ref(remove)
    .remove()
    .catch(err => console.log(err));
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
