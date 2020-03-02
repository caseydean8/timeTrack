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
  clearTimeout(sW.intervalId);
  $("input").val("");
});

// ---------- Update Firebase from enter task submit --------------
const sendFireBase = task => {
  // clearTimeout(sW.intervalId);
  const newTask = {
    task: task,
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

// ==================== TASK BUTTONS ===============================

const stopWatch = {
  taskId: "",
  intervalId: 0,
  totalDuration: 0,
  startTime: 0,
  taskLabel: "",
  // prevTaskLabel: "",
  labelText: "",
  // prevLabelText: "",
  taskRunning: false,
  counter: false
};
taskLabelArr = [];
labelTextArr = [];

const sW = stopWatch;
console.log(sW.intervalId);

const taskButtons = (key, data) => {
  // stopWatch.taskRunning = data.taskRunning;
  // console.log(stopWatch.taskRunning + " task running");
  const taskForm = $("<form>").attr({ id: key, class: "tasks" });

  const taskBtn = $("<button>").attr({
    class: "task-button",
    id: key,
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

  stopWatch.taskLabel = $("<label>").attr({
    name: key,
    "data-name": data.task
  });
  // stopWatch.taskRunning = data.taskRunning;
  // stopWatch.labelText = data.task;
  // stopWatch.totalDuration = data.duration;
  // console.log(data.duration + " data.duration");
  // console.log(stopWatch.totalDuration);

  $(stopWatch.taskLabel).text(`${data.task}`);
  // console.log(data.taskRunning);
  // if (data.taskRunning) {
  //   stop();
  //   durationCalc(data.start, key);
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

// ---------------- TASK BUTTON --------------------------

$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  const name = $(this).attr("id");
  const dbr = db.ref(name);

  dbr.on("value", function(snapshot) {
    taskDuration = snapshot.val().dbDuration;
    startTime = snapshot.val().lastStartTime;
    taskRunning = snapshot.val().taskRunning;
  });
  let sendData = false;
  if (!startTime) sendData = true;

  taskLabelArr.unshift(name);
  taskLabelArr.length = 2;
  console.log(taskLabelArr);
  stopWatch.taskLabel = $(`label[name="${name}"]`);
  stopWatch.labelText = $(sW.taskLabel).data("name");
  // labelTextArr.push(sW.taskLabel);
  // console.log(labelTextArr);
  // let taskInterval = 0;
  if (!taskRunning) {
    sW.taskRunning;
    sW.taskId = name;
    startTime = moment().unix();
    counter(taskDuration);
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`)
      .attr({ style: "border-color: red" })
      .text("stop");
      if (taskLabelArr[0] != taskLabelArr[1]) {
        const previousName = taskLabelArr[1];
        const preLabel = $(`label[name=${previousName}]`).data("name");
        $(`label[name=${previousName}]`).text(preLabel);
      }
  } else {
    clearTimeout(sW.intervalId);
    !taskRunning;
    durationCalc(startTime, taskDuration, name);

    dbr.update({ taskRunning: false });
    $(stopWatch.taskLabel).text(`${stopWatch.labelText}`);
    $(`button#${name}`)
      .attr({ style: "border-color: yellow" })
      .text("resume");
  }
});

// -------------------- Clear Button -----------------------
$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");

  db.ref(clear).on("value", function(snapshot) {
    clrTaskRunning = snapshot.val().taskRunning;
    clrStartTime = snapshot.val().lastStartTime;
    clrDuration = snapshot.val().dbDuration;
  });

  if (clrTaskRunning) {
    durationCalc(clrStartTime, clrDuration, clear);
    counter(clrDuration);
    $(this).text("reset");
  } else {
    db.ref(clear)
      .update({
        dbDuration: 0,
        firstStartTime: 0,
        lastStartTime: 0,
        taskRunning: false
      })
      .catch(err => console.log(err));
    // stopWatch.taskLabel = $(`label[name="${clear}"]`);
    // stopWatch.labelText = $(stopWatch.taskLabel).data("name");
    sW.taskLabel = $(`label[name="${clear}"]`);
    sW.labelText = $(sW.taskLabel).data("name");
    $(sW.taskLabel).text(`${sW.labelText}`);
    $(`button#${clear}`).text("start");
  }
});
// *********************** DURATION CALCULATOR ***************************
const durationCalc = (start, prevDuration, id) => {
  let end = moment().unix();
  db.ref(id).update({ endTime: end });
  db.ref(id).on("value", snapshot => {
    end = snapshot.val().endTime;
  });
  const latestDuration = end - start;
  const totalDuration = prevDuration + latestDuration;
  db.ref(id).update({ dbDuration: totalDuration });
};

// +++++++++++++++++++++++++ INCREMENT ++++++++++++++++++++++++++++++++++++++
const counter = duration => {
  // console.log(sW.intervalId);
  clearTimeout(sW.intervalId);
  const increment = () => {
    duration++;
    runDuration = hhmmss(duration);
    $(stopWatch.taskLabel).text(`${stopWatch.labelText} ${runDuration}`);
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
