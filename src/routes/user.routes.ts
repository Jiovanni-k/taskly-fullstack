import express from "express";
import { register ,login, me} from "../controllers/user.controller.js";
import { authenticate} from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { listUsers } from "../controllers/user.controller.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me",authenticate, me);
router.get("/", authenticate, authorize("admin"), listUsers);

export default router;