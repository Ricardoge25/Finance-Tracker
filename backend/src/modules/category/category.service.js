import pool from "../../../database.js";

const ALLOWED_TYPES = ["INGRESO", "GASTO"];

function validateCategoryData(categoryData) {
  const { name, type } = categoryData;

  if (!name || !type) {
    const error = new Error("El nombre y el tipo son obligatorios");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (!ALLOWED_TYPES.includes(type)) {
    const error = new Error("El tipo de categoría no es válido");
    error.type = "VALIDATION_ERROR";
    throw error;
  }
}

export async function getCategories(userId) {
  const result = await pool.query(
    `SELECT * FROM categories WHERE user_id = $1 ORDER BY id ASC`,
    [userId]
  );
  return result.rows;
}

export async function getCategoryById(id, userId) {
  const result = await pool.query(
    `SELECT * FROM categories WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function createCategory(categoryData, userId) {
  validateCategoryData(categoryData);

  const { name, type, color } = categoryData;

  const result = await pool.query(
    `INSERT INTO categories (name, type, color, user_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, type, color || null, userId]
  );

  return result.rows[0];
}

export async function updateCategory(id, categoryData, userId) {
  validateCategoryData(categoryData);

  const { name, type, color } = categoryData;

  const result = await pool.query(
    `UPDATE categories
     SET name = $1, type = $2, color = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [name, type, color || null, id, userId]
  );

  return result.rows[0];
}

export async function deleteCategory(id, userId) {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0];
}