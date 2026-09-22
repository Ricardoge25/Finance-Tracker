import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno.");
}

import { authenticateToken } from "./src/middlewares/auth.middleware.js";
import accountRoutes from "./src/modules/account/account.routes.js";
import categoryRoutes from "./src/modules/category/category.routes.js";
import transactionRoutes from "./src/modules/transaction/transaction.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import dashboardRouter from "./src/modules/dashboard/dashboard.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/api/accounts", authenticateToken, accountRoutes);
app.use("/api/categories", authenticateToken, categoryRoutes); // pendiente de tu respuesta sobre categories
app.use("/api/transactions", authenticateToken, transactionRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});