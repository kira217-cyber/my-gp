import express from "express";
import mongoose from "mongoose";
import WithdrawMethod from "../models/WithdrawMethod.js";
import upload from "../config/multer.js";

const router = express.Router();

const safeParseJSON = (value, fallback) => {
  try {
    if (value === undefined || value === null || value === "") return fallback;
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeI18n = (value = {}) => ({
  bn: typeof value?.bn === "string" ? value.bn.trim() : "",
  en: typeof value?.en === "string" ? value.en.trim() : "",
});

const buildPayload = (req, oldLogoUrl = "") => {
  const body = req.body || {};

  const methodId = String(body.methodId || "")
    .trim()
    .toUpperCase();

  const name = normalizeI18n(safeParseJSON(body.name, {}));

  return {
    methodId,
    name,
    logoUrl: req.file ? `/${req.file.path.replace(/\\/g, "/")}` : oldLogoUrl,
    minimumWithdrawAmount: Number(body.minimumWithdrawAmount || 0),
    maximumWithdrawAmount: Number(body.maximumWithdrawAmount || 0),
    isActive: body.isActive === "false" ? false : true,
  };
};

// GET all
router.get("/", async (req, res) => {
  try {
    const methods = await WithdrawMethod.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Withdraw methods fetched successfully",
      data: methods,
    });
  } catch (error) {
    console.error("GET withdraw methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdraw methods",
      error: error.message,
    });
  }
});

// GET public active methods
router.get("/public", async (req, res) => {
  try {
    const methods = await WithdrawMethod.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Withdraw methods fetched successfully",
      data: methods,
    });
  } catch (error) {
    console.error("GET public withdraw methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch public withdraw methods",
      error: error.message,
    });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw method id",
      });
    }

    const method = await WithdrawMethod.findById(req.params.id);

    if (!method) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Withdraw method fetched successfully",
      data: method,
    });
  } catch (error) {
    console.error("GET single withdraw method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdraw method",
      error: error.message,
    });
  }
});

// CREATE
router.post("/", upload.single("logo"), async (req, res) => {
  try {
    const payload = buildPayload(req);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!payload.name.bn || !payload.name.en) {
      return res.status(400).json({
        success: false,
        message: "Both BN and EN names are required",
      });
    }

    if (
      payload.minimumWithdrawAmount > 0 &&
      payload.maximumWithdrawAmount > 0 &&
      payload.minimumWithdrawAmount > payload.maximumWithdrawAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdraw cannot be greater than maximum withdraw",
      });
    }

    const exists = await WithdrawMethod.findOne({ methodId: payload.methodId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This methodId already exists",
      });
    }

    const created = await WithdrawMethod.create(payload);

    return res.status(201).json({
      success: true,
      message: "Withdraw method created successfully",
      data: created,
    });
  } catch (error) {
    console.error("CREATE withdraw method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create withdraw method",
      error: error.message,
    });
  }
});

// UPDATE
router.put("/:id", upload.single("logo"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw method id",
      });
    }

    const existing = await WithdrawMethod.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    const payload = buildPayload(req, existing.logoUrl);

    if (!payload.methodId) {
      return res.status(400).json({
        success: false,
        message: "methodId is required",
      });
    }

    if (!payload.name.bn || !payload.name.en) {
      return res.status(400).json({
        success: false,
        message: "Both BN and EN names are required",
      });
    }

    if (
      payload.minimumWithdrawAmount > 0 &&
      payload.maximumWithdrawAmount > 0 &&
      payload.minimumWithdrawAmount > payload.maximumWithdrawAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdraw cannot be greater than maximum withdraw",
      });
    }

    const duplicate = await WithdrawMethod.findOne({
      methodId: payload.methodId,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Another withdraw method already uses this methodId",
      });
    }

    const updated = await WithdrawMethod.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Withdraw method updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE withdraw method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update withdraw method",
      error: error.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw method id",
      });
    }

    const deleted = await WithdrawMethod.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Withdraw method deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("DELETE withdraw method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete withdraw method",
      error: error.message,
    });
  }
});

export default router;
