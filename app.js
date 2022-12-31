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
            (id, todo, priority, status)
        VALUES
            (${id}, '${todo}', '${priority}', '${status})';
  `;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});
