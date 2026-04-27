import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import fs from "fs";
import path from "path";
import upload from "../config/multer.js";
import AutoPersonalDepositSetting from "../models/AutoPersonalDepositSetting.js";
import AutoPersonalDeposit from "../models/AutoPersonalDeposit.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";

const router = express.Router();

const VALID_METHODS = ["bkash", "nagad", "rocket", "upay"];

/* ----------------------------- HELPERS ----------------------------- */

async function getOrCreateSetting() {
  let s = await AutoPersonalDepositSetting.findOne();

  if (!s) {
    s = new AutoPersonalDepositSetting({
      apiKey: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
      methods: [
        {
          methodId: "bkash",
          methodName: { bn: "বিকাশ", en: "bKash" },
          image: "",
          isActive: true,
          order: 0,
        },
        {
          methodId: "nagad",
          methodName: { bn: "নগদ", en: "Nagad" },
          image: "",
          isActive: true,
          order: 1,
        },
        {
          methodId: "rocket",
          methodName: { bn: "রকেট", en: "Rocket" },
          image: "",
          isActive: true,
          order: 2,
        },
        {
          methodId: "upay",
          methodName: { bn: "উপায়", en: "Upay" },
          image: "",
          isActive: true,
          order: 3,
        },
      ],
      bonuses: [],
      supportNumber: "",
    });

    await s.save();
  }

  return s;
}

function safeString(val = "") {
  return String(val || "").trim();
}

