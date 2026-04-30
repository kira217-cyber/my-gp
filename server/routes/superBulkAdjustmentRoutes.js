import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const makeFullName = (user) => {
  const first = String(user?.firstName || "").trim();
  const last = String(user?.lastName || "").trim();
  return `${first} ${last}`.trim();
};

/**
 * GET /api/admin/super-bulk-adjustment/users?page=1&limit=10&q=searchText
 */
router.get("/super-bulk-adjustment/users", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();

    const match = { role: "super-aff-user" };

    if (q) {
      match.$or = [
        { userId: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
      ];
    }

    const [list, total] = await Promise.all([
      User.find(match)
        .select(
          `
          userId
          email
          phone
          firstName
          lastName
          balance
          currency
          commissionBalance
          gameLossCommissionBalance
          depositCommissionBalance
          referCommissionBalance
          gameWinCommissionBalance
          createdAt
          isActive
        `,
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(match),
    ]);

    const data = (list || []).map((u) => {
      const gross =
        n(u.gameLossCommissionBalance) +
        n(u.depositCommissionBalance) +
        n(u.referCommissionBalance);

      const net = gross - n(u.gameWinCommissionBalance);

      return {
        _id: u._id,
        userId: u.userId,
        email: u.email || "",
        phone: u.phone || "",
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        fullName: makeFullName(u) || "No Name",
        currency: u.currency || "BDT",
        isActive: u.isActive !== false,

        balance: n(u.balance),
        commissionBalance: n(u.commissionBalance),

        gameLossCommissionBalance: n(u.gameLossCommissionBalance),
        depositCommissionBalance: n(u.depositCommissionBalance),
        referCommissionBalance: n(u.referCommissionBalance),
        gameWinCommissionBalance: n(u.gameWinCommissionBalance),

        gross,
        net,
        createdAt: u.createdAt,
      };
    });

    return res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("super-bulk-adjustment users error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/**
 * POST /api/admin/super-bulk-adjustment/adjust/:userId
 */
router.post("/super-bulk-adjustment/adjust/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "super-aff-user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Super affiliate user not found",
      });
    }

    const gameLoss = n(user.gameLossCommissionBalance);
    const deposit = n(user.depositCommissionBalance);
    const refer = n(user.referCommissionBalance);
    const gameWin = n(user.gameWinCommissionBalance);

    const gross = gameLoss + deposit + refer;
    const net = gross - gameWin;

    user.balance = n(user.balance) + net;

    user.gameLossCommissionBalance = 0;
    user.depositCommissionBalance = 0;
    user.referCommissionBalance = 0;
    user.gameWinCommissionBalance = 0;
    user.commissionBalance = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Super bulk adjustment completed",
      data: {
        userId: user._id,
        affiliateUserId: user.userId,
        gross,
        net,
        balance: n(user.balance),
      },
    });
  } catch (err) {
    console.error("super-bulk-adjustment single error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/**
 * POST /api/admin/super-bulk-adjustment/adjust-all
 * body: { q?: "search text" }
 */
router.post("/super-bulk-adjustment/adjust-all", async (req, res) => {
  try {
    const q = String(req.body?.q || "").trim();

    const match = { role: "super-aff-user" };

    if (q) {
      match.$or = [
        { userId: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(match).select(`
      userId
      balance
      commissionBalance
      gameLossCommissionBalance
      depositCommissionBalance
      referCommissionBalance
      gameWinCommissionBalance
    `);

    let adjustedUsers = 0;
    let totalGross = 0;
    let totalNet = 0;

    const ops = [];

    for (const user of users) {
      const gameLoss = n(user.gameLossCommissionBalance);
      const deposit = n(user.depositCommissionBalance);
      const refer = n(user.referCommissionBalance);
      const gameWin = n(user.gameWinCommissionBalance);

      const gross = gameLoss + deposit + refer;
      const net = gross - gameWin;

      if (gross === 0 && gameWin === 0) continue;

      adjustedUsers += 1;
      totalGross += gross;
      totalNet += net;

      ops.push({
        updateOne: {
          filter: { _id: user._id, role: "super-aff-user" },
          update: {
            $inc: { balance: net },
            $set: {
              commissionBalance: 0,
              gameLossCommissionBalance: 0,
              depositCommissionBalance: 0,
              referCommissionBalance: 0,
              gameWinCommissionBalance: 0,
            },
          },
        },
      });
    }

    if (ops.length) {
      await User.bulkWrite(ops, { ordered: false });
    }

    return res.json({
      success: true,
      message: "Super bulk adjustment completed",
      data: {
        adjustedUsers,
        totalGross,
        totalNet,
      },
    });
  } catch (err) {
    console.error("super-bulk-adjustment all error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

export default router;