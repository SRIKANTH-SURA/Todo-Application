const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

// API 1

app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { status, priority, search_q = "" } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
                SELECT 
                    *
                FROM 
                    todo
                WHERE todo LIKE '%${search_q}%' AND
                    priority = "${priority}" AND
                    status = "${status}";
                `;
      break;

    case hasPriorityProperty(request.query):
      getTodosQuery = `
                SELECT 
                    *
                FROM 
                    todo
                WHERE todo LIKE '%${search_q}%' AND
                    priority = "${priority}";
                `;
      break;

    case hasStatusProperty(request.query):
      getTodosQuery = `
                SELECT 
                    *
                FROM 
                    todo
                WHERE todo LIKE '%${search_q}%' AND
                    status = "${status}";
                `;
      break;

    default:
      getTodosQuery = `
                SELECT 
                    *
                FROM 
                    todo
                WHERE todo LIKE '%${search_q}%';
                `;
      break;
  }
  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});

// API 2

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
            SELECT *
            FROM todo
            WHERE id = ${todoId};
    `;
  const todoArray = await db.get(getTodoQuery);
  response.send(todoArray);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
        INSERT INTO
           todo (id, todo, priority, status)
        VALUES
            (${id}, '${todo}', '${priority}', '${status}');
  `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

// API 4 (PUT)  Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    default:
      break;
  }

  const getTodoQuery = `
            SELECT *
            FROM todo
            WHERE id = ${todoId};
    `;
  const previousTodo = await db.get(getTodoQuery);
  //   response.send(previousTodo);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoObjQuery = `
            UPDATE
                todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}'
            WHERE id = ${todoId};
      `;
  await db.run(updateTodoObjQuery);
  response.send(`${updateColumn} Updated`);
});

// API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
        DELETE FROM
            todo
        WHERE 
            id = ${todoId};
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
