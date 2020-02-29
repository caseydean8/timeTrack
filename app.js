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
    taskRunning: false
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

// ==================== TASK BUTTONS ===============================
let intervalId;
let totalDuration;
let taskLabel;
let labelText;

const taskButtons = (key, data) => {
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
    style: "background-color: yellow"
  });
  data.duration
    ? $(taskBtn).text("resume")
    : $(taskBtn)
        .attr({ style: "background-color: green" })
        .text("start");
  if (data.taskRunning)
    $(taskBtn)
      .attr({ style: "background-color: red" })
      .text("stop");

  taskLabel = $("<label>").attr({ name: key, "data-name": data.task });
  labelText = data.task;
  if (data.taskRunning) {
    totalDuration = data.duration;
    // intervalId = setInterval(increment(), 1000);
    counter();
    // $(taskLabel).text(`${data.task} `);
  } else {
    $(taskLabel).text(`${data.task} ${hhmmss(data.duration)}`);
  }

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": key
    })
    .text("delete");

  const clearBtn = $("<button>")
    .attr({ class: "clear-button", "data-clear": key })
    .text("reset");

  $(taskForm).append(taskLabel, taskBtn, clearBtn, deleteBtn);
  $("#task-list").append(taskForm);
};

// window.onload = taskButtons();

db.ref().on("child_added", function(snapshot) {
  const key = snapshot.key;
  const dbData = {
    task: snapshot.val().task,
    duration: snapshot.val().dbDuration,
    taskRunning: snapshot.val().taskRunning,
    start: snapshot.val().lastStartTime
  };
  taskButtons(key, dbData);
});

// ---------------- TASK BUTTON --------------------------
// let startTime; // move this into db.ref?
let duration;

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  // let taskRunning = false; // begins as false
  const name = $(this).attr("id");
  const dbr = db.ref(name);
  // let taskRunning;
  dbr.on("value", function(snapshot) {
    totalDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
    taskRunning = snapshot.val().taskRunning;
  });
  let sendData = false;
  if (!startTime) sendData = true;

  taskLabel = $(`label[name="${name}"]`); // reference to task label
  labelText = $(taskLabel).data("name");

  console.log(intervalId);
  
  const stop = () => {
    clearInterval(intervalId);
  };


  if (!taskRunning) {
    // console.log(taskRunning);
    console.log(totalDuration);
    // turn startTime into a number before sending to database
    startTime = moment().unix();
    // counter();
    // intervalId = setInterval(function() {increment(totalDuration)}, 1000);
    intervalId = setInterval(increment, 1000);
    // taskRunning = true;
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`).text("stop");
    // $(taskLabel).text(`${labelText} ${runDuration}`);
  } else {
    // stop();
    clearInterval(intervalId);
    taskRunning = false;
    const endTime = moment().unix();

    duration = endTime - startTime;
    totalDuration += duration;

    const display = hhmmss(totalDuration);
    dbr.update({ dbDuration: totalDuration, taskRunning: false });
    $(taskLabel).text(`${labelText} ${display}`);
    $(`button#${name}`).text("resume");
  }
});

// +++++++++++++++++++++++++ INCREMENT ++++++++++++++++++++++++++++++++++++++
const counter = () => {
  // if(!taskRunning) intervalId = setInterval(increment, 1000);
  intervalId = setInterval(increment, 1000);
};
const increment = () => {
  console.log("increment hit");
  totalDuration++;
  runDuration = hhmmss(totalDuration);
  console.log(runDuration);
  $(taskLabel).text(`${labelText} ${runDuration}`);
};

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

// -------------------- Clear Button -----------------------
$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");
  db.ref(clear)
    .update({
      dbDuration: 0,
      firstStartTime: 0,
      lastStartTime: 0,
      taskRunning: false
    })
    .catch(err => console.log(err));
  const label = $(`label[name="${clear}"]`);
  const task = $(label).data("name");
  $(label).text(`${task} 0:00:00`);
  $(`button#${clear}`).text("start");
});

// ---------------- NOT USED (yet)---------------------------------------------------

let timer;
const startTaskTimer = () => {
  timer = setInterval(stopWatch, 1000);
  // console.log(timer);
};

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
// let counter = 0;
// let stopwatchSpan = $("<span>");
const stopWatch = () => {
  timerDisplay = moment()
    .hour(0)
    .minute(0)
    .second(counter++)
    .format("HH:mm:ss");
  // console.log(timerDisplay);
  $(taskLabel).text(`${labelText} ${timerDisplay}`);
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
