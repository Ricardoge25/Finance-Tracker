import pool from "../../../database.js";

const ALLOWED_TYPES = ["INGRESO", "GASTO"];

export async function createTransactionService({ userId, accountId, categoryId, amount, type, description, transactionDate }) {
  if (!accountId || !categoryId || !type || amount === undefined || !transactionDate) {
    const error = new Error("Faltan campos obligatorios");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (!ALLOWED_TYPES.includes(type)) {
    const error = new Error("Tipo de transacción inválido (debe ser INGRESO o GASTO).");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const error = new Error("El monto debe ser un número mayor que cero.");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query(
      "SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [accountId, userId]
    );

    if (accountResult.rows.length === 0) {
      const error = new Error("Cuenta no encontrada o no pertenece al usuario.");
      error.type = "NOT_FOUND";
      throw error;
    }

    const account = accountResult.rows[0];
    const currentBalance = parseFloat(account.balance);

    if (type === "GASTO" && numericAmount > currentBalance) {
      const error = new Error("Saldo insuficiente para realizar esta transacción.");
      error.type = "INSUFFICIENT_BALANCE";
      throw error;
    }

    const newBalance = type === "INGRESO"
      ? currentBalance + numericAmount
      : currentBalance - numericAmount;

    const categoryResult = await client.query(
      "SELECT id, type FROM categories WHERE id = $1 AND user_id = $2",
      [categoryId, userId]
    );

    if (categoryResult.rows.length === 0) {
      const error = new Error("Categoría no encontrada o no pertenece al usuario.");
      error.type = "NOT_FOUND";
      throw error;
    }

    const category = categoryResult.rows[0];

    if (category.type !== type) {
      const error = new Error("El tipo de transacción no coincide con el tipo de categoría.");
      error.type = "VALIDATION_ERROR";
      throw error;
    }

    const txResult = await client.query(
      `INSERT INTO transactions
        (account_id, category_id, amount, type, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [accountId, categoryId, numericAmount, type, description || null, transactionDate]
    );

    await client.query(
      "UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newBalance, accountId]
    );

    await client.query("COMMIT");

    return { transaction: txResult.rows[0], updatedBalance: newBalance };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Crea una transferencia entre dos cuentas propias del usuario.
 * Ambas cuentas se bloquean SIEMPRE en el mismo order (por id ascendente),
 * sin importar cuál sea "origen" y cuál "destino". Esto evita deadlocks:
 * si dos transferencias cruzadas (A->B y B->A) ocurren al mismo tiempo, ambas
 * intentan tomar los locks en el mismo orden, así que nunca terminan
 * esperándose mutuamente en un ciclo.
 */
export async function createTransferService({ userId, fromAccountId, toAccountId, amount, description, transactionDate }) {
  if (!fromAccountId || !toAccountId || amount === undefined || !transactionDate) {
    const error = new Error("Faltan campos obligatorios");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  if (Number(fromAccountId) === Number(toAccountId)) {
    const error = new Error("La cuenta origen y destino no pueden ser la misma.");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    const error = new Error("El monto debe ser un número mayor que cero.");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sortedIds = [Number(fromAccountId), Number(toAccountId)].sort((a, b) => a - b);
    const lockedAccounts = [];

    for (const accId of sortedIds) {
      const result = await client.query(
        "SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [accId, userId]
      );
      if (result.rows.length === 0) {
        const error = new Error("Una de las cuentas no existe o no pertenece al usuario.");
        error_type = "NOT_FOUND";
        throw error;
      }
      lockedAccounts[accId] = result.rows[0];
    }

    const fromBalance = parseFloat(lockedAccounts[fromAccountId].balance);

    if (numericAmount > fromBalance) {
      const error = new Error("Saldo insuficiente en la cuenta de origen");
      error.type = "INSUFFICIENT_BALANCE";
      throw error;
    }

    const txResult = await client.query(
      `INSERT INTO transactions
        (account_id, to_account_id, category_id, type, amount, description, transaction_date)
      VALUES ($1, $2, NULL, 'TRANSFERENCIA', $3, $4, $5)
      RETURNING *`,
      [fromAccountId, toAccountId, numericAmount, description || null, transactionDate]
    );

    await client.query(
      "UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [numericAmount, fromAccountId]
    );
    await client.query(
      "UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [numericAmount, toAccountId]
    );

    await client.query("COMMIT");
    return { transaction: txResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getUserTransactionsService(userId) {
  const result = await pool.query(
    `SELECT
      t.id, t.account_id, a.name AS account_name,
      t.to_account_id, to_acc.name AS to_account_name,
      t.category_id, c.name AS category_name,
      t.type, t.amount, t.description, t.transaction_date,
      t.reversed_transaction_id, t.reversal_reason,
      t.created_at, t.updated_at
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE a.user_id = $1
    ORDER BY t.transaction_date DESC, t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getTransactionByIdService(transactionId, userId) {
  const result = await pool.query(
    `SELECT
      t.id, t.account_id, a.name AS account_name,
      t.to_account_id, to_acc.name AS to_account_name,
      t.category_id, c.name AS category_name,
      t.type, t.amount, t.description, t.transaction_date,
      t.reversed_transaction_id, t.reversal_reason,
      t.created_at, t.updated_at
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN accounts to_acc ON t.to_account_id = to_acc.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = $1 AND a.user_id = $2`,
    [transactionId, userId]
  );

  return result.rows[0];
}

/**
 * Edición limitada: solo descripción y category_id son editables.
 * amount, type, account_id y to_account_id inmutables - cualquier corrección
 * de esos campos debe hacerse mediante reverseTransactionService, para preservar 
 * el rastro de auditoría del ledger.
 */
export async function updateTransactionMetadataService(id, userId, { description, categoryId }) {
  const client = await pool.connect();

  try {
    await pool.query("BEGIN");

    const txResult = await client.query(
      `SELECT t.*
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.id = $1 AND a.user_id = $2
      FOR UPDATE OF t`,
      [id, userId]
    );

    if (txResult.rows.length === 0) {
      const error = new Error("Transacción no encontrada.");
      error.type = "NOT_FOUND";
      throw error;
    }

    const original = txResult.rows[0];
    let newCategoryId = original.category_id;

    if (categoryId !== undefined && categoryId !== null) {
      if (original.type === "TRANSFERENCIA") {
        const error = new Error("Las transferencias no tienen categoría");
        error.type = "VALIDATION_ERROR";
        throw error;
      }

      const categoryResult = await client.query(
        "SELECT id, type FROM categories WHERE id = $1 AND user_id = $2",
        [categoryId, userId]
      );

      if (categoryResult.rows.length === 0) {
        const error = new Error("Categoría no encontrada o no pertenece al usuario.");
        error.type = "NOT_FOUND";
        throw error;
      }

      if (categoryResult.rows[0].type !== original.type) {
        const error = new Error("El tipo de categoría no coincide con el tipo de transacción");
        error.type = "VALIDATION_ERROR";
        throw error;
      }

      newCategoryId = categoryId;
    }

    const newDescription = description !== undefined ? description : original.description;

    const result = await client.query(
      `UPDATE transactions
      SET description = $1, category_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [newDescription, newCategoryId, id]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Reversión de una transacción
 */
export async function reverseTransactionService(transactionId, userId, reason) {
  if (!reason || typeof reason !== "string" || reason.trim() === "") {
    const error = new Error("El motivo de la reversión es obligatorio");
    error.type = "VALIDATION_ERROR";
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const txResult = await client.query(
      `SELECT t.*
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.id = $1 AND a.user_id = $2
      FOR UPDATE OF t`,
      [transactionId, userId]
    );

    if (txResult.rows.length === 0) {
      const error = new Error("La transacción no existe o no pertenece al usuario.");
      error.type = "NOT_FOUND";
      throw error;
    }

    const original = txResult.rows[0];

    if (original.reversed_transaction_id !== null) {
      const error = new Error("No se puede revertir una transacción que ya es una reversión.")
      error.type = "VALIDATION_ERROR";
      throw error;
    }

    const alreadyReversed = await client.query(
      "SELECT id FROM transactions WHERE reversed_transaction_id = $1",
      [transactionId]
    );

    if (alreadyReversed.rows.length > 0) {
      const error = new Error("Esta transacción ya fue revertida.");
      error.type = "VALIDATION_ERROR";
      throw error;
    }

    const amount = parseFloat(original.amount);
    let reversalResult;

    if (original.type === "TRANSFERENCIA") {
      const sortedIds = [original.account_id, original.to_account_id].sort((a, b) => a - b);
      const lockedAccounts = {};

      for (const accId of sortedIds){
        const accResult = await client.query(
          "SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE",
          [accId, userId]
        );
        if (accResult.rows.length === 0) {
          const error = new Error("Una de las cuentas involucradas no existe o no pertenece al usuario.");
          error.type = "NOT_FOUND";
          throw error;
        }
        lockedAccounts[accId] = accResult.rows[0];
      }

      const reverseFromId = original.to_account_id;
      const reverseToId = original.account_id;
      const reverseFromBalance = parseFloat(lockedAccounts[reverseFromId].balance);

      if (amount > reverseFromBalance) {
        const error = new Error("La cuenta destino no tiene saldo suficiente para revertir la transferencia.");
        error.type = "INSUFFICIENT_BALANCE";
        throw error;
      }

      reversalResult = await client.query(
        `INSERT INTO transactions
          (account_id, to_account_id, category_id, type, amount, description, transaction_date, reversed_transaction_id, reversal_reason)
        VALUES ($1, $2, NULL, 'TRANSFERENCIA', $3, $4, CURRENT_TIMESTAMP, $5, $6)
        RETURNING *`,
        [reverseFromId, reverseToId, amount, original.description, transactionId, reason]
      );

      await client.query(
        "UPDATE accounts SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [amount, reverseFromId]
      );
      await client.query(
        "UPDATE accounts SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [amount, reverseToId]
      );
    } else {
      const accountResult = await client.query(
        "SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [original.account_id, userId]
      );

      const account = accountResult.rows[0];
      const currentBalance = parseFloat(account.balance);
      const reversedType = original.type === "GASTO" ? "INGRESO" : "GASTO";
      const newBalance = reversedType === "INGRESO" ? currentBalance + amount : currentBalance - amount;

      reversalResult = await client.query(
        `INSERT INTO transactions
          (account_id, category_id, type, amount, description, transaction_date, reversed_transaction_id, reversal_reason)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)
        RETURNING *`,
        [original.account_id, original.category_id, reversedType, amount, original.description, transactionId, reason]
      );

      await client.query(
        "UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [newBalance, original.account_id]
      );
    }

    await client.query("COMMIT");
    return { reversalTransaction: reversalResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}