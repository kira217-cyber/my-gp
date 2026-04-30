import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import SuperAffWithdrawMethod from "../models/SuperAffWithdrawMethods.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "super-aff-withdraw-methods");

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
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
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

const validateMethod = ({
  methodId,
  name,
  fields,
  minimumWithdrawAmount,
  maximumWithdrawAmount,
}) => {
  const mid = String(methodId || "").trim().toUpperCase();

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
 * SUPER AFF PUBLIC
 * GET /api/super-aff-withdraw-methods
 */
router.get("/super-aff-withdraw-methods", async (_req, res) => {
  try {
    const methods = await SuperAffWithdrawMethod.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    console.error("super-aff-withdraw-methods public list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN LIST
 * GET /api/admin/super-aff-withdraw-methods
 */
router.get("/admin/super-aff-withdraw-methods", async (_req, res) => {
  try {
    const methods = await SuperAffWithdrawMethod.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: methods,
    });
  } catch (err) {
    console.error("admin super-aff-withdraw-methods list error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * ADMIN CREATE
 * POST /api/admin/super-aff-withdraw-methods
 */
router.post(
  "/admin/super-aff-withdraw-methods",
  upload.single("logo"),
  async (req, res) => {
    try {
      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
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

      const exists = await SuperAffWithdrawMethod.findOne({ methodId });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
        });
      }

      const logoUrl = req.file
        ? `/uploads/super-aff-withdraw-methods/${req.file.filename}`
        : "";

      const doc = await SuperAffWithdrawMethod.create({
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
        message: "Super affiliate withdraw method created successfully",
        data: doc,
      });
    } catch (err) {
      console.error("create super-aff-withdraw-method error:", err);

      if (err?.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
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
 * ADMIN UPDATE
 * PUT /api/admin/super-aff-withdraw-methods/:id
 */
router.put(
  "/admin/super-aff-withdraw-methods/:id",
  upload.single("logo"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await SuperAffWithdrawMethod.findById(id);

      if (!doc) {
        return res.status(404).json({
          success: false,
          message: "Withdraw method not found",
        });
      }

      const methodId = String(req.body?.methodId || "").trim().toUpperCase();
      const name = parseJSON(req.body?.name, {});
      const fields = normalizeFields(parseJSON(req.body?.fields, []));
      const minimumWithdrawAmount = Number(req.body?.minimumWithdrawAmount || 0);
      const maximumWithdrawAmount = Number(req.body?.maximumWithdrawAmount || 0);
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

      const exists = await SuperAffWithdrawMethod.findOne({
        methodId,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
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
        doc.logoUrl = `/uploads/super-aff-withdraw-methods/${req.file.filename}`;
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Super affiliate withdraw method updated successfully",
        data: doc,
      });
    } catch (err) {
      console.error("update super-aff-withdraw-method error:", err);

      if (err?.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Method ID already exists",
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
 * ADMIN DELETE
 * DELETE /api/admin/super-aff-withdraw-methods/:id
 */
router.delete("/admin/super-aff-withdraw-methods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await SuperAffWithdrawMethod.findByIdAndDelete(id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Withdraw method not found",
      });
    }

    return res.json({
      success: true,
      message: "Super affiliate withdraw method deleted successfully",
    });
  } catch (err) {
    console.error("delete super-aff-withdraw-method error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;