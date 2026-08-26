import express from 'express';
import {
  getTodos,
  createTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from '../controllers/todo.controller.js';
import { validation } from '../middleware/validateTodo.middleware.js';
import { validateUpdateTodo } from '../middleware/validateUpdateTodo.middleware.js';
import { authorizeTodoOwner } from '../middleware/authorizeTodoOwner.middleware.js';
import { validateUuid } from '../middleware/validateUuid.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: List all todos (public)
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: completed
 *         schema: { type: boolean }
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, title, completed, updatedAt] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', getTodos);

/**
 * @openapi
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *     responses:
 *       201:
 *         description: Todo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401: { description: Unauthorized }
 *       400: { description: Missing title }
 */
router.post('/', authenticate, validation, createTodos);

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     summary: Get a todo by id
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: The todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, validateUuid, getTodoById);

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, completed]
 *             properties:
 *               title: { type: string }
 *               completed: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400: { description: Missing fields or invalid id }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.put('/:id', authenticate, validateUuid, validateUpdateTodo, authorizeTodoOwner, updateTodo);

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.delete('/:id', authenticate, validateUuid, deleteTodo);

export default router;
