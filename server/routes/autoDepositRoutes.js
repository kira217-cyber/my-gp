import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import AutoDepositToken from "../models/AutoDepositToken.js";
import AutoDeposit from "../models/AutoDeposit.js";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";

const router = express.Router();

/* -------------------------------- HELPERS ------------------------------- */

async function getOrCreateSetting() {
  let s = await AutoDepositToken.findOne();

  if (!s) {
    s = new AutoDepositToken({
      businessToken: "",
      active: false,
      minAmount: 5,
      maxAmount: 500000,
      bonuses: [],
    });
    await s.save();
  }

  return s;
}

function normalizeMoney(val, fallback = 0) {
  const n = Math.floor(Number(val || 0));
  if (!Number.isFinite(n)) return fallback;
  return n;
}

function safeString(val = "") {
  return String(val || "").trim();
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

function buildPublicUrls(req) {
  const backend =
    process.env.PUBLIC_BACKEND_URL;
  const frontend = process.env.PUBLIC_FRONTEND_URL;

  return { backend, frontend };
}

/* ----------------------------- ADMIN: GET ----------------------------- */

router.get("/admin", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

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
            isActive: !!b?.isActive,
            order: Number(b?.order || 0),
          }))
      : [];

    return res.json({
      success: true,
      data: {
        businessToken: s.businessToken || "",
        active: !!s.active,
        minAmount: Number(s.minAmount || 5),
        maxAmount: Number(s.maxAmount || 0),
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

/* ----------------------------- ADMIN: UPDATE ----------------------------- */

router.put("/admin", async (req, res) => {
  try {
    const { businessToken, active, minAmount, maxAmount, bonuses } = req.body;

    const s = await getOrCreateSetting();

    if (typeof businessToken === "string") {
      s.businessToken = businessToken.trim();
    }

    if (typeof active === "boolean") {
      s.active = active;
    }

    const min = normalizeMoney(minAmount, 5);
    const max = normalizeMoney(maxAmount, 0);

    s.minAmount = Math.max(1, min);
    s.maxAmount = Math.max(0, max);

    if (s.maxAmount > 0 && s.minAmount > s.maxAmount) {
      return res.status(400).json({
        success: false,
        message: "minAmount cannot be greater than maxAmount",
      });
    }

    if (Array.isArray(bonuses)) {
      const sanitizedBonuses = bonuses
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
            String(item?.bonusType || "fixed").toLowerCase() === "percent"
              ? "percent"
              : "fixed",
          bonusValue: Math.max(0, Number(item?.bonusValue || 0)),
          turnoverMultiplier: Math.max(
            0,
            Number(item?.turnoverMultiplier || 0),
          ),
          isActive: item?.isActive !== false,
          order: Math.max(0, normalizeMoney(item?.order, index)),
        }))
        .filter(
          (item) =>
            item.title.bn &&
            item.title.en &&
            Number.isFinite(item.bonusValue) &&
            item.bonusValue >= 0 &&
            Number.isFinite(item.turnoverMultiplier) &&
            item.turnoverMultiplier >= 0,
        );

      s.bonuses = sanitizedBonuses;
    }

    await s.save();

    return res.json({
      success: true,
      message: "Auto deposit settings updated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err?.message || "Update failed",
    });
  }
});

/* ----------------------------- CLIENT STATUS ----------------------------- */

