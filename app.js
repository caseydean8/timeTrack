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

console.log(moment().unix() + " timestamp on page load, Number");
// console.log(typeof moment().unix());

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
    lastStartTime: 0
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
  const duration = snapshot.val().dbDuration;
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
  const btnDataStart = $(this).data("start"); // begins as false
  console.log(btnDataStart);
  const name = $(this).attr("id");
  const dbr = db.ref(name);
  let totalDuration; // move this into db.ref?
  dbr.on("value", function(snapshot) {
    totalDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
  });
  console.log(startTime + " before conditional statements");
  let sendData = false;
  if (!startTime) sendData = true;

  labelChange = $(`label[name="${name}"]`); // reference to task label
  labelText = $(labelChange).data("name");

  if (!btnDataStart) {
    // turn startTime into a number before sending to database
    startTime = moment().unix();
    // startTime = moment();
    console.log(startTime + " if data-start is false");
    sendData
      ? dbr.update({ firstStartTime: startTime, lastStartTime: startTime })
      : dbr.update({ lastStartTime: startTime });
    $(`button#${name}`).text("stop");
    $(this).data("start", true);
    // startTaskTimer();
    // $(labelChange).html(`${labelText} ${stopwatchSpan} minutes spent`);
  } else {
    // clearInterval(timer);
    console.log(startTime + " start time when data-start is true");
    const endTime = moment().unix();
    // endTime += 0;
    console.log(endTime + " end time");
    // console.log(moment(startTime).fromNow("ss"))
    // duration = moment.subtract(startTime);
    duration = endTime - startTime;
    // console.log("duration is " + typeof duration);
    totalDuration += duration;
    // const secs = 456;

    const display = moment.utc(totalDuration * 1000).format("HH:mm:ss");
    console.log(display);
    // console.log("total duration is " + typeof totalDuration);
    dbr.update({ dbDuration: totalDuration });
    $(labelChange).html(
      `${labelText} ${display} minutes spent`
    );
    $(`button#${name}`).text("resume");
    $(this).data("start", false);
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
