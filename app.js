$("button").on("click", function(event) {
  event.preventDefault();
  const task = $("input").val();
  console.log(task);
  const taskBtn = $("<button>").addClass("task-button");
  $(taskBtn).text(task);
  $("#task-list").append(taskBtn);
})