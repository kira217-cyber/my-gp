import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import DepositRequest from "../models/DepositRequest.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import AutoDeposit from "../models/AutoDeposit.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";
import { protectUser } from "./userRoutes.js";


const router = express.Router();

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const escapeRegex = (text = "") =>
  String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (req) => {
  const page = Math.max(1, num(req.query.page, 1));
  const limit = Math.max(1, Math.min(100, num(req.query.limit, 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const buildDateFilter = (query) => {
  const filter = {};

  if (query.from) {
    const from = new Date(query.from);
    if (!Number.isNaN(from.getTime())) filter.$gte = from;
  }

  if (query.to) {
    const to = new Date(query.to);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      filter.$lte = to;
    }
  }

  return Object.keys(filter).length ? filter : null;
};

const getAuthUserId = (req) => req.user?._id || req.user?.id || null;

const getAuthUser = async (req) => {
  const userId = getAuthUserId(req);
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) return null;

  return User.findById(userId).select("-password").lean();
};

/* ---------------- MY PROFILE SUMMARY ---------------- */

router.get("/me/profile", protectUser, async (req, res) => {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const autoDepositQuery = {
      $or: [{ userIdentity: String(user._id) }, { userIdentity: user.userId }],
    };

    const [
      depositCount,
      withdrawCount,
      autoDepositCount,
      turnoverCount,
      gameCount,
    ] = await Promise.all([
      DepositRequest.countDocuments({ user: user._id }),
      WithdrawRequest.countDocuments({ user: user._id }),
      AutoDeposit.countDocuments(autoDepositQuery),
      TurnOver.countDocuments({ user: user._id }),
      GameHistory.countDocuments({
        $or: [{ user: user._id }, { userId: user.userId }],
      }),
    ]);

    return res.json({
      success: true,
      message: "Profile summary fetched successfully",
      data: {
        user,
        summary: {
          depositCount,
          withdrawCount,
          autoDepositCount,
          turnoverCount,
          gameCount,
        },
      },
    });
  } catch (error) {
    console.error("GET /history/me/profile error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY DEPOSIT HISTORY ---------------- */

router.get("/me/deposits", protectUser, async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status = "", search = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = { user: userId };

    if (status && status !== "all") query.status = status;
    if (dateFilter) query.createdAt = dateFilter;

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      query.$or = [
        { methodId: regex },
        { channelId: regex },
        { promoId: regex },
        { "fields.transactionId": regex },
        { "fields.invoiceNumber": regex },
        { "fields.trxId": regex },
        { "display.transactionId": regex },
        { "display.invoiceNumber": regex },
      ];
    }

    const [items, total] = await Promise.all([
      DepositRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DepositRequest.countDocuments(query),
    ]);

    return res.json({
      success: true,
      message: "My deposit history fetched successfully",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /history/me/deposits error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY WITHDRAW HISTORY ---------------- */

router.get("/me/withdraws", protectUser, async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status = "", methodId = "", search = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = { user: userId };

    if (status && status !== "all") query.status = status;
    if (methodId.trim()) query.methodId = new RegExp(`^${escapeRegex(methodId.trim())}$`, "i");
    if (dateFilter) query.createdAt = dateFilter;

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      query.$or = [
        { methodId: regex },
        { "walletSnapshot.walletType": regex },
        { "walletSnapshot.walletNumber": regex },
        { "walletSnapshot.label": regex },
        { adminNote: regex },
      ];
    }

    const [items, total] = await Promise.all([
      WithdrawRequest.find(query)
        .populate("wallet", "methodId walletType walletNumber label")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WithdrawRequest.countDocuments(query),
    ]);

    return res.json({
      success: true,
      message: "My withdraw history fetched successfully",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /history/me/withdraws error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY AUTO DEPOSIT HISTORY ---------------- */

router.get("/me/auto-deposits", protectUser, async (req, res) => {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status = "", search = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = {
      $or: [{ userIdentity: String(user._id) }, { userIdentity: user.userId }],
    };

    if (status && status !== "all") query.status = status;
    if (dateFilter) query.createdAt = dateFilter;

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      query.$and = [
        {
          $or: [
            { invoiceNumber: regex },
            { transactionId: regex },
            { sessionCode: regex },
            { bank: regex },
            { footprint: regex },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      AutoDeposit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AutoDeposit.countDocuments(query),
    ]);

    return res.json({
      success: true,
      message: "My auto deposit history fetched successfully",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /history/me/auto-deposits error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY TURNOVER HISTORY ---------------- */

router.get("/me/turnovers", protectUser, async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const { status = "", sourceType = "" } = req.query;
    const dateFilter = buildDateFilter(req.query);

    const query = { user: userId };

    if (status && status !== "all") query.status = status;
    if (sourceType && sourceType !== "all") query.sourceType = sourceType;
    if (dateFilter) query.createdAt = dateFilter;

    const [items, total] = await Promise.all([
      TurnOver.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(query),
    ]);

    return res.json({
      success: true,
      message: "My turnover history fetched successfully",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /history/me/turnovers error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY BET / GAME HISTORY ---------------- */

router.get("/me/games", protectUser, async (req, res) => {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const { page, limit, skip } = getPagination(req);
    const {
      provider_code = "",
      game_code = "",
      bet_type = "",
      status = "",
      search = "",
    } = req.query;

    const dateFilter = buildDateFilter(req.query);

    const query = {
      $or: [{ user: user._id }, { userId: user.userId }],
    };

    if (provider_code.trim()) {
      query.provider_code = new RegExp(
        `^${escapeRegex(provider_code.trim())}$`,
        "i",
      );
    }

    if (game_code.trim()) {
      query.game_code = new RegExp(escapeRegex(game_code.trim()), "i");
    }

    if (bet_type.trim() && bet_type !== "all") {
      query.bet_type = new RegExp(`^${escapeRegex(bet_type.trim())}$`, "i");
    }

    if (status.trim() && status !== "all") {
      query.status = status.trim();
    }

    if (dateFilter) query.createdAt = dateFilter;

    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");

      query.$and = [
        {
          $or: [
            { provider_code: regex },
            { game_code: regex },
            { transaction_id: regex },
            { round_id: regex },
            { verification_key: regex },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      GameHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(query),
    ]);

    return res.json({
      success: true,
      message: "My game history fetched successfully",
      data: items,
      meta: buildMeta(page, limit, total),
    });
  } catch (error) {
    console.error("GET /history/me/games error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

/* ---------------- MY ALL HISTORY SUMMARY ---------------- */

router.get("/me/all", protectUser, async (req, res) => {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const autoDepositQuery = {
      $or: [{ userIdentity: String(user._id) }, { userIdentity: user.userId }],
    };

    const gameQuery = {
      $or: [{ user: user._id }, { userId: user.userId }],
    };

    const [
      deposits,
      withdraws,
      autoDeposits,
      turnovers,
      games,
      depositCount,
      withdrawCount,
      autoDepositCount,
      turnoverCount,
      gameCount,
    ] = await Promise.all([
      DepositRequest.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      WithdrawRequest.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      AutoDeposit.find(autoDepositQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      TurnOver.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      GameHistory.find(gameQuery)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      DepositRequest.countDocuments({ user: user._id }),
      WithdrawRequest.countDocuments({ user: user._id }),
      AutoDeposit.countDocuments(autoDepositQuery),
      TurnOver.countDocuments({ user: user._id }),
      GameHistory.countDocuments(gameQuery),
    ]);

    return res.json({
      success: true,
      message: "My all history fetched successfully",
      data: {
        user,
        summary: {
          depositCount,
          withdrawCount,
          autoDepositCount,
          turnoverCount,
          gameCount,
        },
        latest: {
          deposits,
          withdraws,
          autoDeposits,
          turnovers,
          games,
        },
      },
    });
  } catch (error) {
    console.error("GET /history/me/all error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

export default router;