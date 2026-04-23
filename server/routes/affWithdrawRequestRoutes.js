import express from "express";
import mongoose from "mongoose";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js";
import AffWithdrawRequest from "../models/AffWithdrawRequest.js";
import User from "../models/User.js";
import { protectUser } from "./userRoutes.js";

const router = express.Router();

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const getAuthUserId = (req) =>
  req?.user?._id || req?.user?.id || req?.auth?._id || null;

const getAdminId = (req) =>
  req?.admin?._id || req?.user?._id || req?.auth?._id || null;

const fullName = (u) =>
  `${String(u?.firstName || "").trim()} ${String(u?.lastName || "").trim()}`.trim();

const hasPendingBulkAdjustment = (user) => {
  const total =
    n(user?.gameLossCommissionBalance) +
    n(user?.depositCommissionBalance) +
    n(user?.referCommissionBalance) +
    n(user?.gameWinCommissionBalance);

  return total > 0;
};

const validateSubmittedFields = (method, fields = {}) => {
  const errors = [];

  for (const f of method?.fields || []) {
    const value = String(fields?.[f.key] ?? "").trim();

    if (f.required !== false && !value) {
      errors.push(`${f.key} is required`);
      continue;
    }

    if (!value) continue;

    if (f.type === "email") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!ok) errors.push(`${f.key} must be a valid email`);
    }

    if (f.type === "number") {
      const num = Number(value);
      if (!Number.isFinite(num)) errors.push(`${f.key} must be numeric`);
    }

    if (f.type === "tel") {
      const bdOk = /^01[3-9]\d{8}$/.test(value);
      if (value.startsWith("01") && value.length >= 11 && !bdOk) {
        errors.push(`${f.key} must be a valid Bangladeshi phone number`);
      }
    }
  }

  return errors;
};

/**
 * AFFILIATE: eligibility
 * GET /api/aff-withdraw-requests/eligibility
 */
