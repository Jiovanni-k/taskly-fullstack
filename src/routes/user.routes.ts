import express from "express";
import { register ,login, me} from "../controllers/user.controller.js";
import { authenticate} from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { listUsers } from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201: { description: User created }
 *       400: { description: Validation error / email already exists }
 */
router.post("/register", register);

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns token and user }
 *       401: { description: Invalid credentials }
 */
router.post("/login", login);

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Unauthorized }
 */
router.get("/me",authenticate, me);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of users }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden (non-admin) }
 */
router.get("/", authenticate, authorize("admin"), listUsers);

export default router;