import express from "express";
import { getTodos, createTodos, getTodoById, updateTodo, deleteTodo } from "../controllers/todo.controller.js";
import { validation } from "../middleware/validateTodo.middleware.js";
import {validateUuid} from "../middleware/validateUuid.middleware.js";
import { authenticate} from "../middleware/auth.middleware.js";

const router = express.Router();
router.get("/", getTodos);

router.post("/", authenticate, validation ,createTodos);
router.get("/:id", authenticate, validateUuid,getTodoById);
router.put("/:id" , authenticate, validateUuid,updateTodo);
router.delete("/:id",authenticate, validateUuid, deleteTodo);

export default router;