function normalizeMoney(val, fallback = 0) {
  const n = Math.floor(Number(val || 0));
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function buildFileUrl(req, filePath = "") {
  const clean = safeString(filePath);
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;

  const normalized = clean.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${req.protocol}://${req.get("host")}/${normalized}`;
}

function normalizeUploadPath(file) {
  if (!file?.path) return "";
  return `/${String(file.path).replace(/\\/g, "/")}`;
}

function deleteLocalFile(fileUrlOrPath = "") {
  try {
    const value = safeString(fileUrlOrPath);
    if (!value) return;

    let pathname = value;

    if (value.startsWith("http://") || value.startsWith("https://")) {
      const u = new URL(value);
      pathname = u.pathname;
    }

    pathname = pathname.replace(/^\/+/, "");

    if (!pathname.startsWith("uploads/")) return;

    const abs = path.join(process.cwd(), pathname);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    // ignore file delete error
  }
}

function getDefaultAffiliateCommissionInfo() {
  return {
    affiliatorId: "",
    affiliatorUserId: "",
    percent: 0,
    baseAmount: 0,
    commissionAmount: 0,
  };
}

function getDefaultSelectedBonus() {
  return {
    bonusId: "",
    title: { bn: "", en: "" },
    bonusType: "",
    bonusValue: 0,
    bonusAmount: 0,
    turnoverMultiplier: 1,
  };
}

function computeSelectedBonusAmount({ amount, selectedBonus }) {
  const depositAmount = normalizeMoney(amount, 0);

  if (!selectedBonus) {
    return {
      depositAmount,
      bonusAmount: 0,
      creditedAmount: depositAmount,
      turnoverMultiplier: 1,
      targetTurnover: depositAmount,
      selectedBonus: getDefaultSelectedBonus(),
    };
  }

  const bonusValue = Number(selectedBonus?.bonusValue || 0);
  const bonusType = String(selectedBonus?.bonusType || "fixed").toLowerCase();

  let bonusAmount = 0;

  if (bonusType === "percent") {
    bonusAmount = Math.floor((depositAmount * bonusValue) / 100);
  } else {
    bonusAmount = Math.floor(bonusValue);
  }

  const turnoverMultiplier = Math.max(
    Number(selectedBonus?.turnoverMultiplier || 1),
    0,
  );

  const creditedAmount = depositAmount + bonusAmount;
  const targetTurnover = Math.floor(creditedAmount * turnoverMultiplier);

  return {
    depositAmount,
    bonusAmount,
    creditedAmount,
    turnoverMultiplier,
    targetTurnover,
    selectedBonus: {
      bonusId: String(selectedBonus?._id || ""),
      title: {
        bn: selectedBonus?.title?.bn || "",
        en: selectedBonus?.title?.en || "",
      },
      bonusType: bonusType === "percent" ? "percent" : "fixed",
      bonusValue,
      bonusAmount,
      turnoverMultiplier,
    },
  };
}

function parseJsonField(value, fallback) {
  try {
    if (typeof value === "string") return JSON.parse(value);
    if (value !== undefined) return value;
    return fallback;
  } catch {
    return fallback;
  }
}

function getPublicFrontendUrl() {
  return process.env.PUBLIC_FRONTEND_URL;
}

function getPublicBackendUrl(req) {
  return (
    process.env.PUBLIC_BACKEND_URL || `${req.protocol}://${req.get("host")}`
  );
}

async function addBalanceCommissionAndTurnover({ userId, dep }) {
  if (!dep?._id) throw new Error("Deposit document missing");

  const freshDep = await AutoPersonalDeposit.findById(dep._id);

  if (!freshDep) throw new Error("Deposit not found");

  if (freshDep.balanceAdded === true) {
    console.log("auto-personal balance already added");
    return freshDep;
  }

  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");
  if (user.isActive === false) throw new Error("User is inactive");

  const creditedAmount = Number(
    freshDep?.calc?.creditedAmount || freshDep.amount || 0,
  );

  const targetTurnover = Number(
    freshDep?.calc?.targetTurnover || freshDep.amount || 0,
  );

  if (!creditedAmount || creditedAmount <= 0) {
    throw new Error("Invalid credited amount");
  }

  user.balance = Number(user.balance || 0) + creditedAmount;
  await user.save();

  let affiliateCommissionInfo = getDefaultAffiliateCommissionInfo();

  if (
    user.referredBy &&
    mongoose.Types.ObjectId.isValid(String(user.referredBy))
  ) {
    const affiliator = await User.findById(user.referredBy);

    if (affiliator && affiliator.role === "aff-user" && affiliator.isActive) {
      const pct = Number(affiliator.depositCommission || 0);

      if (Number.isFinite(pct) && pct > 0) {
        const commissionBase = Number(freshDep.amount || 0);
        const commissionAmount = (commissionBase * pct) / 100;

        if (commissionAmount > 0) {
          affiliator.depositCommissionBalance =
            Number(affiliator.depositCommissionBalance || 0) + commissionAmount;

          await affiliator.save();

          affiliateCommissionInfo = {
            affiliatorId: String(affiliator._id || ""),
            affiliatorUserId: String(affiliator.userId || ""),
            percent: Number(pct || 0),
            baseAmount: Number(commissionBase || 0),
            commissionAmount: Number(commissionAmount || 0),
          };
        }
      }
    }
  }

  freshDep.balanceAdded = true;
  freshDep.calc = {
    depositAmount: Number(freshDep?.calc?.depositAmount || freshDep.amount || 0),
    bonusAmount: Number(freshDep?.calc?.bonusAmount || 0),
    creditedAmount,
    turnoverMultiplier: Number(freshDep?.calc?.turnoverMultiplier || 1),
    targetTurnover,
    affiliateDepositCommission: affiliateCommissionInfo,
  };

  await freshDep.save();

  const existingTurnover = await TurnOver.findOne({
    user: user._id,
    sourceType: "auto-personal-deposit",
    sourceId: freshDep._id,
  });

  if (!existingTurnover) {
    await TurnOver.create({
      user: user._id,
      sourceType: "auto-personal-deposit",
      sourceId: freshDep._id,
      required: targetTurnover,
      progress: 0,
      status: targetTurnover <= 0 ? "completed" : "running",
      creditedAmount,
      completedAt: targetTurnover <= 0 ? new Date() : null,
    });
  }

  console.log("✅ auto-personal balance/commission/turnover added:", {
    userId: String(user._id),
    creditedAmount,
    newBalance: user.balance,
    affiliateCommissionInfo,
    targetTurnover,
  });

  return freshDep;
}

function buildPersonalIdentity({
  userIdentity,
  selectedBonusId,
  invoiceNumber,
}) {
  return `APD__${userIdentity}__${selectedBonusId || "none"}__${invoiceNumber}`;
}

function parsePersonalIdentity(value = "") {
  const raw = safeString(value);
  const parts = raw.split("__");

  if (parts.length >= 4 && parts[0] === "APD") {
    return {
      raw,
      userId: parts[1] || "",
      selectedBonusId: parts[2] === "none" ? "" : parts[2] || "",
      invoiceNumber: parts.slice(3).join("__") || raw,
    };
  }

  if (parts.length >= 3 && mongoose.Types.ObjectId.isValid(parts[0])) {
    return {
      raw,
      userId: parts[0] || "",
      selectedBonusId: parts[1] === "none" ? "" : parts[1] || "",
      invoiceNumber: parts.slice(2).join("__") || raw,
    };
  }

  return {
    raw,
    userId: "",
    selectedBonusId: "",
    invoiceNumber: raw,
  };
}

/* ----------------------------- ADMIN: GET SETTINGS ----------------------------- */

router.get("/admin", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

    const methods = Array.isArray(s.methods)
      ? [...s.methods]
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((m) => ({
            _id: String(m._id),
            methodId: m.methodId || "",
            methodName: {
              bn: m?.methodName?.bn || "",
              en: m?.methodName?.en || "",
            },
            image: buildFileUrl(req, m.image || ""),
            rawImage: m.image || "",
            isActive: m.isActive !== false,
            order: Number(m.order || 0),
          }))
      : [];

    const bonuses = Array.isArray(s.bonuses)
      ? [...s.bonuses]
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((b) => ({
            _id: String(b._id),
            title: {
              bn: b?.title?.bn || "",
              en: b?.title?.en || "",
            },
            bonusType: b?.bonusType || "fixed",
            bonusValue: Number(b?.bonusValue || 0),
            turnoverMultiplier: Number(b?.turnoverMultiplier || 1),
            isActive: b.isActive !== false,
            order: Number(b.order || 0),
          }))
      : [];

    return res.json({
      success: true,
      data: {
        apiKey: s.apiKey || "",
        active: !!s.active,
        minAmount: Number(s.minAmount || 5),
        maxAmount: Number(s.maxAmount || 0),
        supportNumber: s.supportNumber || "",
        methods,
        bonuses,
        lastKeyValidation: s.lastKeyValidation || {},
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/* ----------------------------- ADMIN: UPDATE SETTINGS ----------------------------- */
/**
 * multipart/form-data
 * fields:
 * apiKey, active, minAmount, maxAmount, methods(JSON), bonuses(JSON)
 * files:
 * methodImages => max 10
 *
 * methods item example:
 * {
 *   _id,
 *   methodId: "bkash",
 *   methodName: {bn,en},
 *   image,
 *   isActive,
 *   order,
 *   removeImage: false
 * }
 */

router.put(
  "/admin",
  upload.fields([
    { name: "methodImage_bkash", maxCount: 1 },
    { name: "methodImage_nagad", maxCount: 1 },
    { name: "methodImage_rocket", maxCount: 1 },
    { name: "methodImage_upay", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const s = await getOrCreateSetting();

      const body = req.body || {};
      const files = Object.values(req.files || {}).flat();

      if (typeof body.apiKey === "string") {
        s.apiKey = body.apiKey.trim();
      }

      if (typeof body.active !== "undefined") {
        s.active = String(body.active) === "true" || body.active === true;
      }

      const min = normalizeMoney(body.minAmount, 5);
      const max = normalizeMoney(body.maxAmount, 0);

      s.minAmount = Math.max(1, min);
      s.maxAmount = Math.max(0, max);

      if (s.maxAmount > 0 && s.minAmount > s.maxAmount) {
        return res.status(400).json({
          success: false,
          message: "minAmount cannot be greater than maxAmount",
        });
      }

      const incomingMethods = parseJsonField(body.methods, []);
      const incomingBonuses = parseJsonField(body.bonuses, []);

      if (Array.isArray(incomingMethods)) {
        const previousByMethodId = new Map(
          (s.methods || []).map((m) => [String(m.methodId), m]),
        );

        const sanitizedMethods = incomingMethods
          .map((item, index) => {
            const methodId = safeString(item?.methodId).toLowerCase();

            if (!VALID_METHODS.includes(methodId)) return null;

            const oldMethod = previousByMethodId.get(methodId);

            let image = safeString(item?.image || oldMethod?.image || "");

            if (item?.removeImage === true || item?.removeImage === "true") {
              deleteLocalFile(image);
              image = "";
            }

            const matchedFile =
              files.find((f) => f.fieldname === `methodImage_${methodId}`) ||
              null;

            if (matchedFile) {
              deleteLocalFile(image);
              image = normalizeUploadPath(matchedFile);
            }

            return {
              _id:
                item?._id && mongoose.Types.ObjectId.isValid(String(item._id))
                  ? new mongoose.Types.ObjectId(String(item._id))
                  : oldMethod?._id || new mongoose.Types.ObjectId(),
              methodId,
              methodName: {
                bn: safeString(item?.methodName?.bn),
                en: safeString(item?.methodName?.en),
              },
              image,
              isActive: item?.isActive !== false && item?.isActive !== "false",
              order: Math.max(0, normalizeMoney(item?.order, index)),
            };
          })
          .filter(Boolean);

        s.methods = sanitizedMethods;
      }

      if (Array.isArray(incomingBonuses)) {
        const sanitizedBonuses = incomingBonuses
          .map((item, index) => ({
            _id:
              item?._id && mongoose.Types.ObjectId.isValid(String(item._id))
                ? new mongoose.Types.ObjectId(String(item._id))
                : new mongoose.Types.ObjectId(),
            title: {
              bn: safeString(item?.title?.bn),
              en: safeString(item?.title?.en),
            },
            bonusType:
              safeString(item?.bonusType).toLowerCase() === "percent"
                ? "percent"
                : "fixed",
            bonusValue: Math.max(0, Number(item?.bonusValue || 0)),
            turnoverMultiplier: Math.max(
              0,
              Number(item?.turnoverMultiplier || 0),
            ),
            isActive: item?.isActive !== false && item?.isActive !== "false",
            order: Math.max(0, normalizeMoney(item?.order, index)),
          }))
          .filter(
            (item) =>
              item.title.bn &&
              item.title.en &&
              Number.isFinite(item.bonusValue) &&
              Number.isFinite(item.turnoverMultiplier),
          );

        s.bonuses = sanitizedBonuses;
      }

      await s.save();

      return res.json({
        success: true,
        message: "Auto personal deposit settings updated successfully",
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err?.message || "Update failed",
      });
    }
  },
);

/* ----------------------------- ADMIN: KEY VALIDATE ----------------------------- */

router.get("/admin/key/validate", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

    if (!s.apiKey) {
      s.lastKeyValidation = {
        valid: false,
        reason: "MISSING_API_KEY",
        checkedAt: new Date(),
        response: {},
      };
      await s.save();

      return res.status(400).json({
        success: false,
        valid: false,
        reason: "MISSING_API_KEY",
      });
    }

    const { data } = await axios.get(
      "https://api.oraclepay.org/api/external/key/validate",
      {
        headers: {
          "X-API-Key": String(s.apiKey || "").trim(),
        },
        timeout: 15000,
      },
    );

    s.lastKeyValidation = {
      valid: !!data?.valid,
      reason: data?.reason || "",
      checkedAt: new Date(),
      response: data || {},
    };

    await s.save();

    return res.json(data);
  } catch (err) {
    const payload = err?.response?.data || {
      success: false,
      valid: false,
      reason: err?.message || "KEY_VALIDATE_FAILED",
    };

    s.lastKeyValidation = {
      valid: false,
      reason: payload?.reason || payload?.message || "KEY_VALIDATE_FAILED",
      checkedAt: new Date(),
      response: payload,
    };

    await s.save();

    return res.status(err?.response?.status || 500).json(payload);
  }
});

/* ----------------------------- ADMIN: SUPPORT NUMBER ----------------------------- */

router.get("/admin/support-number", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

    if (!s.apiKey) {
      return res.status(400).json({
        success: false,
        message: "Missing API key",
      });
    }

    const { data } = await axios.get(
      "https://api.oraclepay.org/api/external/support-number",
      {
        headers: {
          "X-API-Key": String(s.apiKey || "").trim(),
        },
        timeout: 15000,
      },
    );

    if (data?.success && data?.supportNumber) {
      s.supportNumber = data.supportNumber;
      await s.save();
    }

    return res.json(data);
  } catch (err) {
    return res.status(err?.response?.status || 500).json({
      success: false,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.reason ||
        err?.message ||
        "Support number fetch failed",
    });
  }
});

/* ----------------------------- CLIENT: STATUS ----------------------------- */

router.get("/status", async (req, res) => {
  try {
    const s = await getOrCreateSetting();
    const enabled = !!(s.active && s.apiKey);

    const methods = Array.isArray(s.methods)
      ? [...s.methods]
          .filter((m) => m?.isActive !== false)
          .filter((m) => VALID_METHODS.includes(String(m.methodId)))
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((m) => ({
            _id: String(m._id),
            methodId: m.methodId || "",
            methodName: {
              bn: m?.methodName?.bn || "",
              en: m?.methodName?.en || "",
            },
            image: buildFileUrl(req, m.image || ""),
            order: Number(m.order || 0),
          }))
      : [];

    const bonuses = Array.isArray(s.bonuses)
      ? [...s.bonuses]
          .filter((b) => b?.isActive !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
          .map((b) => ({
            _id: String(b._id),
            title: {
              bn: b?.title?.bn || "",
              en: b?.title?.en || "",
            },
            bonusType: b?.bonusType || "fixed",
            bonusValue: Number(b?.bonusValue || 0),
            turnoverMultiplier: Number(b?.turnoverMultiplier || 1),
          }))
      : [];

    return res.json({
      success: true,
      data: {
        enabled,
        minAmount: Number(s.minAmount || 5),
        maxAmount: Number(s.maxAmount || 0),
        supportNumber: s.supportNumber || "",
        methods,
        bonuses,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/* ----------------------------- CLIENT: CREATE PAYMENT ----------------------------- */

router.post("/create", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

    if (!s.active || !s.apiKey) {
      return res.status(400).json({
        success: false,
        message: "Auto Personal Deposit is disabled by admin.",
      });
    }

    const {
      amount,
      userIdentity,
      invoiceNumber,
      method,
      selectedBonusId = "",
    } = req.body || {};

    const numAmount = normalizeMoney(amount, 0);
    const methodId = safeString(method).toLowerCase();

    if (!userIdentity) {
      return res.status(400).json({
        success: false,
        message: "userIdentity required",
      });
    }

    if (!invoiceNumber) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber required",
      });
    }

    if (!VALID_METHODS.includes(methodId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!numAmount || numAmount < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const minAmount = Number(s.minAmount || 5);
    const maxAmount = Number(s.maxAmount || 0);

    if (numAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount is ${minAmount}`,
      });
    }

    if (maxAmount > 0 && numAmount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum amount is ${maxAmount}`,
      });
    }

    const activeMethods = Array.isArray(s.methods)
      ? s.methods
          .filter((m) => m?.isActive !== false)
          .map((m) => String(m.methodId || "").toLowerCase())
      : [];

    if (!activeMethods.includes(methodId)) {
      return res.status(400).json({
        success: false,
        message: "Selected method is inactive",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(String(userIdentity))) {
      return res.status(400).json({
        success: false,
        message: "Invalid userIdentity",
      });
    }

    const user = await User.findById(userIdentity).select(
      "_id userId phone role isActive referredBy depositCommission depositCommissionBalance",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    let selectedBonusDoc = null;

    if (
      selectedBonusId &&
      mongoose.Types.ObjectId.isValid(String(selectedBonusId))
    ) {
      const foundBonus = s.bonuses.id(String(selectedBonusId));

      if (!foundBonus || foundBonus.isActive !== true) {
        return res.status(400).json({
          success: false,
          message: "Selected bonus is invalid or inactive",
        });
      }

      selectedBonusDoc = foundBonus;
    }

    const calc = computeSelectedBonusAmount({
      amount: numAmount,
      selectedBonus: selectedBonusDoc,
    });

    const trackingIdentity = buildPersonalIdentity({
      userIdentity: String(userIdentity),
      selectedBonusId: calc.selectedBonus.bonusId || "",
      invoiceNumber: String(invoiceNumber),
    });

    const duplicate = await AutoPersonalDeposit.findOne({
      invoiceNumber: trackingIdentity,
    }).lean();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber already exists. Try again.",
      });
    }

    const generateUrl = "https://api.oraclepay.org/api/external/generate";

    const { data } = await axios.get(generateUrl, {
      headers: {
        "X-API-Key": String(s.apiKey || "").trim(),
      },
      params: {
        methods: methodId,
        amount: numAmount,
        userIdentifyAddress: trackingIdentity,
      },
      timeout: 20000,
    });

    if (!data?.success || !data?.payment_page_url) {
      return res.status(400).json({
        success: false,
        message: "Failed to create payment link",
        data: data || null,
      });
    }

    return res.json({
      success: true,
      payment_page_url: data.payment_page_url,
      amount: data.amount || numAmount,
      methods: data.methods || [methodId],
      expiresAt: data.expiresAt || null,
      expiresInSeconds: data.expiresInSeconds || 1200,
      invoiceNumber: trackingIdentity,
      rawInvoiceNumber: String(invoiceNumber),
      selectedBonus: calc.selectedBonus,
      calc: {
        depositAmount: Number(calc.depositAmount || 0),
        bonusAmount: Number(calc.bonusAmount || 0),
        creditedAmount: Number(calc.creditedAmount || 0),
        turnoverMultiplier: Number(calc.turnoverMultiplier || 1),
        targetTurnover: Number(calc.targetTurnover || 0),
      },
    });
  } catch (err) {
    return res.status(err?.response?.status || 500).json({
      success: false,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.reason ||
        err?.message ||
        "Create payment failed",
      data: err?.response?.data || null,
    });
  }
});

/* ----------------------------- ADMIN HISTORY ----------------------------- */

router.get("/deposits/admin", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const q = safeString(req.query.q);
    const status = safeString(req.query.status).toUpperCase();
    const method = safeString(req.query.method).toLowerCase();

    const matchStage = {};

    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      matchStage.status = status;
    }

    if (VALID_METHODS.includes(method)) {
      matchStage.method = method;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: "$userIdentity",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userObjectId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      ...(q
        ? [
            {
              $match: {
                $or: [
                  { "user.userId": { $regex: q, $options: "i" } },
                  { "user.phone": { $regex: q, $options: "i" } },
                  { invoiceNumber: { $regex: q, $options: "i" } },
                  { trxid: { $regex: q, $options: "i" } },
                  { from: { $regex: q, $options: "i" } },
                  { method: { $regex: q, $options: "i" } },
                  { "selectedBonus.title.bn": { $regex: q, $options: "i" } },
                  { "selectedBonus.title.en": { $regex: q, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                userIdentity: 1,
                amount: 1,
                invoiceNumber: 1,
                status: 1,
                method: 1,
                paymentPageUrl: 1,
                token: 1,
                expiresAt: 1,
                from: 1,
                trxid: 1,
                deviceName: 1,
                deviceId: 1,
                bdTimeZone: 1,
                checkoutItems: 1,
                webhookPayload: 1,
                paidAt: 1,
                createdAt: 1,
                updatedAt: 1,
                balanceAdded: 1,
                selectedBonus: 1,
                calc: 1,
                userMongoId: "$userObjectId",
                userDbUserId: { $ifNull: ["$user.userId", "Unknown"] },
                userPhone: { $ifNull: ["$user.phone", ""] },
                userRole: { $ifNull: ["$user.role", "user"] },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await AutoPersonalDeposit.aggregate(pipeline);
    const data = result?.[0]?.data || [];
    const total = result?.[0]?.total?.[0]?.count || 0;

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
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/* ----------------------------- USER HISTORY BY USER ID ----------------------------- */

router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await AutoPersonalDeposit.find({
      userIdentity: String(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/* ----------------------------- USER HISTORY PAGINATED ----------------------------- */
/**
 * query:
 * userIdentity, page, limit, status, method, from, to, search
 */

router.get("/history", async (req, res) => {
  try {
    const userIdentity = safeString(req.query.userIdentity);

    if (!userIdentity) {
      return res.status(400).json({
        success: false,
        message: "userIdentity required",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    const status = safeString(req.query.status).toUpperCase();
    const method = safeString(req.query.method).toLowerCase();
    const search = safeString(req.query.search);
    const from = safeString(req.query.from);
    const to = safeString(req.query.to);

    const query = { userIdentity };

    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      query.status = status;
    }

    if (VALID_METHODS.includes(method)) {
      query.method = method;
    }

    if (from || to) {
      query.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) query.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          query.createdAt.$lte = toDate;
        }
      }
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { trxid: { $regex: search, $options: "i" } },
        { from: { $regex: search, $options: "i" } },
        { method: { $regex: search, $options: "i" } },
        { deviceName: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      AutoPersonalDeposit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AutoPersonalDeposit.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/* ----------------------------- WEBHOOK ----------------------------- */

router.post("/webhook", async (req, res) => {
  res.send("OK");

  try {
    const data = req.body || {};

    const success = data.success === true || String(data.success) === "true";

    if (!success) {
      return console.log("auto-personal webhook ignored: success false");
    }

    const parsedIdentity = parsePersonalIdentity(data.userIdentifyAddress);

    const invoiceNumber = parsedIdentity.raw;
    const rawInvoiceNumber = parsedIdentity.invoiceNumber;
    const userId = parsedIdentity.userId;
    const selectedBonusIdFromIdentity = parsedIdentity.selectedBonusId;

    const amount = normalizeMoney(data.amount, 0);
    const method = safeString(data.method).toLowerCase();
    const trxid = safeString(data.trxid);

    if (!invoiceNumber) return console.log("userIdentifyAddress missing");
    if (!userId) return console.log("userId missing from userIdentifyAddress");

    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      return console.log("invalid user id from userIdentifyAddress");
    }

    if (!amount || amount <= 0) return console.log("invalid amount");

    const userExists = await User.exists({ _id: userId, isActive: true });
    if (!userExists) return console.log("user not found or inactive");

    let dep = await AutoPersonalDeposit.findOne({ invoiceNumber });

    if (!dep && trxid) {
      const trxDuplicate = await AutoPersonalDeposit.findOne({
        trxid,
        balanceAdded: true,
      }).lean();

      if (trxDuplicate) {
        return console.log("auto-personal webhook ignored: duplicate trxid");
      }
    }

    if (dep?.balanceAdded === true) {
      return console.log("auto-personal webhook ignored: already processed");
    }

    const settings = await AutoPersonalDepositSetting.findOne();

    const selectedBonusId = safeString(
      selectedBonusIdFromIdentity ||
        dep?.selectedBonus?.bonusId ||
        dep?.checkoutItems?.selectedBonusId ||
        dep?.checkoutItems?.selectedBonusID,
    );

    let selectedBonusDoc = null;

    if (
      settings &&
      selectedBonusId &&
      mongoose.Types.ObjectId.isValid(selectedBonusId)
    ) {
      const foundBonus = settings.bonuses.id(selectedBonusId);

      if (foundBonus && foundBonus.isActive !== false) {
        selectedBonusDoc = foundBonus;
      }
    }

    const calc = computeSelectedBonusAmount({
      amount,
      selectedBonus: selectedBonusDoc,
    });

    const prevAffiliateInfo =
      dep?.calc?.affiliateDepositCommission &&
      typeof dep.calc.affiliateDepositCommission === "object"
        ? {
            affiliatorId: String(
              dep.calc.affiliateDepositCommission.affiliatorId || "",
            ),
            affiliatorUserId: String(
              dep.calc.affiliateDepositCommission.affiliatorUserId || "",
            ),
            percent: Number(dep.calc.affiliateDepositCommission.percent || 0),
            baseAmount: Number(
              dep.calc.affiliateDepositCommission.baseAmount || 0,
            ),
            commissionAmount: Number(
              dep.calc.affiliateDepositCommission.commissionAmount || 0,
            ),
          }
        : getDefaultAffiliateCommissionInfo();

    if (!dep) {
      dep = await AutoPersonalDeposit.create({
        userIdentity: String(userId),
        amount,
        invoiceNumber,
        status: "PAID",
        method: VALID_METHODS.includes(method) ? method : "",
        from: safeString(data.from),
        trxid,
        token: safeString(data.token),
        deviceName: safeString(data.deviceName),
        deviceId: safeString(data.deviceId),
        bdTimeZone: safeString(data.bdTimeZone),
        webhookPayload: data,
        paidAt: new Date(),
        balanceAdded: false,
        checkoutItems: {
          rawInvoiceNumber,
          selectedBonusId,
          method,
        },
        selectedBonus: calc.selectedBonus,
        calc: {
          depositAmount: Number(calc.depositAmount || 0),
          bonusAmount: Number(calc.bonusAmount || 0),
          creditedAmount: Number(calc.creditedAmount || 0),
          turnoverMultiplier: Number(calc.turnoverMultiplier || 1),
          targetTurnover: Number(calc.targetTurnover || 0),
          affiliateDepositCommission: prevAffiliateInfo,
        },
      });
    } else {
      dep.userIdentity = String(userId);
      dep.status = "PAID";
      dep.amount = amount;
      dep.method = VALID_METHODS.includes(method) ? method : dep.method || "";
      dep.from = safeString(data.from) || dep.from || "";
      dep.trxid = trxid || dep.trxid || "";
      dep.token = safeString(data.token) || dep.token || "";
      dep.deviceName = safeString(data.deviceName) || dep.deviceName || "";
      dep.deviceId = safeString(data.deviceId) || dep.deviceId || "";
      dep.bdTimeZone = safeString(data.bdTimeZone) || dep.bdTimeZone || "";
      dep.webhookPayload = data;
      dep.paidAt = new Date();
      dep.checkoutItems = {
        ...(dep.checkoutItems || {}),
        rawInvoiceNumber,
        selectedBonusId,
        method,
      };
      dep.selectedBonus = calc.selectedBonus;
      dep.calc = {
        depositAmount: Number(calc.depositAmount || 0),
        bonusAmount: Number(calc.bonusAmount || 0),
        creditedAmount: Number(calc.creditedAmount || 0),
        turnoverMultiplier: Number(calc.turnoverMultiplier || 1),
        targetTurnover: Number(calc.targetTurnover || 0),
        affiliateDepositCommission: prevAffiliateInfo,
      };

      await dep.save();
    }

    const finalDep = await addBalanceCommissionAndTurnover({
      userId: String(userId),
      dep,
    });

    console.log("✅ auto-personal webhook processed:", {
      invoiceNumber,
      rawInvoiceNumber,
      userId,
      bonusId: finalDep?.selectedBonus?.bonusId || "",
      amount,
      method: finalDep.method,
      trxid: finalDep.trxid,
      bonusAmount: finalDep?.calc?.bonusAmount || 0,
      creditedAmount: finalDep?.calc?.creditedAmount || 0,
      targetTurnover: finalDep?.calc?.targetTurnover || 0,
      affiliateCommission:
        finalDep?.calc?.affiliateDepositCommission?.commissionAmount || 0,
    });
  } catch (err) {
    console.error("auto-personal webhook error:", err?.message || err);
  }
});

export default router;
