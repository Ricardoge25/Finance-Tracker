import { Router } from "express";
import {
  createTransaction, 
  createTransfer,
  getTransactions,
  getTransactionById,
  updateTransaction,
  reverseTransaction,
} from "./transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.post("/transfer", createTransfer);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.post("/:id/reverse", reverseTransaction);

export default router;