import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import mongoose from "mongoose";
import AffWithdrawMethod from "../models/AffWithdrawMethod.js";
import User from "../models/User.js";

const router = express.Router();

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "affiliate-withdraw-methods",
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMime = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

const allowedExt = [".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"];

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = allowedExt.includes(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();

    if (!allowedMime.includes(file.mimetype) || !allowedExt.includes(ext)) {
      return cb(
        new Error(
          "Only image files are allowed (png, jpg, jpeg, webp, svg, avif, gif).",
        ),
      );
    }

    cb(null, true);
  },
});

const parseJSON = (value, fallback = {}) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value || fallback;
  } catch {
    return fallback;
  }
};

const normalizeFields = (fields = []) => {
  return (Array.isArray(fields) ? fields : []).map((field) => ({
    key: String(field?.key || "").trim(),
    label: {
      bn: String(field?.label?.bn || "").trim(),
      en: String(field?.label?.en || "").trim(),
    },
    placeholder: {
      bn: String(field?.placeholder?.bn || "").trim(),
      en: String(field?.placeholder?.en || "").trim(),
    },
    type: ["text", "number", "tel", "email"].includes(field?.type)
      ? field.type
      : "text",
    required: field?.required !== false,
  }));
};

const getOwnerId = (req) => {
  return (
    req.body?.ownerId ||
    req.body?.superAffiliateId ||
    req.query?.ownerId ||
    req.query?.superAffiliateId ||
    null
  );
};

const validateOwner = async (ownerId) => {
  if (!ownerId || !mongoose.isValidObjectId(ownerId)) {
    return {
      ok: false,
      message: "Valid super affiliate ownerId is required",
      owner: null,
    };
  }

  const owner = await User.findById(ownerId).select("_id role isActive").lean();

  if (!owner) {
    return {
      ok: false,
      message: "Super affiliate user not found",
      owner: null,
    };
  }

  if (owner.role !== "super-aff-user") {
    return {
      ok: false,
      message: "Only super-aff-user can manage affiliate withdraw methods",
      owner: null,
    };
  }

  if (!owner.isActive) {
    return {
      ok: false,
      message: "Super affiliate user is inactive",
      owner: null,
    };
  }

  return {
    ok: true,
    message: "",
    owner,
  };
};

const validateMethod = ({
  methodId,
  name,
  fields,
  minimumWithdrawAmount,
  maximumWithdrawAmount,
}) => {
  const mid = String(methodId || "")
    .trim()
    .toUpperCase();

  if (!mid) return "Method ID is required";

  if (!name?.bn?.trim() || !name?.en?.trim()) {
    return "Both BN and EN name are required";
  }

  const min = Number(minimumWithdrawAmount ?? 0);
  const max = Number(maximumWithdrawAmount ?? 0);

  if (!Number.isFinite(min) || min < 0) {
    return "Minimum withdraw amount must be valid";
  }

  if (!Number.isFinite(max) || max < 0) {
    return "Maximum withdraw amount must be valid";
  }

  if (max > 0 && min > max) {
    return "Minimum withdraw amount cannot exceed maximum";
  }

  const seen = new Set();

  for (const field of fields) {
    const key = String(field?.key || "").trim();

    if (!key) return "Field key is required";

    const lowerKey = key.toLowerCase();

    if (seen.has(lowerKey)) {
      return `Duplicate field key found: ${key}`;
    }

    seen.add(lowerKey);

    if (!field?.label?.bn || !field?.label?.en) {
      return "Field label BN and EN are required";
    }
  }

  return null;
};

/**
 * PUBLIC / AFF USER
 * GET /api/aff-withdraw-methods?userId=AFF_USER_ID
 *
 * aff-user jar referredBy super-aff-user,
 * shudhu oi super-aff-user er withdraw methods dekhbe.
 */
