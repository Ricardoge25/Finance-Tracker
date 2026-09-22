import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extrae el token 'Bearer <TOKEN>'

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto_super_seguro");
    req.user = decoded; // Adjunta los datos del usuario (id, email) al objeto request
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado." });
  }
}