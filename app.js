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
  // const key = snapshot.key;
  const dbData = {
    id: snapshot.key,
    task: snapshot.val().task,
    duration: snapshot.val().dbDuration,
    taskRunning: snapshot.val().taskRunning,
    start: snapshot.val().lastStartTime
  };
  objectBuilder(dbData);
});

const objectBuilder = (data) => {
  // console.log(data);
  taskObj = {
    id: data.id,
    task: data.task,
    duration: data.duration,
    taskRunning: data.taskRunning,
    start: data.start,
    taskLabel: ""
  };
  taskButtons(taskObj);
  sW.taskObject.push(taskObj);
  console.log(stopWatch);
};

// ==================== TASK BUTTONS ===============================
const stopWatch = {
  taskId: "",
  intervalId: 0,
  totalDuration: 0,
  startTime: 0,
  taskLabel: "",
  labelText: "",
  taskRunning: false,
  taskObject: []
};
const sW = stopWatch;
// taskLabelArr = [];
// labelTextArr = [];

console.log(sW.intervalId);

const taskButtons = (data) => {
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

  // let inProg = "";
  // if (data.taskRunning) inProg = "in progress";
  // console.log(data.task, data.duration, inProg);
  $(data.taskLabel).text(
    `${data.task} ${hhmmss(data.duration)} `
  );

  const deleteBtn = $("<button>")
    .attr({
      class: "delete-button",
      "data-delete": data.id
    })
    .text("delete");

  // Clear Button
  const clearBtn = $("<button>").attr({
    class: "clear-button",
    "data-clear": data.id
  });

  if (data.taskRunning && $(data.taskLabel).text(`${data.task}`)) {
    $(clearBtn).text("show progess");
  } else {
    $(clearBtn).text("reset");
  }

  $(taskForm).append(data.taskLabel, taskBtn, clearBtn, deleteBtn);
  $("#task-list").append(taskForm);
};

// ---------------- TASK BUTTON --------------------------
$(document).on("click", ".task-button", function(event) {
  event.preventDefault();
  console.log(sW.taskObject);
  const name = $(this).attr("id");
  let taskDuration;
  let startTime;
  let taskRunning;
  let task;
  for (let object of sW.taskObject) {
    if (object.id === name) {
      console.log(object);
      taskDuration = object.duration;
      startTime = object.start;
      taskRunning = object.taskRunning;
      task = object.task;
    }
  }
  const dbr = db.ref(name);

  // dbr.on("value", function(snapshot) {
  //   taskDuration = snapshot.val().dbDuration;
  //   startTime = snapshot.val().lastStartTime;
  //   taskRunning = snapshot.val().taskRunning;
  // });
  let sendData = false;
  if (!startTime) sendData = true;

  taskLabel = $(`label[name="${name}"]`);
  labelText = $(taskLabel).data("name");
  const resetBtn = $(`button[data-clear="${name}"]`);
  $(resetBtn).text("reset");

  if (!taskRunning) {
    // sW.taskRunning;
    // sW.taskId = name;
    startTime = moment().unix();
    counter(name, task, taskDuration);
    if (sendData)
      dbr.update({ firstStartTime: startTime, lastStartTime: startTime });
    dbr.update({ lastStartTime: startTime, taskRunning: true });
    $(`button#${name}`)
      .attr({ style: "border-color: red" })
      .text("stop");
    checkIfRunning(name);
  } else {
    clearTimeout(sW.intervalId);
    // !taskRunning;
    durationCalc(startTime, taskDuration, name);

    dbr.update({ taskRunning: false });
    $(stopWatch.taskLabel).text(
      `${stopWatch.labelText} ${hhmmss(sW.totalDuration)}`
    );
    $(`button#${name}`)
      .attr({ style: "border-color: yellow" })
      .text("resume");
  }
});

const checkIfRunning = id => {
  sW.taskObject.forEach(taskObj => {
    if (taskObj.id != id && taskObj.taskRunning)
      $(`label[name=${taskObj.id}]`).text(`${taskObj.task} in progress`);
  });
};

// -------------------- Reset Button -----------------------
$(document).on("click", ".clear-button", function(event) {
  event.preventDefault();
  const clear = $(this).data("clear");

  db.ref(clear).on("value", function(snapshot) {
    clrTaskRunning = snapshot.val().taskRunning;
    clrStartTime = snapshot.val().lastStartTime;
    clrDuration = snapshot.val().dbDuration;
    clrTask = snapshot.val().task;
  });

  if (clrTaskRunning) {
    stopWatch.taskLabel = $(`label[name="${clear}"]`);
    sW.labelText = clrTask;
    durationCalc(clrStartTime, clrDuration, clear);
    counter(clrDuration);
    checkIfRunning(clear);
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
  sW.totalDuration = totalDuration;
  db.ref(id).update({ dbDuration: totalDuration });
};

// +++++++++++++++++++++++++ INCREMENT ++++++++++++++++++++++++++++++++++++++
const counter = (id, task, duration) => {
  // let task;
  // sW.taskObject.forEach(object => {
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