router.get("/aff-withdraw-methods", async (req, res) => {
  try {
    const userId = req.query?.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    const user = await User.findById(userId)
      .select("_id role isActive referredBy")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Affiliate user not found",
      });
    }

    if (user.role !== "aff-user") {
      return res.status(403).json({
        success: false,
        message: "Only aff-user can see affiliate withdraw methods",
      });
    }

    if (!user.referredBy) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const methods = await AffWithdrawMethod.find({
      owner: user.referredBy,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    console.error("aff-withdraw-methods public list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * SUPER AFFILIATE LIST
 * GET /api/admin/aff-withdraw-methods?ownerId=SUPER_AFF_USER_ID
 */
router.get("/admin/aff-withdraw-methods", async (req, res) => {
  try {
    const ownerId = getOwnerId(req);

    const ownerCheck = await validateOwner(ownerId);

    if (!ownerCheck.ok) {
      return res.status(400).json({
        success: false,
        message: ownerCheck.message,
      });
    }

    const methods = await AffWithdrawMethod.find({
      owner: ownerCheck.owner._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    console.error("admin aff-withdraw-methods list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * SUPER AFFILIATE CREATE
 * POST /api/admin/aff-withdraw-methods
 *
 * FormData:
 * ownerId = super-aff-user _id
 * methodId
 * name = JSON.stringify({bn,en})
 * fields = JSON.stringify([...])
 * minimumWithdrawAmount
 * maximumWithdrawAmount
 * isActive
 * logo
 */
router.post(
  "/admin/aff-withdraw-methods",
  upload.single("logo"),
  async (req, res) => {
    try {
      const ownerId = getOwnerId(req);

      const ownerCheck = await validateOwner(ownerId);

      if (!ownerCheck.ok) {
        return res.status(400).json({
          success: false,
          message: ownerCheck.message,
        });
      }

      const methodId = String(req.body?.methodId || "")
        .trim()
        .toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(
        req.body?.minimumWithdrawAmount || 0,
      );
      const maximumWithdrawAmount = Number(
        req.body?.maximumWithdrawAmount || 0,
      );
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const exists = await AffWithdrawMethod.findOne({
        owner: ownerCheck.owner._id,
        methodId,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists for this super affiliate",
        });
      }

      const logoUrl = req.file
        ? `/uploads/affiliate-withdraw-methods/${req.file.filename}`
        : "";

      const doc = await AffWithdrawMethod.create({
        owner: ownerCheck.owner._id,
        methodId,
        name: {
          bn: String(name?.bn || "").trim(),
          en: String(name?.en || "").trim(),
        },
        logoUrl,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
        fields,
        isActive,
      });

      return res.status(201).json({
        success: true,
        message: "Affiliate withdraw method created successfully",
        data: doc,
      });
    } catch (err) {
      console.error("create aff-withdraw-method error:", err);

      if (err?.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists for this super affiliate",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * SUPER AFFILIATE UPDATE
 * PUT /api/admin/aff-withdraw-methods/:id
 *
 * ownerId required
 */
router.put(
  "/admin/aff-withdraw-methods/:id",
  upload.single("logo"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const ownerId = getOwnerId(req);

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid method id",
        });
      }

      const ownerCheck = await validateOwner(ownerId);

      if (!ownerCheck.ok) {
        return res.status(400).json({
          success: false,
          message: ownerCheck.message,
        });
      }

      const doc = await AffWithdrawMethod.findOne({
        _id: id,
        owner: ownerCheck.owner._id,
      });

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Withdraw method not found for this super affiliate",
        });
      }

      const methodId = String(req.body?.methodId || "")
        .trim()
        .toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(
        req.body?.minimumWithdrawAmount || 0,
      );
      const maximumWithdrawAmount = Number(
        req.body?.maximumWithdrawAmount || 0,
      );
      const isActive = String(req.body?.isActive) !== "false";

      const error = validateMethod({
        methodId,
        name,
        fields,
        minimumWithdrawAmount,
        maximumWithdrawAmount,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error,
        });
      }

      const exists = await AffWithdrawMethod.findOne({
        owner: ownerCheck.owner._id,
        methodId,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists for this super affiliate",
        });
      }

      doc.methodId = methodId;
      doc.name = {
        bn: String(name?.bn || "").trim(),
        en: String(name?.en || "").trim(),
      };
      doc.fields = fields;
      doc.minimumWithdrawAmount = minimumWithdrawAmount;
      doc.maximumWithdrawAmount = maximumWithdrawAmount;
      doc.isActive = isActive;

      if (req.file) {
        doc.logoUrl = `/uploads/affiliate-withdraw-methods/${req.file.filename}`;
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Affiliate withdraw method updated successfully",
        data: doc,
      });
    } catch (err) {
      console.error("update aff-withdraw-method error:", err);

      if (err?.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists for this super affiliate",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/**
 * SUPER AFFILIATE DELETE
 * DELETE /api/admin/aff-withdraw-methods/:id?ownerId=SUPER_AFF_USER_ID
 */
router.delete("/admin/aff-withdraw-methods/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = getOwnerId(req);

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid method id",
      });
    }

    const ownerCheck = await validateOwner(ownerId);

    if (!ownerCheck.ok) {
      return res.status(400).json({
        success: false,
        message: ownerCheck.message,
      });
    }

    const doc = await AffWithdrawMethod.findOneAndDelete({
      _id: id,
      owner: ownerCheck.owner._id,
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found for this super affiliate",
      });
    }

    return res.json({
      success: true,
      message: "Affiliate withdraw method deleted successfully",
    });
  } catch (err) {
    console.error("delete aff-withdraw-method error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
