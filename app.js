$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  const taskLabel = $("<label>").text("press to start");
  const taskBtn = $("<button>").addClass("task-button");
  $(taskBtn).text(task);
  $("#task-list").append(taskLabel, taskBtn);
})

// function checkSubmit(e) {
//   if(e && e.keyCode == 13) {
//     const task = $("input").val();
//   console.log(task);
//   const taskLabel = $("<label>").text("press to start");
//   const taskBtn = $("<button>").addClass("task-button");
//   $(taskBtn).text(task);
//   $("#task-list").append(taskLabel, taskBtn);
//      document.forms[0].submit();
//   }
// }