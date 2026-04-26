import express from "express";

import User from "../models/User.js";
import Game from "../models/Games.js";
import DepositRequest from "../models/DepositRequest.js";
import WithdrawRequest from "../models/WithdrawRequest.js";

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", async (req, res) => {
  try {
    const [
      allUsers,
      activeUsers,
      allAffiliateUsers,
      allGames,
      activeGames,
      pendingDepositRequest,
      pendingWithdrawRequest,
      depositApprovedAgg,
      withdrawApprovedAgg,
      latestUsers,
      latestDeposits,
      latestWithdraws,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      User.countDocuments({ role: "aff-user" }),

      Game.countDocuments({}),
      Game.countDocuments({ status: "active" }),

      DepositRequest.countDocuments({ status: "pending" }),
      WithdrawRequest.countDocuments({ status: "pending" }),

      DepositRequest.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      WithdrawRequest.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId phone email role isActive balance currency createdAt")
        .lean(),

      DepositRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "userId phone")
        .select("user amount status methodId channelId createdAt")
        .lean(),

      WithdrawRequest.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "userId phone")
        .select("user amount status methodId walletSnapshot createdAt")
        .lean(),
    ]);

    const allDepositBalances = depositApprovedAgg?.[0]?.total || 0;
    const allWithdrawBalances = withdrawApprovedAgg?.[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          allUsers,
          activeUsers,
          allAffiliateUsers,
          allDepositBalances,
          allGames,
          activeGames,
          allWithdrawBalances,
          pendingDepositRequest,
          pendingWithdrawRequest,
        },
        chart: {
          users: {
            active: activeUsers,
            inactive: Math.max(allUsers - activeUsers, 0),
          },
          requests: {
            pendingDeposit: pendingDepositRequest,
            pendingWithdraw: pendingWithdrawRequest,
            approvedDepositAmount: allDepositBalances,
            approvedWithdrawAmount: allWithdrawBalances,
          },
        },
        latest: {
          users: latestUsers,
          deposits: latestDeposits,
          withdraws: latestWithdraws,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary",
      error: error.message,
    });
  }
});

export default router;