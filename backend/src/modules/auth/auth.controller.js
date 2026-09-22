import { registerUser, loginUser, getCurrentUser } from "./auth.service.js";

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const user = await registerUser({ fullName, email, password });
    res.status(201).json({ message: "Usuario registrado con éxito", user });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos." });
    }

    const data = await loginUser({ email, password });
    res.json(data);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function me(req, res) {
  try {
    const user = await getCurrentUser(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}