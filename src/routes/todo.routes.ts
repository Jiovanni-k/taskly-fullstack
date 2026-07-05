import express from "express";
import { getTodos, createTodos, getTodoById, updateTodo, deleteTodo } from "../controllers/todo.controller.js";
import { validation } from "../middleware/validateTodo.middleware.js";
import {validateUuid} from "../middleware/validateUuid.middleware.js";

const router = express.Router();
router.get("/", getTodos);
router.post("/", validation ,createTodos);
router.get("/:id", validateUuid,getTodoById);
router.put("/:id" , validateUuid,updateTodo);
router.delete("/:id",validateUuid, deleteTodo);

export default router;
