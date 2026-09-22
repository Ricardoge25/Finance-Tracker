import { Router } from "express";
import {
  createTransaction, 
  getTransactions,
  getTransactionById,
  reverseTransaction,
} from "./transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.post("/:id/reverse", reverseTransaction);

export default router;