router.get("/status", async (req, res) => {
  try {
    const s = await getOrCreateSetting();
    const enabled = !!(s.active && s.businessToken);

    const bonuses = Array.isArray(s.bonuses)
      ? [...s.bonuses]
          .filter((b) => b?.isActive)
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

/* ----------------------------- CREATE PAYMENT ----------------------------- */

router.post("/create", async (req, res) => {
  try {
    const s = await getOrCreateSetting();

    if (!s.active || !s.businessToken) {
      return res.status(400).json({
        success: false,
        message: "Auto Deposit is disabled by admin.",
      });
    }

    const {
      amount,
      userIdentity,
      invoiceNumber,
      checkoutItems,
      selectedBonusId = "",
    } = req.body || {};

    const numAmount = normalizeMoney(amount, 0);

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

    const { backend, frontend } = buildPublicUrls(req);

    const callbackUrl = `${backend}/api/auto-deposit/webhook`;
    const successRedirectUrl = `${frontend}`;

    const opayRes = await axios.post(
      "https://api.oraclepay.org/api/opay-business/generate-payment-page",
      {
        payment_amount: numAmount,
        user_identity_address: String(userIdentity),
        callback_url: callbackUrl,
        success_redirect_url: successRedirectUrl,
        checkout_items: {
          ...(checkoutItems || {}),
          selectedBonusId: calc.selectedBonus.bonusId || "",
          selectedBonusType: calc.selectedBonus.bonusType || "",
          selectedBonusTitleBn: calc.selectedBonus.title.bn || "",
          selectedBonusTitleEn: calc.selectedBonus.title.en || "",
        },
        invoice_number: String(invoiceNumber),
      },
      {
        headers: {
          "X-Opay-Business-Token": String(s.businessToken || "").trim(),
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    if (!opayRes?.data?.success || !opayRes?.data?.payment_page_url) {
      await AutoDeposit.updateOne(
        { invoiceNumber: String(invoiceNumber) },
        { $set: { status: "FAILED" } },
      );

      return res.status(400).json({
        success: false,
        message: "Failed to create payment link",
        data: opayRes?.data || null,
      });
    }

    return res.json({
      success: true,
      payment_page_url: opayRes.data.payment_page_url,
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "invoiceNumber already exists. Try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: err?.response?.data?.message || err?.message || "Create payment failed",
    });
  }
});

/* ----------------------------- USER HISTORY ----------------------------- */

router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await AutoDeposit.find({ userIdentity: String(userId) })
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

    const matchStage = {};

    if (["PENDING", "PAID", "FAILED"].includes(status)) {
      matchStage.status = status;
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
                  { transactionId: { $regex: q, $options: "i" } },
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
                checkoutItems: 1,
                transactionId: 1,
                sessionCode: 1,
                bank: 1,
                footprint: 1,
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

    const result = await AutoDeposit.aggregate(pipeline);
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

/* ----------------------------- WEBHOOK ----------------------------- */

router.post("/webhook", async (req, res) => {
  res.send("OK");

  try {
    const data = req.body || {};

    const invoiceNumber = safeString(data.invoice_number);
    const userId = safeString(data.user_identity);
    const statusRaw = safeString(data.status).toUpperCase();
    const amount = normalizeMoney(data.amount, 0);

    if (!invoiceNumber) return console.log("invoice_number missing");
    if (!userId) return console.log("user_identity missing");
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return console.log("invalid user id");
    }
    if (!amount || amount <= 0) return console.log("invalid amount");

    const isCompleted = statusRaw === "COMPLETED";

    let dep = await AutoDeposit.findOne({ invoiceNumber });

    if (!dep) {
      dep = await AutoDeposit.create({
        userIdentity: userId,
        amount,
        invoiceNumber,
        status: isCompleted ? "PAID" : "PENDING",
        transactionId: safeString(data.transaction_id),
        sessionCode: safeString(data.session_code),
        bank: safeString(data.bank),
        footprint: safeString(data.footprint),
        checkoutItems: data.checkout_items || {},
        paidAt: isCompleted ? new Date() : null,
        balanceAdded: false,
        selectedBonus: getDefaultSelectedBonus(),
        calc: {
          depositAmount: amount,
          bonusAmount: 0,
          creditedAmount: amount,
          turnoverMultiplier: 1,
          targetTurnover: amount,
          affiliateDepositCommission: getDefaultAffiliateCommissionInfo(),
        },
      });
    } else {
      dep.transactionId = safeString(data.transaction_id) || dep.transactionId || "";
      dep.sessionCode = safeString(data.session_code) || dep.sessionCode || "";
      dep.bank = safeString(data.bank) || dep.bank || "";
      dep.footprint = safeString(data.footprint) || dep.footprint || "";
      dep.checkoutItems = data.checkout_items || dep.checkoutItems || {};
      dep.status = isCompleted ? "PAID" : "PENDING";
      dep.paidAt = isCompleted ? new Date() : dep.paidAt;
    }

    const settings = await AutoDepositToken.findOne();

    const incomingCheckoutItems = data.checkout_items || dep.checkoutItems || {};
    const selectedBonusId = safeString(
      incomingCheckoutItems.selectedBonusId ||
        incomingCheckoutItems.selectedBonusID ||
        dep?.selectedBonus?.bonusId,
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

    dep.amount = amount;
    dep.checkoutItems = incomingCheckoutItems;
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

    if (!isCompleted) return;
    if (dep.balanceAdded === true) return;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.isActive === false) throw new Error("User is inactive");

    const creditedAmount = Number(dep?.calc?.creditedAmount || dep.amount || 0);
    const targetTurnover = Number(dep?.calc?.targetTurnover || dep.amount || 0);

    user.balance = Number(user.balance || 0) + creditedAmount;
    await user.save();

    let affiliateCommissionInfo = getDefaultAffiliateCommissionInfo();

    if (user.referredBy) {
      const affiliator = await User.findById(user.referredBy);

      if (
        affiliator &&
        affiliator.role === "aff-user" &&
        affiliator.isActive
      ) {
        const pct = Number(affiliator.depositCommission || 0);

        if (Number.isFinite(pct) && pct > 0) {
          const commissionBase = Number(dep.amount || 0);
          const commissionAmount = (commissionBase * pct) / 100;

          if (commissionAmount > 0) {
            affiliator.depositCommissionBalance =
              Number(affiliator.depositCommissionBalance || 0) +
              commissionAmount;

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

    dep.balanceAdded = true;
    dep.calc = {
      depositAmount: Number(dep?.calc?.depositAmount || dep.amount || 0),
      bonusAmount: Number(dep?.calc?.bonusAmount || 0),
      creditedAmount: Number(dep?.calc?.creditedAmount || dep.amount || 0),
      turnoverMultiplier: Number(dep?.calc?.turnoverMultiplier || 1),
      targetTurnover: Number(dep?.calc?.targetTurnover || dep.amount || 0),
      affiliateDepositCommission: affiliateCommissionInfo,
    };

    await dep.save();

    const existingTurnover = await TurnOver.findOne({
      user: user._id,
      sourceType: "auto-deposit",
      sourceId: dep._id,
    });

    if (!existingTurnover) {
      await TurnOver.create({
        user: user._id,
        sourceType: "auto-deposit",
        sourceId: dep._id,
        required: targetTurnover,
        progress: 0,
        status: targetTurnover <= 0 ? "completed" : "running",
        creditedAmount,
        completedAt: targetTurnover <= 0 ? new Date() : null,
      });
    }

    console.log("✅ webhook processed:", {
      invoiceNumber,
      bonusId: dep?.selectedBonus?.bonusId || "",
      bonusAmount: dep?.calc?.bonusAmount || 0,
      creditedAmount: dep?.calc?.creditedAmount || 0,
      targetTurnover: dep?.calc?.targetTurnover || 0,
    });
  } catch (err) {
    console.error("auto-deposit webhook error:", err?.message || err);
  }
});

export default router;