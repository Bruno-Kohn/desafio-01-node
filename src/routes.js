import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import { Database } from "./database.js";
import { error } from "node:console";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (titleOrDescriptionError({ title, description }, res)) return;

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res
        .writeHead(201, { "Content-Type": "application/json" })
        .end(JSON.stringify(task));
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const search = req.url.split("?")[1]?.split("=")[1];
      const tasks = database.select("tasks");

      const filteredTasks = search
        ? tasks.filter((task) => {
            return (
              task.title.includes(search) || task.description.includes(search)
            );
          })
        : tasks;

      return res
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(filteredTasks));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const id = req.url.split("/").pop();
      if (idError(id, res)) return;
      const { title, description } = req.body;

      if (titleOrDescriptionError({ title, description }, res)) return;

      const task = database.select("tasks").find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, {
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const id = req.url.split("/").pop();
      if (idError(id, res)) return;
      const task = database.select("tasks").find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end();
      }

      database.delete("tasks", id);

      return res
        .writeHead(200, { "Content-Type": "text/plain" })
        .end(`Task ${id} foi deletada`);
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const id = req.url.split("/")[2];
      if (idError(id, res)) return;
      const task = database.select("tasks").find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end();
      }

      database.update("tasks", id, {
        completed_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
];

function idError(id, res) {
  if (!id) {
    res
      .writeHead(400, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "ID é obrigatório." }));
    return true;
  }
  return false;
}

function titleOrDescriptionError({ title, description }, res) {
  if (!title || !description) {
    res
      .writeHead(400, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Título e descrição são obrigatórios." }));
    return true;
  }
  return false;
}
