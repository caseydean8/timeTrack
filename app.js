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

// console.log(moment().unix() + " timestamp on page load, Number");
// console.log(moment());

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  sendFireBase(task);
  $("input").val("");
});

// ---------- Update Firebase from enter task submit --------------
const sendFireBase = task => {
  const newTask = {
    task: task,
    dbDuration: 0,
    firstStartTime: 0,
    lastStartTime: 0,
    dataStart: false
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

const taskButtons = (task, duration, taskRunning, key) => {
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key
    // "data-start": false
  });
  duration ? $(taskBtn).text("resume") : $(taskBtn).text("start");
  if (taskRunning) $(taskBtn).text("stop");

  const taskLabel = $("<label>").attr({ name: key, "data-name": task });
  taskRunning
    ? $(taskLabel).text(`${task}. . . in progress`)
    : $(taskLabel).text(`${task} ${hhmmss(duration)}`);

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": key
    })
    .text("delete");

  $(taskForm).append(taskLabel, taskBtn, deleteBtn);
  $("#task-list").append(taskForm);
};

// window.onload = taskButtons();

db.ref().on("child_added", function(snapshot) {
  const databaseTask = snapshot.val().task;
  const duration = snapshot.val().dbDuration;
  const taskRunning = snapshot.val().dataStart;
  const key = snapshot.key;
  console.log("child added");
  taskButtons(databaseTask, duration, taskRunning, key);
});

let timer;
const startTaskTimer = () => {
  timer = setInterval(stopWatch, 1000);
  // console.log(timer);
};

// ---------------- TASK BUTTON --------------------------
let startTime; // move this into db.ref?
let duration;
let labelChange;
let labelText;
$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  // let taskRunning = false; // begins as false
  const name = $(this).attr("id");
  const dbr = db.ref(name);
  let totalDuration; // move this into db.ref?
  dbr.on("value", function(snapshot) {
    totalDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
    taskRunning = snapshot.val().dataStart;
  });
  console.log("task running is " + taskRunning);
  let sendData = false;
  if (!startTime) sendData = true;
  console.log("send data " + sendData);

  labelChange = $(`label[name="${name}"]`); // reference to task label
  labelText = $(labelChange).data("name");

  if (!taskRunning) {
    // turn startTime into a number before sending to database
    startTime = moment().unix();
    // startObj = moment();
    console.log(startTime + " if task runnin is false");
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, dataStart: true });
    $(`button#${name}`).text("stop");
    // startTaskTimer();
    $(labelChange).text(`${labelText} . . .`);
  } else {
    // clearInterval(timer);
    const endTime = moment().unix();
    // endObj = moment();
    // difference = moment.duration(endObj.diff(startObj));
    // console.log(difference + "difference")
    // difFormat = moment(difference).format("mm:ss");
    // console.log(difFormat);
    duration = endTime - startTime;
    totalDuration += duration;
    // const display = moment.utc(totalDuration * 1000).format("HH:mm:ss");
    // const display = timeConverter(totalDuration);
    const display = hhmmss(totalDuration);
    dbr.update({ dbDuration: totalDuration, dataStart: false });
    $(labelChange).html(`${labelText} ${display}`);
    $(`button#${name}`).text("resume");
    // $(this).data("start", false);
  }
});

// --------------------------- time converter -----------------------------------
const hhmmss = secs => {
  let minutes = Math.floor(secs / 60);
  secs = secs % 60;
  if (secs < 10) secs = `0${secs}`;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  if (minutes < 10) minutes = `0${minutes}`;
  return `${hours}:${minutes}:${secs}`;
  // return hours + ":" + minutes + ":" + secs; for old browsers
};

// ------------------ Delete Button -------------------------
$(document).on("click", ".delete-button", function(event) {
  event.preventDefault();
  const remove = $(this).data("delete");
  $(`#${remove}`).remove();
  db.ref(remove)
    .remove()
    .catch(err => console.log(err));
});

// ---------------- NOT USED ---------------------------------------------------
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
