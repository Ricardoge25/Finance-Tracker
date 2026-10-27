import express from "express";
import { 
  getAccounts, 
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountTransactions
} from "./account.controller.js";

const router = express.Router();

router.get("/", getAccounts);
router.get("/:id", getAccountById);
router.get("/:id/transactions", getAccountTransactions);
router.post("/", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;