router.get(
  "/aff-withdraw-requests/eligibility",
  protectUser,
  async (req, res) => {
    try {
      const userId = getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findById(userId).lean();

      if (!user || user.role !== "aff-user") {
        return res.status(403).json({
          success: false,
          message: "Only affiliate users can withdraw",
        });
      }

      if (hasPendingBulkAdjustment(user)) {
        return res.json({
          success: true,
          data: {
            eligible: false,
            remaining: 0,
            message:
              "Bulk Adjustment first required. Please complete bulk adjustment before withdrawal.",
          },
        });
      }

      const pending = await AffWithdrawRequest.countDocuments({
        user: user._id,
        status: "pending",
      });

      if (pending > 0) {
        return res.json({
          success: true,
          data: {
            eligible: false,
            remaining: n(user.balance),
            message: "You already have a pending withdraw request.",
          },
        });
      }

      if (n(user.balance) <= 0) {
        return res.json({
          success: true,
          data: {
            eligible: false,
            remaining: 0,
            message: "Insufficient withdrawable balance.",
          },
        });
      }

      return res.json({
        success: true,
        data: {
          eligible: true,
          remaining: n(user.balance),
          message: "Eligible",
        },
      });
    } catch (err) {
      console.error("aff withdraw eligibility error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * AFFILIATE: create request
 * POST /api/aff-withdraw-requests
 */
router.post("/aff-withdraw-requests", protectUser, async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user || user.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only affiliate users can withdraw",
      });
    }

    if (hasPendingBulkAdjustment(user)) {
      return res.status(400).json({
        success: false,
        message: "Bulk Adjustment first required before withdraw.",
      });
    }

    const pending = await AffWithdrawRequest.findOne({
      user: user._id,
      status: "pending",
    });

    if (pending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending withdraw request.",
      });
    }

    const methodId = String(req.body?.methodId || "")
      .trim()
      .toUpperCase();
    const amount = Number(req.body?.amount || 0);
    const fields = req.body?.fields || {};

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "Method ID is required",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const method = await AffWithdrawMethod.findOne({
      methodId,
      isActive: true,
    }).lean();

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    const min = n(method.minimumWithdrawAmount);
    const max = n(method.maximumWithdrawAmount);

    if (amount < min) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdraw amount is ${min}`,
      });
    }

    if (max > 0 && amount > max) {
      return res.status(400).json({
        success: false,
        message: `Maximum withdraw amount is ${max}`,
      });
    }

    if (amount > n(user.balance)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    const fieldErrors = validateSubmittedFields(method, fields);
    if (fieldErrors.length) {
      return res.status(400).json({
        success: false,
        message: fieldErrors[0],
        errors: fieldErrors,
      });
    }

    const balanceBefore = n(user.balance);
    const balanceAfter = balanceBefore - amount;

    user.balance = balanceAfter;
    await user.save();

    const request = await AffWithdrawRequest.create({
      user: user._id,
      methodId,
      amount,
      fields,
      status: "pending",
      balanceBefore,
      balanceAfter,
    });

    return res.status(201).json({
      success: true,
      message: "Withdraw request submitted successfully",
      data: request,
    });
  } catch (err) {
    console.error("aff withdraw create error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * AFFILIATE: my list
 * GET /api/aff-withdraw-requests/my
 */
router.get("/aff-withdraw-requests/my", protectUser, async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;
    const status = String(req.query.status || "all").trim();

    const match = { user: userId };

    if (["pending", "approved", "rejected"].includes(status)) {
      match.status = status;
    }

    const [rows, total] = await Promise.all([
      AffWithdrawRequest.find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AffWithdrawRequest.countDocuments(match),
    ]);

    return res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (err) {
    console.error("aff withdraw my list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * AFFILIATE: my details
 * GET /api/aff-withdraw-requests/my/:id
 */
router.get(
  "/aff-withdraw-requests/my/:id",
  protectUser,
  async (req, res) => {
    try {
      const userId = getAuthUserId(req);
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request id",
        });
      }

      const row = await AffWithdrawRequest.findOne({
        _id: id,
        user: userId,
      }).lean();

      if (!row) {
        return res.status(404).json({
          success: false,
          message: "Withdraw request not found",
        });
      }

      return res.json({
        success: true,
        data: row,
      });
    } catch (err) {
      console.error("aff withdraw my details error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * ADMIN: list
 * GET /api/admin/aff-withdraw-requests
 */
router.get("/admin/aff-withdraw-requests", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const status = String(req.query.status || "all").trim();

    const match = {};

    if (["pending", "approved", "rejected"].includes(status)) {
      match.status = status;
    }

    if (q) {
      const users = await User.find({
        role: "aff-user",
        $or: [
          { userId: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { firstName: { $regex: q, $options: "i" } },
          { lastName: { $regex: q, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      match.$or = [
        {
          user: {
            $in: userIds.length ? userIds : [new mongoose.Types.ObjectId()],
          },
        },
        { methodId: { $regex: q, $options: "i" } },
      ];
    }

    const [rows, total] = await Promise.all([
      AffWithdrawRequest.find(match)
        .populate(
          "user",
          "userId phone email firstName lastName balance currency",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AffWithdrawRequest.countDocuments(match),
    ]);

    const data = rows.map((r) => ({
      ...r,
      user: r.user
        ? {
            ...r.user,
            fullName: fullName(r.user) || "No Name",
          }
        : null,
    }));

    return res.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (err) {
    console.error("admin aff withdraw list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN: details
 * GET /api/admin/aff-withdraw-requests/:id
 */
router.get("/admin/aff-withdraw-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request id",
      });
    }

    const row = await AffWithdrawRequest.findById(id)
      .populate(
        "user",
        "userId phone email firstName lastName balance currency",
      )
      .lean();

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Withdraw request not found",
      });
    }

    return res.json({
      success: true,
      data: {
        ...row,
        user: row.user
          ? {
              ...row.user,
              fullName: fullName(row.user) || "No Name",
            }
          : null,
      },
    });
  } catch (err) {
    console.error("admin aff withdraw details error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN: approve
 * PATCH /api/admin/aff-withdraw-requests/:id/approve
 */
router.patch("/admin/aff-withdraw-requests/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = getAdminId(req);
    const adminNote = String(req.body?.adminNote || "").trim();

    const row = await AffWithdrawRequest.findById(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Withdraw request not found",
      });
    }

    if (row.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be approved",
      });
    }

    row.status = "approved";
    row.adminId = adminId || null;
    row.adminNote = adminNote;
    row.approvedAt = new Date();

    await row.save();

    return res.json({
      success: true,
      message: "Affiliate withdraw approved successfully",
      data: row,
    });
  } catch (err) {
    console.error("admin aff withdraw approve error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN: reject
 * PATCH /api/admin/aff-withdraw-requests/:id/reject
 */
router.patch("/admin/aff-withdraw-requests/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = getAdminId(req);
    const adminNote = String(req.body?.adminNote || "").trim();

    const row = await AffWithdrawRequest.findById(id);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Withdraw request not found",
      });
    }

    if (row.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be rejected",
      });
    }

    const user = await User.findById(row.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Affiliate user not found",
      });
    }

    user.balance = n(user.balance) + n(row.amount);
    await user.save();

    row.status = "rejected";
    row.adminId = adminId || null;
    row.adminNote = adminNote;
    row.rejectedAt = new Date();
    row.balanceAfter = n(user.balance);

    await row.save();

    return res.json({
      success: true,
      message: "Affiliate withdraw rejected successfully",
      data: row,
    });
  } catch (err) {
    console.error("admin aff withdraw reject error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
