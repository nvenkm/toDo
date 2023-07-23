//get the taskList ,task input, and add task button
const taskList = document.getElementById("taskList");
const newTaskInput = document.getElementById("newTaskInput");
const addTaskBtn = document.getElementById("addTaskBtn");

//this function gets all the existing task and shows them in the list
function getTasks() {
  fetch("/tasks") //sending a get request to the server
    .then((response) => response.json()) //the response comes in json format(usko object bnaya)
    .then((tasks) => {
      taskList.innerHTML = "";
      tasks.forEach((task) => {
        //display task for every task that is in the response
        createTaskElement(task.id, task.text, task.completed);
      });
    })
    .catch((error) => console.error("Error fetching tasks:", error)); //handle the errors
}

//function to create a task element (it takes taskId,taskText,completed(which is a boolean value))
function createTaskElement(taskId, taskText, completed) {
  const listItem = document.createElement("li");
  listItem.setAttribute("data-task-id", taskId); //added a custom attribute to uniquely identify the task
  listItem.innerHTML = `<div class="task-text"> ${taskText} </div>`; //add the task test as normal text
  // listItem.innerHTML += '<button class="deleteBtn">Delete</button>'; //add a delete button
  // listItem.innerHTML += '<button class="completeBtn">Complete</button>'; //add a complete button
  listItem.innerHTML += `
    <div> 
        <button class="deleteBtn">Delete</button> 
        <button class="completeBtn">Complete</button>
      </div>`; //add a complete button
  if (completed) {
    //if the task is already completed , add the class comlpeted to change it's style

    listItem.firstElementChild.classList.add("completed");
  }
  taskList.appendChild(listItem); //at last appended the listItem to the <ul>

  //attaching a delete event listener to the created element
  const deleteBtn = listItem.querySelector(".deleteBtn");
  deleteBtn.addEventListener("click", function () {
    deleteTask(taskId); //calling deleteTask function ,passing the taskId
  });

  //attaching a complete event listener to the createdd element
  const completeBtn = listItem.querySelector(".completeBtn");
  completeBtn.addEventListener("click", function () {
    // console.log("toggleComplete function called");
    // console.log(completed);
    toggleComplete(taskId, !completed);
    completed = !completed; //change the value of completed to make it work again
  });
}

//this is the to add new task onn the server
function addTask(taskText) {
  //send a post request to the server
  fetch("/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //what type of data are we sending
    },
    body: JSON.stringify({ task: taskText }), //converting the data to JSON
  })
    .then((response) => response.json())
    .then((data) => {
      // recieved data is of the type {message:"new task added",task:newTask}
      createTaskElement(data.task.id, data.task.text, data.task.completed);
    })
    .catch((error) => console.error("Error adding task:", error));
}

//function to delete a task (takes the unique Id )
function deleteTask(taskId) {
  //sending delete request to the server
  fetch(`/tasks/${taskId}`, {
    method: "DELETE",
  })
    .then(() => {
      //select the li(task) with the required data-task-id and assign the element to variable taskItem
      //[data-task-id=taskId] is the attribute selector(we can select elements using attributes)
      const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);
      //remove the ID from the UI
      taskItem.remove();
    })
    .catch((error) => console.error("Error deleting task:", error)); //handle any error
}

///function to change the completion status of a task on the server
//function takes two inputs(taskID and completed status)
function toggleComplete(taskId, completed) {
  //send a PUT request with the completed value
  fetch(`/tasks/${taskId}`, {
    method: "PUT", //specifying the method(PUT in this case)
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }), //sending in the form of JSON
  })
    .then((response) => response.json())
    .then((data) => {
      //select the task that we modifies
      const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);
      taskItem.firstElementChild.classList.toggle("completed", completed);
    })
    .catch((error) => console.error("Error updating task:", error));
}

function getTaskAndCallAddTask() {
  const newTask = newTaskInput.value.trim();
  if (newTask !== "") {
    addTask(newTask);
    newTaskInput.value = "";
  }
}
//click listener to add new tasks
addTaskBtn.addEventListener("click", function () {
  getTaskAndCallAddTask();
});
newTaskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") getTaskAndCallAddTask();
});

// Fetch tasks on page load
getTasks();
