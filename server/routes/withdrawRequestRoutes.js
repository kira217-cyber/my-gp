import express from "express";
import mongoose from "mongoose";
import WithdrawRequest from "../models/WithdrawRequest.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import WithdrawMethod from "../models/WithdrawMethod.js";
import EWallet from "../models/EWallet.js";
import { protectUser } from "./userRoutes.js";

const router = express.Router();

const getUserIdFromReq = (req) => req.user?.id || req.user?._id || null;

const normalizeMethodId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

/**
 * USER: eligibility
 */
router.get("/withdraw-requests/eligibility", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (!running) {
      return res.json({
        success: true,
        data: {
          eligible: true,
          hasRunningTurnover: false,
          remaining: 0,
          message: "",
        },
      });
    }

    const required = Number(running.required || 0);
    const progress = Number(running.progress || 0);
    const remaining = Math.max(0, required - progress);

    return res.json({
      success: true,
      data: {
        eligible: false,
        hasRunningTurnover: true,
        remaining,
        message:
          remaining > 0
            ? `Turnover pending: remaining ${remaining}`
            : "Turnover pending",
      },
    });
  } catch (e) {
    console.error("WITHDRAW ELIGIBILITY ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/**
 * USER: create withdraw request
 */
router.post("/withdraw-requests", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    const methodId = normalizeMethodId(req.body?.methodId);
    const walletId = String(req.body?.walletId || "").trim();
    const amountRaw = req.body?.amount;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!walletId) {
      return res.status(400).json({
        success: false,
        message: "walletId is required",
      });
    }

    if (amountRaw === undefined || amountRaw === null || amountRaw === "") {
      return res.status(400).json({
        success: false,
        message: "amount is required",
      });
    }

    const amount = Number(amountRaw);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const running = await TurnOver.findOne({
      user: userId,
      status: "running",
    }).sort({ createdAt: 1 });

    if (running) {
      const remaining = Math.max(
        0,
        Number(running.required || 0) - Number(running.progress || 0),
      );

      return res.status(403).json({
        success: false,
        message: "Turnover not fulfilled. Complete turnover before withdraw.",
        data: { remaining },
      });
    }

    const method = await WithdrawMethod.findOne({
      methodId,
      isActive: true,
    });

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found or inactive",
      });
    }

    const minAmount = Number(method.minimumWithdrawAmount || 0);
    const maxAmount = Number(method.maximumWithdrawAmount || 0);

    if (minAmount > 0 && amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdraw amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdraw amount is ${maxAmount}`,
      });
    }

    const wallet = await EWallet.findOne({
      _id: walletId,
      user: userId,
      isActive: true,
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (String(wallet.methodId).toUpperCase() !== methodId) {
      return res.status(400).json({
        success: false,
        message: "Selected wallet does not match the method",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    const currentBalance = Number(user.balance || 0);

    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const balanceAfter = currentBalance - amount;

    const createdDoc = await WithdrawRequest.create({
      user: user._id,
      methodId,
      wallet: wallet._id,
      walletSnapshot: {
        methodId: method.methodId,
        methodName: {
          bn: method?.name?.bn || "",
          en: method?.name?.en || "",
        },
        walletType: wallet.walletType || "",
        walletNumber: wallet.walletNumber || "",
        label: wallet.label || "",
      },
      amount,
      status: "pending",
      balanceBefore: currentBalance,
      balanceAfter,
    });

    await User.updateOne(
      { _id: user._id },
      { $set: { balance: balanceAfter } },
    );

    return res.json({
      success: true,
      message: "Withdraw request created successfully",
      data: createdDoc,
    });
  } catch (e) {
    console.error("WITHDRAW CREATE ERROR:", e);
    return res.status(500).json({
      success: false,
      message: e?.message || "Server error",
    });
  }
});

/**
 * USER: my requests
 */
router.get("/withdraw-requests/my", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments({ user: userId }),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    console.error("MY WITHDRAW REQUESTS ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load history",
    });
  }
});

/**
 * USER: my single request
 */
router.get("/withdraw-requests/my/:id", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    const doc = await WithdrawRequest.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (e) {
    console.error("MY SINGLE WITHDRAW REQUEST ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load request",
    });
  }
});

/**
 * ADMIN: list requests
 */
router.get("/admin/withdraw-requests", async (req, res) => {
  try {
    const status = String(req.query.status || "pending").trim();
    const qText = String(req.query.q || "").trim();

    const q = {};

    if (status && status !== "all") {
      q.status = status;
    }

    if (qText) {
      const users = await User.find({
        $or: [
          { userId: { $regex: qText, $options: "i" } },
          { phone: { $regex: qText, $options: "i" } },
          { email: { $regex: qText, $options: "i" } },
        ],
      }).select("_id");

      const ids = users.map((u) => u._id);

      q.user = {
        $in: ids.length ? ids : [new mongoose.Types.ObjectId()],
      };
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      WithdrawRequest.find(q)
        .populate("user", "userId phone email balance role isActive")
        .populate(
          "wallet",
          "methodId walletType walletNumber label isDefault isActive",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WithdrawRequest.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: items,
      meta: { page, limit, total },
    });
  } catch (e) {
    console.error("ADMIN LIST WITHDRAW REQUESTS ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load requests",
    });
  }
});

/**
 * ADMIN: details
 */
router.get("/admin/withdraw-requests/:id", async (req, res) => {
  try {
    const doc = await WithdrawRequest.findById(req.params.id)
      .populate("user", "userId phone email balance role isActive")
      .populate(
        "wallet",
        "methodId walletType walletNumber label isDefault isActive",
      );

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    return res.json({
      success: true,
      data: doc,
    });
  } catch (e) {
    console.error("ADMIN WITHDRAW DETAILS ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load details",
    });
  }
});

/**
 * ADMIN: approve
 */
router.patch("/admin/withdraw-requests/:id/approve", async (req, res) => {
  try {
    const { adminNote } = req.body || {};

    const doc = await WithdrawRequest.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved",
      });
    }

    doc.status = "approved";
    doc.approvedAt = new Date();
    doc.rejectedAt = null;
    doc.adminNote = adminNote || "";
    doc.adminId = getUserIdFromReq(req) || null;

    await doc.save();

    return res.json({
      success: true,
      message: "Approved successfully",
      data: doc,
    });
  } catch (e) {
    console.error("APPROVE WITHDRAW ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Approve failed",
    });
  }
});

/**
 * ADMIN: reject
 * refund held balance
 */
router.patch("/admin/withdraw-requests/:id/reject", async (req, res) => {
  try {
    const { adminNote } = req.body || {};

    const doc = await WithdrawRequest.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending can be rejected",
      });
    }

    await User.updateOne(
      { _id: doc.user },
      { $inc: { balance: Number(doc.amount || 0) } },
    );

    doc.status = "rejected";
    doc.rejectedAt = new Date();
    doc.approvedAt = null;
    doc.adminNote = adminNote || "";
    doc.adminId = getUserIdFromReq(req) || null;

    await doc.save();

    return res.json({
      success: true,
      message: "Rejected successfully and balance refunded",
      data: doc,
    });
  } catch (e) {
    console.error("REJECT WITHDRAW ERROR:", e);

    return res.status(500).json({
      success: false,
      message: e?.message || "Reject failed",
    });
  }
});

export default router;
