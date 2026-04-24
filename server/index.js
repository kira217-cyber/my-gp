import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import depositMethodRoutes from "./routes/depositMethodRoutes.js";
import depositFieldRoutes from "./routes/depositFieldRoutes.js";
import depositBonusTurnoverRoutes from "./routes/depositBonusTurnoverRoutes.js";
import depositRequestRoutes from "./routes/depositRequestRoutes.js";
import turnOverRoutes from "./routes/turnOverRoutes.js";
import withdrawMethodRoutes from "./routes/withdrawMethodRoutes.js";
import withdrawRequestRoutes from "./routes/withdrawRequestRoutes.js";
import autoDepositRoutes from "./routes/autoDepositRoutes.js";
import bulkAdjustmentRoutes from "./routes/bulkAdjustmentRoutes.js";
import affWithdrawRoutes from "./routes/AffWithdrawRoutes.js";
import affWithdrawRequestRoutes from "./routes/affWithdrawRequestRoutes.js";
import eWalletRoutes from "./routes/eWalletRoutes.js";
import gameCategoriesRoutes from "./routes/gameCategoriesRoutes.js";
import gameProvidersRoutes from "./routes/gameProvidersRoutes.js";
import gamesRoutes from "./routes/gamesRoutes.js";
import sportsRoutes from "./routes/sportsRoutes.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//* api routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/deposit-methods", depositMethodRoutes);
app.use("/api/deposit-fields", depositFieldRoutes);
app.use("/api/deposit-bonus-turnover", depositBonusTurnoverRoutes);
app.use("/api", depositRequestRoutes);
app.use("/api", turnOverRoutes);
app.use("/api/withdraw-methods", withdrawMethodRoutes);
app.use("/api", withdrawRequestRoutes);
app.use("/api/auto-deposit", autoDepositRoutes);
app.use("/api/admin", bulkAdjustmentRoutes);
app.use("/api", affWithdrawRoutes);
app.use("/api", affWithdrawRequestRoutes);
app.use("/api/e-wallets", eWalletRoutes);
app.use("/api/game-categories", gameCategoriesRoutes);
app.use("/api/game-providers", gameProvidersRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/sports", sportsRoutes);



// route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
  });
});

// start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀Raihan Server running on http://localhost:${PORT}`);
  });
};

startServer();
