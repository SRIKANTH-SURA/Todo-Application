const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
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

// app.get("/todos/", async (request, response) => {
//   const getTodosQuery = `
//             SELECT
//                 *
//             FROM
//                 todo;
//     `;
//   const todosArray = await db.all(getTodosQuery);
//   response.send(todosArray);
// });

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "" } = request.query;
  const getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE status = '${status}' OR 
                  priority = '${priority}';
  `;
  const todosArray = await db.all(getTodosQuery);
  response.send(todosArray);
});
