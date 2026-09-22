import pool from "../../../database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_CATEGORIES = [
  { name: "Salario", type: "INGRESO", color: "#22c55e" },
  { name: "Comida", type: "GASTO", color: "#ef4444" },
  { name: "Transporte", type: "GASTO", color: "#3b82f6" },
  { name: "Vivienda", type: "GASTO", color: "#f97316" },
  { name: "Entretenimiento", type: "GASTO", color: "#a855f7" },
];

export async function registerUser({ fullName, email, password }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      const error = new Error("El correo electrónico ya está registrado.");
      error.type = "VALIDATION_ERROR";
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email`,
      [fullName, email, passwordHash]
    );

    const newUser = userResult.rows[0];

    // Seed de categorías por defecto (copias propias del usuario, no compartidas)
    for (const category of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (name, type, color, user_id)
         VALUES ($1, $2, $3, $4)`,
        [category.name, category.type, category.color, newUser.id]
      );
    }

    await client.query("COMMIT");

    return newUser;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loginUser({ email, password }) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    throw new Error("Credenciales inválidas.");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error("Credenciales inválidas.");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    user: { id: user.id, fullName: user.full_name, email: user.email },
    token,
  };
}

export async function getCurrentUser(userId) {
  const result = await pool.query(
    "SELECT id, full_name, email FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const user = result.rows[0];

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
  };
}