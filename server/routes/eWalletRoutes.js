import express from "express";
import mongoose from "mongoose";
import EWallet from "../models/EWallet.js";
import WithdrawMethod from "../models/WithdrawMethod.js";
import { protectUser } from "./userRoutes.js";

const router = express.Router();

const getUserIdFromReq = (req) => req.user?.id || req.user?._id || null;

const normalizeMethodId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const normalizeWalletType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeWalletNumber = (value) => String(value || "").trim();

const normalizeLabel = (value) => String(value || "").trim();

const validWalletTypes = ["personal", "agent", "merchant"];

const validateWalletNumber = (walletNumber) => /^01[3-9]\d{8}$/.test(walletNumber);

/**
 * USER: list my wallets
 * optional query: ?methodId=BKASH
 */
router.get("/", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const methodId = normalizeMethodId(req.query.methodId);

    const q = {
      user: userId,
      isActive: true,
    };

    if (methodId) {
      q.methodId = methodId;
    }

    const items = await EWallet.find(q).sort({
      isDefault: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: items,
    });
  } catch (e) {
    console.error("GET EWALLETS ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to load wallets",
    });
  }
});

/**
 * USER: create wallet
 */
router.post("/", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const methodId = normalizeMethodId(req.body?.methodId);
    const walletType = normalizeWalletType(req.body?.walletType);
    const walletNumber = normalizeWalletNumber(req.body?.walletNumber);
    const label = normalizeLabel(req.body?.label);

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!validWalletTypes.includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet type",
      });
    }

    if (!walletNumber) {
      return res.status(400).json({
        success: false,
        message: "walletNumber is required",
      });
    }

    if (!validateWalletNumber(walletNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet number",
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

    const exists = await EWallet.findOne({
      user: userId,
      methodId,
      walletNumber,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This wallet already exists",
      });
    }

    const count = await EWallet.countDocuments({
      user: userId,
      methodId,
      isActive: true,
    });

    const created = await EWallet.create({
      user: userId,
      methodId,
      walletType,
      walletNumber,
      label,
      isDefault: count === 0,
    });

    return res.status(201).json({
      success: true,
      message: "E-wallet created successfully",
      data: created,
    });
  } catch (e) {
    console.error("CREATE EWALLET ERROR:", e);

    if (e?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This wallet already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: e?.message || "Failed to create wallet",
    });
  }
});

/**
 * USER: update wallet
 */
router.put("/:id", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const methodId = normalizeMethodId(req.body?.methodId || existing.methodId);
    const walletType = normalizeWalletType(
      req.body?.walletType || existing.walletType,
    );
    const walletNumber = normalizeWalletNumber(
      req.body?.walletNumber || existing.walletNumber,
    );
    const label = normalizeLabel(
      req.body?.label !== undefined ? req.body.label : existing.label,
    );

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!validWalletTypes.includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet type",
      });
    }

    if (!walletNumber) {
      return res.status(400).json({
        success: false,
        message: "walletNumber is required",
      });
    }

    if (!validateWalletNumber(walletNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet number",
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

    const duplicate = await EWallet.findOne({
      user: userId,
      methodId,
      walletNumber,
      _id: { $ne: existing._id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another wallet already uses this number",
      });
    }

    existing.methodId = methodId;
    existing.walletType = walletType;
    existing.walletNumber = walletNumber;
    existing.label = label;

    await existing.save();

    return res.json({
      success: true,
      message: "E-wallet updated successfully",
      data: existing,
    });
  } catch (e) {
    console.error("UPDATE EWALLET ERROR:", e);

    if (e?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Another wallet already uses this number",
      });
    }

    return res.status(500).json({
      success: false,
      message: e?.message || "Failed to update wallet",
    });
  }
});

/**
 * USER: delete wallet
 * soft delete
 */
router.delete("/:id", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    existing.isActive = false;
    existing.isDefault = false;
    await existing.save();

    const nextDefault = await EWallet.findOne({
      user: userId,
      methodId: existing.methodId,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (nextDefault) {
      nextDefault.isDefault = true;
      await nextDefault.save();
    }

    return res.json({
      success: true,
      message: "E-wallet deleted successfully",
    });
  } catch (e) {
    console.error("DELETE EWALLET ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to delete wallet",
    });
  }
});

/**
 * USER: set default wallet
 */
router.patch("/:id/default", protectUser, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet id",
      });
    }

    const existing = await EWallet.findOne({
      _id: req.params.id,
      user: userId,
      isActive: true,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    await EWallet.updateMany(
      {
        user: userId,
        methodId: existing.methodId,
      },
      {
        $set: { isDefault: false },
      },
    );

    existing.isDefault = true;
    await existing.save();

    return res.json({
      success: true,
      message: "Default wallet updated successfully",
      data: existing,
    });
  } catch (e) {
    console.error("SET DEFAULT EWALLET ERROR:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to set default wallet",
    });
  }
});

export default router;