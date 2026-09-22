import {
  createTransactionService,
  getUserTransactionsService,
  getTransactionByIdService,
  reverseTransactionService,
} from "./transaction.service.js";

export async function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { accountId, categoryId, amount, type, description, transactionDate } = req.body;

    const result = await createTransactionService({
      userId, accountId, categoryId, amount, type, description, transactionDate,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error.type === "VALIDATION_ERROR") return res.status(400).json({ error: error.message });
    if (error.type === "NOT_FOUND") return res.status(404).json({ error: error.message });
    if (error.type === "INSUFFICIENT_BALANCE") return res.status(400).json({ error: error.message });
    console.error("Error creando transacción:", error);
    res.status(500).json({ error: "Error creando la transacción" });
  }
}

export async function getTransactions(req, res) {
  try {
    const transactions = await getUserTransactionsService(req.user.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const transaction = await getTransactionByIdService(id, req.user.id);
    if (!transaction) return res.status(404).json({ error: "Transacción no encontrada." });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function reverseTransaction(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await reverseTransactionService(id, req.user.id, reason);
    res.status(201).json(result);
  } catch (error) {
    if (error.type === "VALIDATION_ERROR") return res.status(400).json({ error: error.message });
    if (error.type === "NOT_FOUND") return res.status(404).json({ error: error.message });
    res.status(500).json({ error: error.message });
  }
}