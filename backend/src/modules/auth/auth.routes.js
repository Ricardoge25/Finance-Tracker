import { Router } from "express";
import { register, login, me } from "./auth.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

// Endpoint público para registrar usuario
router.post("/register", register);

// Endpoint público para iniciar sesión y obtener JWT
router.post("/login", login);

router.get("/me", authenticateToken, me);

export default router;