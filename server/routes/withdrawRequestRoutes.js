import express from "express";
import mongoose from "mongoose";
import WithdrawRequest from "../models/WithdrawRequest.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import WithdrawMethod from "../models/WithdrawMethod.js";
import { protectUser } from "./userRoutes.js";

const router = express.Router();

const normalizeFields = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
};

const getUserIdFromReq = (req) => req.user?.id || req.user?._id || null;

/**
 * USER: eligibility
 * block withdraw if user has any running turnover
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
    return res.status(500).json({
      success: false,
      message: "Failed to check eligibility",
    });
  }
});

/**
 * USER: create withdraw request
 * - turnover fulfilled check
 * - method validation
 * - balance hold instantly
 */
router.post("/withdraw-requests", protectUser, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const methodId = String(req.body?.methodId || "").trim().toUpperCase();
    const amount = req.body?.amount;
    const fields =
      req.body?.fields && typeof req.body.fields === "object"
        ? req.body.fields
        : {};

    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({
        success: false,
        message: "amount is required",
      });
    }

    const amt = Number(amount);

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
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

    if (currentBalance < amt) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const balanceAfter = currentBalance - amt;

    const doc = await WithdrawRequest.create({
      user: user._id,
      methodId,
      amount: amt,
      fields,
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
      data: doc,
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
    const doc = await WithdrawRequest.findById(req.params.id).populate(
      "user",
      "userId phone email balance role isActive",
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
    return res.status(500).json({
      success: false,
      message: "Failed to load details",
    });
  }
});

/**
 * ADMIN: approve
 * balance already held on create
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
  const session = await mongoose.startSession();

  try {
    const { adminNote } = req.body || {};
    let updatedDoc = null;

    await session.withTransaction(async () => {
      const doc = await WithdrawRequest.findById(req.params.id).session(
        session,
      );

      if (!doc) {
        throw Object.assign(new Error("Not found"), { statusCode: 404 });
      }

      if (doc.status !== "pending") {
        throw Object.assign(new Error("Only pending can be rejected"), {
          statusCode: 400,
        });
      }

      await User.updateOne(
        { _id: doc.user },
        { $inc: { balance: Number(doc.amount || 0) } },
        { session },
      );

      doc.status = "rejected";
      doc.rejectedAt = new Date();
      doc.approvedAt = null;
      doc.adminNote = adminNote || "";
      doc.adminId = getUserIdFromReq(req) || null;

      await doc.save({ session });
      updatedDoc = doc;
    });

    return res.json({
      success: true,
      message: "Rejected successfully and balance refunded",
      data: updatedDoc,
    });
  } catch (e) {
    const status = e?.statusCode || 500;

    return res.status(status).json({
      success: false,
      message: e?.message || "Reject failed",
    });
  } finally {
    await session.endSession();
  }
});

export default router;
