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
firebase.analytics();
const db = firebase.database();

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  sendFireBase(task);
  $("input").val("");
});

// ---------- Update Firebase from enter task submit --------------
const sendFireBase = task => {
  const newTask = {
    dbDuration: 0,
    endTime: 0,
    firstStartTime: 0,
    interval: 0,
    lastStartTime: 0,
    task: task,
    taskRunning: false
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

db.ref().on("value", snapshot => {
  sW.taskObj = snapshot.val();
});

db.ref().on("child_added", function(snapshot) {
  const dbData = snapshot.val();
  dbData.id = snapshot.key;
  taskButtons(dbData);
  sW.taskObjArr.push(dbData);
});

// =========== TASK BUTTON CREATOR ===========
const stopWatch = {
  taskObjArr: [],
  taskObj: {}
};
const sW = stopWatch;

const taskButtons = data => {
  const taskForm = $("<form>").attr({ id: data.id, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: data.id,
    style: "border-color: lightgreen; color: green"
  });
  // determine task button text and color

  data.dbDuration ? $(taskBtn).text("resume") : $(taskBtn).text("start");

  const taskLabel = $("<label>")
    .attr({
      class: "task-label",
      name: data.id,
      "data-name": data.task
    })
    .text(`${data.task}`);

  const durLabel = $("<label>")
    .attr({ class: "duration-label", "data-dur": data.id })
    .text(hhmmss(data.dbDuration));

  if (data.taskRunning) {
    $(taskBtn)
      .attr({ style: "border-color: red" })
      .text("stop");
    $(durLabel).text(`in progress`);
  }

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": data.id
    })
    .text("delete");

  const clearBtn = $("<button>")
    .attr({
      class: "clear-button",
      "data-clear": data.id
    })
    .text("reset");

  const progressBtn = $("<button>")
    .attr({ class: "progress-button", "data-progress": data.id })
    .text("progress");

  $(taskForm).append(
    taskLabel,
    durLabel,
    taskBtn,
    clearBtn,
    progressBtn,
    deleteBtn
  );
  $("#task-list").prepend(taskForm);
};

// ----------- TASK BUTTON -----------

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  const name = $(this).attr("id");
  // data from the database
  const taskData = sW.taskObj[name];
  let taskDuration = taskData.dbDuration;
  let startTime = taskData.lastStartTime;
  let taskRunning = taskData.taskRunning;
  let task = taskData.task;

  const dbr = db.ref(name);

  let sendData = false;
  if (!startTime) sendData = true;

  const taskLabel = $(`label[name="${name}"]`);
  const durLabel = $(`label[data-dur="${name}"]`);
  if (!taskRunning) {
    taskRunning = true;
    startTime = moment().unix();
    const startDate = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
    counter(name, task, taskDuration);
    if (sendData)
      dbr.update({ firstStartTime: startDate, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`)
      .attr({ style: "border-color: red" })
      .text("stop");
  } else {
    taskRunning = false;
    stop(name);
    durationCalc(startTime, taskDuration, name);
    dbr.on("value", snapshot => (taskDuration = snapshot.val().dbDuration));
    $(taskLabel).text(`${task}`);
    $(durLabel).text(`${hhmmss(taskDuration)}`);
    $(`button#${name}`)
      .attr({ style: "border-color: green" })
      .text("resume");
    dbr.update({ taskRunning: false });
  }
  sW.taskObjArr.forEach(item => {
    if (item.id === name) {
      item.taskRunning = taskRunning;
    }
  });
});

// ----------- Reset Button -----------

$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");
  stop(clear);
  checkIfRunning(clear);
  db.ref(clear)
    .update({
      dbDuration: 0,
      firstStartTime: 0,
      lastStartTime: 0,
      taskRunning: false
    })
    .catch(err => console.log(err));

  let clrTaskLabel = $(`label[name="${clear}"]`);
  let clrTask = sW.taskObj[clear].task;
  let timeDisplay = sW.taskObj[clear].dbDuration;
  $(clrTaskLabel).text(`${clrTask} ${hhmmss(timeDisplay)}`);
  $(`button#${clear}`).text("start");
});

// @@@@@@@@@@@ Progress Button @@@@@@@@@@@

$(document).on("click", ".progress-button", function(event) {
  event.preventDefault();
  const progId = $(this).data("progress");
  const progData = sW.taskObj[progId];
  const taskRunning = progData.taskRunning;
  const task = progData.task;
  let duration = progData.dbDuration;
  const dbStart = progData.lastStartTime;
  if (taskRunning) {
    const progStart = moment().unix();
    duration += progStart - dbStart;
    stop(progId);
    counter(progId, task, duration);
    db.ref(progId).update({ dbDuration: duration, lastStartTime: progStart });
  }
});

// ----------- Delete Button -----------

$(document).on("click", ".delete-button", function(event) {
  event.preventDefault();
  const remove = $(this).data("delete");
  $(`#${remove}`).remove();
  db.ref(remove)
    .remove()
    .catch(err => console.log(err));
});

// *********** DURATION CALCULATOR ***********

const durationCalc = (start, prevDuration, id) => {
  const end = moment().unix();
  const endDate = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
  const latestDuration = end - start;
  const totalDuration = prevDuration + latestDuration;
  db.ref(id).update({ endTime: endDate, dbDuration: totalDuration });
};

// +++++++++++ INCREMENT +++++++++++

const counter = (id, task, duration) => {
  const increment = () => {
    duration++;
    const runDuration = hhmmss(duration);
    $(`label[name="${id}"]`).text(`${task}`);
    $(`label[data-dur="${id}"]`).text(`${runDuration}`);
    sW.taskObj[id].interval = setTimeout(increment, 1000);
  };
  interval = setTimeout(increment, 1000);
};

// ----------- time converter -----------

const hhmmss = secs => {
  let minutes = Math.floor(secs / 60);
  secs = secs % 60;
  if (secs < 10) secs = `0${secs}`;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  if (minutes < 10) minutes = `0${minutes}`;
  let display;
  hours === 0
    ? (display = `${minutes}:${secs}`)
    : (display = `${hours}:${minutes}:${secs}`);
  // hours + ":" + minutes + ":" + secs; for old browsers
  return display;
};

const stop = id => {
  clearTimeout(sW.taskObj[id].interval);
};
