import express from "express";
import { getTodos, createTodos, getTodoById, updateTodo, deleteTodo } from "../controllers/todo.controller.js";
import { validation } from "../middleware/validateTodo.middleware.js";

const router = express.Router();
router.get("/", getTodos);
router.post("/", validation ,createTodos);
router.get("/:id", getTodoById);
router.put("/:id", validation ,updateTodo);
router.delete("/:id", deleteTodo);

export default router;