const express = require("express"); //require the express module
const bodyParser = require("body-parser"); //require body parser
const fs = require("fs"); // require the fs module (for reading and writing in file)
const path = require("path"); //path module to join paths
// const { log } = require("console");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); //for using req.body
app.use(express.static(__dirname));

const tasksFilePath = path.join(__dirname, "data.json");

//function to read existing tasks from the file
function readTasksFile(callback) {
  //reading the file
  fs.readFile(tasksFilePath, "utf8", (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      try {
        const tasks = JSON.parse(data); //convert the data to Objects
        callback(null, tasks); //send the tasks
      } catch (parseError) {
        callback(parseError, null);
      }
    }
  });
}

//function to write tasks array to file (takes an object and a callback as arguments)
function writeTasksFile(tasks, callback) {
  //write data to file after converting it into JSON
  fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2), (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

//get request to get all the tasks and send the array of objects in JSON
app.get("/tasks", (req, res) => {
  //calling the readTasksFile() function
  readTasksFile((err, tasks) => {
    if (err) {
      res.status(500).json({ error: "Failed to read tasks file." });
    } else {
      res.json(tasks);
    }
  });
});

//POST method to add new Todo to the file and send back the toDo that was added
app.post("/tasks", (req, res) => {
  const newTaskText = req.body.task; //save the new Task to the variable
  if (!newTaskText || newTaskText.trim() === "") {
    //if the task is empty
    res.status(400).json({ error: "Task text cannot be empty." });
  } else {
    // call the readTasksFile to get all the tasks
    readTasksFile((err, tasks) => {
      if (err) {
        res.status(500).json({ error: "Failed to read tasks file." });
      } else {
        //if tasks is empty, set newTaskId to 1 else set it to taskId+1 of the last user
        const newTaskId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
        //create a new task
        const newTask = { id: newTaskId, text: newTaskText, completed: false }; //copmpleted is false(because it is a new Task)
        tasks.push(newTask); //add the new task to the task array
        writeTasksFile(tasks, (err) => {
          //write the tasks array back to the file
          if (err) {
            res.status(500).json({ error: "Failed to write tasks file." });
          } else {
            //send back the new task (for displaying on the page)
            res.json({ message: "Task added successfully.", task: newTask });
          }
        });
      }
    });
  }
});

//handle put request
// id will be fetched using req.params.id (: specifies that it is a parameter)
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id); //save the id to variable taskID
  const completed = req.body.completed; //save the sent data to completed varaible

  //read all the tasks from the file
  readTasksFile((err, tasks) => {
    if (err) {
      res.status(500).json({ error: "Failed to read tasks file." });
    } else {
      const task = tasks.find((t) => t.id === taskId); //find what task to modify and save it to task variable
      if (!task) {
        res.status(404).json({ error: "Task not found." }); //agr task nhi mila to
      } else {
        task.completed = completed; //modify the task variable (tasks array bhi modify hogua abb)
        writeTasksFile(tasks, (err) => {
          //write the tasks array containing the modified task to the file
          if (err) {
            res.status(500).json({ error: "Failed to write tasks file." });
          } else {
            res.json({ message: "Task updated successfully.", task }); //return the modified task back
          }
        });
      }
    }
  });
});

//:id specifies data (whatever passed after /tasks while making the request will be saved to id)
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id); //re.params.id will give us the endpoint and save it to taskId

  //call the readTasksFile function which will give us all the tasks
  readTasksFile((err, tasks) => {
    if (err) {
      res.status(500).json({ error: "Failed to read tasks file." });
    } else {
      //tasks.filter will give us a new aray excluding the task that has the id=>taskId (this way we will not have the task that we want to delete)
      const updatedTasks = tasks.filter((t) => t.id !== taskId); //search for the task that we need to delete (search using the id we got using req.params.id)

      //now the updatedTasks have all the task except the one that we wanted to delete,we can simply write the updatedTasks to the file
      writeTasksFile(updatedTasks, (err) => {
        if (err) {
          res.status(500).json({ error: "Failed to write tasks file." });
        } else {
          res.json({ message: "Task deleted successfully.", taskId }); //give back the taskId and a message
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on Port:${PORT}`);
});
