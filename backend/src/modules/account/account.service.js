import pool from "../../../database.js";

const ALLOWED_TYPES = ["AHORROS", "CORRIENTE", "EFECTIVO", "INVERSIÓN"];
const ALLOWED_CURRENCIES = ["COP", "USD", "EUR"];

function validateAccountData(accountData) {
  const { name, type, balance, currency } = accountData;

  if (!name || !type || !currency) {
    const error = new Error("Faltan campos obligatorios");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (balance === undefined || balance === null) {
    const error = new Error("El balance es obligatorio");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (typeof balance !== "number") {
    const error = new Error("El balance debe ser un número");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (!ALLOWED_TYPES.includes(type)) {
    const error = new Error("Tipo de cuenta inválido.");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (!ALLOWED_CURRENCIES.includes(currency)) {
    const error = new Error("Moneda no válida.");
    error.type = "VALIDATION_ERROR";
    throw error;
  }
}

export async function getAccounts(userId) {
  const result = await pool.query(
    `SELECT id, name, type, balance, currency, created_at, updated_at
     FROM accounts
     WHERE user_id = $1
     ORDER BY id ASC`,
    [userId]
  );
  return result.rows;
}

export async function getAccountById(id, userId) {
  const result = await pool.query(
    `SELECT * FROM accounts WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function createAccount(accountData, userId) {
  validateAccountData(accountData);

  const { name, type, balance, currency } = accountData;

  const result = await pool.query(
    `INSERT INTO accounts (name, type, balance, currency, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, type, balance, currency, userId]
  );

  return result.rows[0];
}

export async function updateAccount(id, accountData, userId) {
  validateAccountData(accountData);

  const { name, type, balance, currency } = accountData;

  const result = await pool.query(
    `UPDATE accounts
     SET name = $1, type = $2, balance = $3, currency = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [name, type, balance, currency, id, userId]
  );

  return result.rows[0];
}

export async function deleteAccount(id, userId) {
  const result = await pool.query(
    `DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0];
}