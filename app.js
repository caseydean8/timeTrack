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
// let stopWatch.intervalId;
// let stopWatch.totalDuration;
// let stopWatch.taskLabel;
// let stopWatch.labelText;

const stopWatch = {
  intervalId: 0,
  totalDuration: 0,
  startTime: 0,
  taskLabel: "",
  labelText: "",
  taskRunning: false,
  counter: false
};
const sW = stopWatch;
// console.log(sW);

const taskButtons = (key, data) => {
  stopWatch.taskRunning = data.taskRunning;
  console.log(stopWatch.taskRunning + " task running");
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
    style: "border-color: yellow"
  });

  data.duration
    ? $(taskBtn).text("resume")
    : $(taskBtn)
        .attr({ style: "border-color: green" })
        .text("start");

  if (data.taskRunning)
    $(taskBtn)
      .attr({ style: "border-color: red" })
      .text("stop");

  stopWatch.taskLabel = $("<label>").attr({
    name: key,
    "data-name": data.task
  });
  stopWatch.taskRunning = data.taskRunning;
  stopWatch.labelText = data.task;
  stopWatch.totalDuration = data.duration;
  // console.log(data.duration + " data.duration");
  // console.log(stopWatch.totalDuration);

  $(stopWatch.taskLabel).text(`${data.task}`);
  // console.log(data.taskRunning);
  // if (data.taskRunning) {
  //   stop();
  //   taskDuration(data.start, key);
  //   counter();
  // }

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": key
    })
    .text("delete");

  console.log(stopWatch.counter);

  // Clear Button
  const clearBtn = $("<button>").attr({
    class: "clear-button",
    "data-clear": key
  });

  if (data.taskRunning && $(stopWatch.taskLabel).text(`${data.task}`)) {
    $(clearBtn).text("show progess");
  } else {
    $(clearBtn).text("reset");
  }

  $(taskForm).append(stopWatch.taskLabel, taskBtn, clearBtn, deleteBtn);
  $("#task-list").append(taskForm);
};


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

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  const name = $(this).attr("id");
  const dbr = db.ref(name);

  dbr.on("value", function(snapshot) {
    stopWatch.totalDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
    taskRunning = snapshot.val().taskRunning;
  });
  let sendData = false;
  if (!startTime) sendData = true;

  stopWatch.taskLabel = $(`label[name="${name}"]`); // reference to task label
  stopWatch.labelText = $(stopWatch.taskLabel).data("name");

  if (!taskRunning) {
    taskRunning;
    startTime = moment().unix();
    counter();
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`)
      .attr({ style: "border-color: red" })
      .text("stop");
  } else {
    clearInterval(stopWatch.intervalId);
    !taskRunning;
    taskDuration(startTime, name);

    dbr.update({ taskRunning: false });
    // $(stopWatch.taskLabel).text(`${stopWatch.labelText} ${display}`);
    $(`button#${name}`)
      .attr({ style: "border-color: yellow" })
      .text("resume");
  }
});

// -------------------- Clear Button -----------------------
$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");
  console.log(clear);
  stopWatch.taskLabel = $(`label[name="${clear}"]`);
  stopWatch.labelText = $(stopWatch.taskLabel).data("name");
  db.ref(clear).on("value", function(snapshot) {
    taskRunning = snapshot.val().taskRunning;
    startTime = snapshot.val().lastStartTime;
  })
  console.log(startTime);
  if (taskRunning) {
    taskDuration(startTime, clear);
    counter();
    $(this).text("reset");
  } 
  // else {
  //   db.ref(clear)
  //     .update({
  //       dbDuration: 0,
  //       firstStartTime: 0,
  //       lastStartTime: 0,
  //       taskRunning: false
  //     })
  //     .catch(err => console.log(err));
  //   const label = $(`label[name="${clear}"]`);
  //   const task = $(label).data("name");
  //   $(label).text(`${task} 0:00:00`);
  //   $(`button#${clear}`).text("start");
  // }
});
// *********************** DURATION CALCULATOR ***************************
const taskDuration = (start, id) => {
  // console.log(start + " start time in duration calc");
  const end = moment().unix();
  // console.log(end + " end time in duration calc");
  const duration = end - start;
  // console.log(duration + " duration time in duration calc")
  // console.log(stopWatch.totalDuration + " before");
  stopWatch.totalDuration += duration;
  // console.log(stopWatch.totalDuration + " after");
  db.ref(id).update({ dbDuration: stopWatch.totalDuration });
};

// +++++++++++++++++++++++++ INCREMENT ++++++++++++++++++++++++++++++++++++++
const counter = () => {
  console.log(stopWatch.counter);
  stopWatch.intervalId = setInterval(increment, 1000);
  console.log("counter hit");
  stopWatch.counter = true;
  console.log(stopWatch.counter);
};

const increment = () => {
  stopWatch.totalDuration++;
  runDuration = hhmmss(stopWatch.totalDuration);
  $(stopWatch.taskLabel).text(`${stopWatch.labelText} ${runDuration}`);
  console.log(stopWatch.counter);
  // console.log("increment hit")
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



// ---------------- NOT USED (yet)---------------------------------------------------
const stop = () => {
  clearInterval(stopWatch.intervalId);
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
