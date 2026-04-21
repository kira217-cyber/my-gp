import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test route
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