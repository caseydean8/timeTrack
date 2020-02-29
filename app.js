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

  const taskLabel = $("<label>").attr({ name: key, "data-name": data.task });
  data.taskRunning
    ? $(taskLabel).text(`${data.task}. . . `)
    : $(taskLabel).text(`${data.task} ${hhmmss(data.duration)}`);

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
let labelChange;
let labelText;
let intervalId;

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  // let taskRunning = false; // begins as false
  const name = $(this).attr("id");
  const dbr = db.ref(name);
  let totalDuration; // move this into db.ref?
  // let taskRunning;
  dbr.on("value", function(snapshot) {
    totalDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
    taskRunning = snapshot.val().taskRunning;
  });
  let sendData = false;
  if (!startTime) sendData = true;

  labelChange = $(`label[name="${name}"]`); // reference to task label
  labelText = $(labelChange).data("name");

  console.log(intervalId);
  const counter = () => {
    // if(!taskRunning) intervalId = setInterval(increment, 1000);
    intervalId = setInterval(increment, 1000);
  };
  const stop = () => {
    clearInterval(intervalId);
  };
  
  const increment = () => {
    totalDuration++;
    let runDuration = hhmmss(totalDuration);
    $(labelChange).text(`${labelText} ${runDuration}`);
  };

  if (!taskRunning) {
    // console.log(taskRunning);
    // turn startTime into a number before sending to database
    startTime = moment().unix();
    counter();
    // taskRunning = true;
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`).text("stop");
    // $(labelChange).text(`${labelText} ${runDuration}`);
  } else {
    console.log("fired else statement");
    // stop();
    clearInterval(intervalId);
    taskRunning = false;
    const endTime = moment().unix();
    
    duration = endTime - startTime;
    totalDuration += duration;
   
    const display = hhmmss(totalDuration);
    dbr.update({ dbDuration: totalDuration, taskRunning: false });
    $(labelChange).text(`${labelText} ${display}`);
    $(`button#${name}`).text("resume");
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

// const counter = () => {
//   let intervalId = setInterval(increment, 1000);
// }
// const increment = () => {
//   duration++;
//   let runDuration = hhmmss(duration);
// }

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
