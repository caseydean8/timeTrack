// const myKey = config.MY_Key;

var firebaseConfig = {
  // apiKey: myKey,
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

console.log(moment.utc());
console.log(typeof moment.utc());

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  sendFireBase(task);
  $("input").val("");
});

// ---------- Update Firebase from enter task submit --------------
const sendFireBase = task => {
  const newTask = {
    task: task,
    duration: 0,
    startTime: 0
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

const taskButtons = (task, key, duration) => {
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
    "data-start": false
  });
  duration ? $(taskBtn).text("resume") : $(taskBtn).text("start");

  const taskLabel = $("<label>").attr({ name: key, "data-name": task });
  duration = moment(duration).format("mm:ss");
  duration != "00:00"
    ? $(taskLabel).text(`${task} ${duration}`)
    : $(taskLabel).text(task);

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
  const duration = snapshot.val().duration;
  const key = snapshot.key;
  taskButtons(databaseTask, key, duration);
});

let timer;
const startTaskTimer = () => {
  timer = setInterval(stopWatch, 1000);
  // console.log(timer);
};

let timerDisplay;
let counter = 0;
// let stopwatchSpan = $("<span>");
const stopWatch = () => {
  timerDisplay = moment()
    .hour(0)
    .minute(0)
    .second(counter++)
    .format("HH:mm:ss");
  // console.log(timerDisplay);
  $(labelChange).text(`${labelText} ${timerDisplay}`);
  // console.log(stopwatchSpan);
  // console.log(typeof(timerDisplay)); // string
};

// ---------------- TASK BUTTON --------------------------
let startTime; // move this into db.ref?
let duration;
let labelChange;
let labelText;
$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  const btnDataStart = $(this).data("start");
  const name = $(this).attr("id");

  let totalDuration; // move this into db.ref?
  db.ref(name).on("value", function(snapshot) {
    totalDuration = snapshot.val().duration;
    // startTime = snapshot.val().startTime;
  });

  labelChange = $(`label[name="${name}"]`); // reference to task label
  labelText = $(labelChange).data("name");

  if (!btnDataStart) {
    $(this).data("start", true);
    $(`button#${name}`).text("stop");

    startTime = moment.utc();
    // turn startTime into a number before sending to database
    startTime += 0;
    console.log(startTime, typeof startTime);
    db.ref(name).update({ startTime: startTime });
    // totalDuration = moment(totalDuration).format("ss");
    // startTaskTimer();
    // $(labelChange).html(`${labelText} ${stopwatchSpan} minutes spent`);
  } else {
    $(this).data("start", false);
    clearInterval(timer);
    let endTime = moment.utc();
    duration = moment.duration(endTime.diff(startTime));
    console.log("duration is " + typeof duration);
    totalDuration += duration;
    console.log("total duration is " + typeof totalDuration);
    db.ref(name).update({ duration: totalDuration });
    $(labelChange).html(
      `${labelText} ${moment(totalDuration).format("mm:ss")} minutes spent`
    );
    $(`button#${name}`).text("resume");
  }
});

// ------------------ Delete Button -------------------------
$(document).on("click", ".delete-button", function(event) {
  event.preventDefault();
  const remove = $(this).data("delete");
  $(`#${remove}`).remove();
  db.ref(remove)
    .remove()
    .catch(err => console.log(err));
});

// --------------------------- UN used time converter -----------------------------------
function timeConverter(t) {
  //  Takes the current time in seconds and convert it to minutes and seconds (mm:ss).
  var minutes = Math.floor(t / 60);
  var seconds = t - minutes * 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (minutes === 0) {
    minutes = "00";
  } else if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return minutes + ":" + seconds;
}

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
