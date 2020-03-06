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

$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  sendFireBase(task);
  clearTimeout(sW.intervalId);
  $("input").val("");
});

// ---------- Update Firebase from enter task submit --------------
const sendFireBase = task => {
  const newTask = {
    task: task,
    interval: 0,
    dbDuration: 0,
    firstStartTime: 0,
    lastStartTime: 0,
    endTime: 0,
    taskRunning: false
  };
  db.ref()
    .push(newTask)
    .catch(err => console.log(err));
};

db.ref().on("value", snapshot => (sW.taskObj = snapshot.val()));

db.ref().on("child_added", function(snapshot) {
  // const key = snapshot.key;
  // sW.taskObj = snapshot.val();
  // console.log(sW.taskObj);
  const dbData = {
    id: snapshot.key,
    task: snapshot.val().task,
    duration: snapshot.val().dbDuration,
    taskRunning: snapshot.val().taskRunning,
    start: snapshot.val().lastStartTime
  };
  // objectBuilder(dbData);
  taskButtons(dbData);
  sW.taskObjArr.push(dbData);
});

// const objectBuilder = data => {
//   // console.log(data);
//   taskObj = {
//     id: data.id,
//     task: data.task,
//     duration: data.duration,
//     taskRunning: data.taskRunning,
//     start: data.start,
//     taskLabel: ""
//   };
//   taskButtons(taskObj);
//   sW.taskObjArr.push(taskObj);
//   console.log(stopWatch);
// };

// ==================== TASK BUTTONS ===============================
const stopWatch = {
  taskId: "",
  intervalId: 0,
  totalDuration: 0,
  startTime: 0,
  taskLabel: "",
  labelText: "",
  taskRunning: false,
  taskObjArr: [],
  taskObj: {}
};
const sW = stopWatch;
// taskLabelArr = [];
// labelTextArr = [];

console.log(sW.intervalId);

const taskButtons = data => {
  const taskForm = $("<form>").attr({ id: data.id, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: data.id,
    style: "border-color: yellow"
  });
  // determine task button text and color

  data.duration
    ? $(taskBtn).text("resume")
    : $(taskBtn)
        .attr({ style: "border-color: green" })
        .text("start");

  if (data.taskRunning)
    $(taskBtn)
      .attr({ style: "border-color: red" })
      .text("stop");

  data.taskLabel = $("<label>").attr({
    name: data.id,
    "data-name": data.task
  });

  $(data.taskLabel).text(`${data.task} ${hhmmss(data.duration)} `);

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": data.id
    })
    .text("delete");

  // Clear Button
  const clearBtn = $("<button>")
    .attr({
      class: "clear-button",
      "data-clear": data.id
    })
    .text("reset");

  const progressBtn = $("<button>")
    .attr({ class: "progress-button", "data-progress": data.id })
    .text("progress");

  $(taskForm).append(data.taskLabel, taskBtn, clearBtn, progressBtn, deleteBtn);
  $("#task-list").prepend(taskForm);
};

// ---------------- TASK BUTTON --------------------------
$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  // console.log(sW.taskObjArr);
  const name = $(this).attr("id");

  const taskData = sW.taskObj[name];
  let taskDuration = taskData.dbDuration;
  let startTime = taskData.lastStartTime;
  let taskRunning = taskData.taskRunning;
  let task = taskData.task;

  const dbr = db.ref(name);

  let sendData = false;
  if (!startTime) sendData = true;

  let taskLabel = $(`label[name="${name}"]`);
  // labelText = $(taskLabel).data("name");
  // console.log(labelText);
  const resetBtn = $(`button[data-clear="${name}"]`);
  $(resetBtn).text("reset");

  if (!taskRunning) {
    taskRunning = true;
    startTime = moment().unix();
    counter(name, task, taskDuration);
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    checkIfRunning(name);
    $(`button#${name}`)
      .attr({ style: "border-color: red" })
      .text("stop");
  } else {
    taskRunning = false;
    clearTimeout(sW.intervalId);
    durationCalc(startTime, taskDuration, name);
    dbr.on("value", snapshot => (taskDuration = snapshot.val().dbDuration));
    $(taskLabel).text(`${task} ${hhmmss(taskDuration)}`);
    $(`button#${name}`)
      .attr({ style: "border-color: yellow" })
      .text("resume");
    dbr.update({ taskRunning: false });
  }
  sW.taskObjArr.forEach(item => {
    if (item.id === name) {
      item.taskRunning = taskRunning;
    }
  });
});

const checkIfRunning = id => {
  console.log(id);
  // console.log(sW.taskObjArr);
  sW.taskObjArr.forEach(taskObj => {
    console.log(taskObj.id, taskObj.taskRunning);
    if (taskObj.id != id && taskObj.taskRunning === true) {
      console.log(taskObj.id);
      $(`label[name=${taskObj.id}]`).text(`${taskObj.task} in progress`);
    }
  });
};

// -------------------- Reset Button -----------------------
$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");
console.log(sW.taskObj[clear]);
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

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Progress Button @@@@@@@@@@@@@@@@@@@@@@@@@
$(document).on("click", ".progress-button", function(event) {
  event.preventDefault();
  const progId = $(this).data("progress");
  const progData = sW.taskObj[progId];
  console.log(progData);
  let taskRunning = progData.taskRunning;
  let task = progData.task;
  let duration = progData.dbDuration;

  if (taskRunning) {
    counter(progId, task, duration);
    checkIfRunning(progId);
  }
});

// *********************** DURATION CALCULATOR ***************************
const durationCalc = (start, prevDuration, id) => {
  let end = moment().unix();
  // db.ref(id).update({ endTime: end });
  // db.ref(id).on("value", snapshot => {
  //   end = snapshot.val().endTime;
  // });
  const latestDuration = end - start;
  const totalDuration = prevDuration + latestDuration;
  // sW.totalDuration = totalDuration;
  db.ref(id).update({ endTime: end, dbDuration: totalDuration });
};

// +++++++++++++++++++++++++ INCREMENT ++++++++++++++++++++++++++++++++++++++
const counter = (id, task, duration) => {
  // let task;
  // sW.taskObjArr.forEach(object => {
  //   if (object.id === id) {
  //     // taskLabel = task.taskLabel;
  //     task = object.task;
  //   }
  // })
  clearTimeout(sW.intervalId);
  const increment = () => {
    duration++;
    const runDuration = hhmmss(duration);
    $(`label[name="${id}"]`).text(`${task} ${runDuration}`);
    sW.intervalId = setTimeout(increment, 1000);
    // sW.intervalId = 0;
  };
  interval = setTimeout(increment, 1000);
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

// less elegant version of hhmmss()
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
