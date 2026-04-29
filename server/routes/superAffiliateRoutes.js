import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protectAdmin } from "./adminRoutes.js";

const router = express.Router();

const normalizeCountryCode = (value = "") => {
  const cleaned = String(value).trim();
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned.replace(/\D/g, "")}`;
};

const normalizePhone = (value = "") => {
  return String(value).replace(/\D/g, "").trim();
};

const validateCountryCode = (value = "") => /^\+\d{1,5}$/.test(value);
const validatePhone = (value = "") => /^\d{6,15}$/.test(value);
const validateEmail = (value = "") =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

const formatDateLabel = (dateString) => {
  const d = new Date(dateString);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/* =========================
   Protect Super Affiliate
========================= */
const protectSuperAffiliate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.role !== "super-aff-user") {
      return res.status(401).json({
        success: false,
        message: "Super affiliate not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================
   Super Affiliate Profile
========================= */
router.get("/profile", protectSuperAffiliate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/* =========================
   GET /api/super-affiliate/me/balance
========================= */
router.get("/me/balance", protectSuperAffiliate, async (req, res) => {
  try {
    return res.json({
      success: true,
      balance: Number(req.user?.balance || 0),
      currency: req.user?.currency || "BDT",
      userId: req.user?.userId || "",
      phone: req.user?.phone || "",
      role: req.user?.role || "super-aff-user",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load balance",
      error: error.message,
    });
  }
});

/* =========================
   Super Affiliate My Affiliate Users
========================= */
router.get("/my-users", protectSuperAffiliate, async (req, res) => {
  try {
    const superAffiliate = req.user;

    const users = await User.find({
      referredBy: superAffiliate._id,
      role: "aff-user",
    })
      .select(
        "_id userId email countryCode phone firstName lastName balance currency referralCode role isActive createdAt updatedAt referCommission referCommissionBalance depositCommission depositCommissionBalance gameLossCommission gameLossCommissionBalance gameWinCommission gameWinCommissionBalance",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load master users",
      error: error.message,
    });
  }
});

/* =========================
   Super Affiliate Profile Update
========================= */
router.put("/profile", protectSuperAffiliate, async (req, res) => {
  try {
    const superAffiliate = await User.findOne({
      _id: req.user._id,
      role: "super-aff-user",
    });

    if (!superAffiliate) {
      return res.status(404).json({
        success: false,
        message: "Super affiliate user not found",
      });
    }

    const {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      password,
      currency,
    } = req.body || {};

    const safeFirstName = String(firstName || "").trim();
    const safeLastName = String(lastName || "").trim();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedCountryCode = normalizeCountryCode(countryCode || "");
    const normalizedPhone = normalizePhone(phone || "");
    const normalizedCurrency = String(currency || "BDT")
      .trim()
      .toUpperCase();

    if (!safeFirstName) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    if (!safeLastName) {
      return res.status(400).json({
        success: false,
        message: "Last name is required",
      });
    }

    if (!normalizedCountryCode || !validateCountryCode(normalizedCountryCode)) {
      return res.status(400).json({
        success: false,
        message: "Valid country code is required",
      });
    }

    if (!normalizedPhone || !validatePhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number is required",
      });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!["BDT", "USDT"].includes(normalizedCurrency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid currency",
      });
    }

    const existingPhone = await User.findOne({
      countryCode: normalizedCountryCode,
      phone: normalizedPhone,
      _id: { $ne: superAffiliate._id },
    }).select("_id");

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    if (normalizedEmail) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: superAffiliate._id },
      }).select("_id");

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    superAffiliate.firstName = safeFirstName;
    superAffiliate.lastName = safeLastName;
    superAffiliate.email = normalizedEmail;
    superAffiliate.countryCode = normalizedCountryCode;
    superAffiliate.phone = normalizedPhone;
    superAffiliate.currency = normalizedCurrency;

    if (String(password || "").trim()) {
      if (String(password).trim().length < 4) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 4 characters",
        });
      }

      superAffiliate.password = await bcrypt.hash(String(password).trim(), 10);
    }

    await superAffiliate.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: superAffiliate._id,
        userId: superAffiliate.userId,
        firstName: superAffiliate.firstName,
        lastName: superAffiliate.lastName,
        countryCode: superAffiliate.countryCode,
        phone: superAffiliate.phone,
        email: superAffiliate.email,
        role: superAffiliate.role,
        isActive: superAffiliate.isActive,
        referralCode: superAffiliate.referralCode,
        currency: superAffiliate.currency,
        balance: superAffiliate.balance,
        referralCount: superAffiliate.referralCount,
        commissionBalance: superAffiliate.commissionBalance,
        referCommission: superAffiliate.referCommission,
        referCommissionBalance: superAffiliate.referCommissionBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

/* =========================
   Toggle + Commission Update Aff User Under Super Affiliate
========================= */
router.patch(
  "/my-users/:id/toggle-status",
  protectSuperAffiliate,
  async (req, res) => {
    try {
      const superAffiliate = req.user;

      const {
        isActive,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
      } = req.body || {};

      const targetUser = await User.findOne({
        _id: req.params.id,
        referredBy: superAffiliate._id,
        role: "aff-user",
      });

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Master user not found under your referrals",
        });
      }

      targetUser.isActive = !!isActive;

      if (targetUser.isActive) {
        targetUser.gameLossCommission = Number(gameLossCommission) || 0;
        targetUser.depositCommission = Number(depositCommission) || 0;
        targetUser.referCommission = Number(referCommission) || 0;
        targetUser.gameWinCommission = Number(gameWinCommission) || 0;
      }

      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: `Master user ${
          targetUser.isActive ? "activated" : "deactivated"
        } successfully`,
        user: {
          _id: targetUser._id,
          userId: targetUser.userId,
          isActive: targetUser.isActive,
          gameLossCommission: targetUser.gameLossCommission,
          depositCommission: targetUser.depositCommission,
          referCommission: targetUser.referCommission,
          gameWinCommission: targetUser.gameWinCommission,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update master user status",
        error: error.message,
      });
    }
  },
);

/* =========================
   Super Affiliate Commission Status
========================= */
router.get("/commission-status", protectSuperAffiliate, async (req, res) => {
  try {
    const superAffiliate = req.user;

    return res.status(200).json({
      success: true,
      data: {
        currency: superAffiliate.currency || "BDT",
        mainBalance: Number(superAffiliate.commissionBalance || 0),

        gameLossCommission: Number(superAffiliate.gameLossCommission || 0),
        gameWinCommission: Number(superAffiliate.gameWinCommission || 0),
        referCommission: Number(superAffiliate.referCommission || 0),
        depositCommission: Number(superAffiliate.depositCommission || 0),

        gameWinCommissionBalance: Number(
          superAffiliate.gameWinCommissionBalance || 0,
        ),
        referCommissionBalance: Number(
          superAffiliate.referCommissionBalance || 0,
        ),
        depositCommissionBalance: Number(
          superAffiliate.depositCommissionBalance || 0,
        ),
        gameLossCommissionBalance: Number(
          superAffiliate.gameLossCommissionBalance || 0,
        ),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load commission status",
      error: error.message,
    });
  }
});

/* =========================
   GET /api/super-affiliate/dashboard/me
========================= */
router.get("/dashboard/me", protectSuperAffiliate, async (req, res) => {
  try {
    const superAffiliate = req.user;

    const totalReferrals = await User.countDocuments({
      referredBy: superAffiliate._id,
      role: "aff-user",
    });

    const activeReferrals = await User.countDocuments({
      referredBy: superAffiliate._id,
      role: "aff-user",
      isActive: true,
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthNewReferrals = await User.countDocuments({
      referredBy: superAffiliate._id,
      role: "aff-user",
      createdAt: { $gte: startOfMonth },
    });

    const recentReferrals = await User.find({
      referredBy: superAffiliate._id,
      role: "aff-user",
    })
      .select(
        "userId firstName lastName phone countryCode balance currency referralCode isActive createdAt",
      )
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const referCommissionPerUser = Number(superAffiliate.referCommission || 0);
    const thisMonthEarnings = thisMonthNewReferrals * referCommissionPerUser;

    const referCommissionBalance = Number(
      superAffiliate.referCommissionBalance || 0,
    );
    const depositCommissionBalance = Number(
      superAffiliate.depositCommissionBalance || 0,
    );
    const gameLossCommissionBalance = Number(
      superAffiliate.gameLossCommissionBalance || 0,
    );
    const gameWinCommissionBalance = Number(
      superAffiliate.gameWinCommissionBalance || 0,
    );

    const totalCommissionEarned =
      referCommissionBalance +
      depositCommissionBalance +
      gameLossCommissionBalance +
      gameWinCommissionBalance;

    return res.status(200).json({
      success: true,
      data: {
        affiliate: {
          _id: superAffiliate._id,
          userId: superAffiliate.userId,
          firstName: superAffiliate.firstName || "",
          lastName: superAffiliate.lastName || "",
          fullName: `${superAffiliate.firstName || ""} ${
            superAffiliate.lastName || ""
          }`.trim(),
          email: superAffiliate.email || "",
          phone: superAffiliate.phone || "",
          countryCode: superAffiliate.countryCode || "",
          referralCode: superAffiliate.referralCode || "",
          currency: superAffiliate.currency || "BDT",
          role: superAffiliate.role,
          isActive: !!superAffiliate.isActive,

          balance: Number(superAffiliate.balance || 0),
          commissionBalance: Number(superAffiliate.commissionBalance || 0),

          referCommission: Number(superAffiliate.referCommission || 0),
          gameLossCommission: Number(superAffiliate.gameLossCommission || 0),
          depositCommission: Number(superAffiliate.depositCommission || 0),
          gameWinCommission: Number(superAffiliate.gameWinCommission || 0),

          referCommissionBalance,
          depositCommissionBalance,
          gameLossCommissionBalance,
          gameWinCommissionBalance,
        },

        stats: {
          totalReferrals,
          activeReferrals,
          thisMonthNewReferrals,

          referCommissionBalance,
          depositCommissionBalance,
          gameLossCommissionBalance,
          gameWinCommissionBalance,

          totalCommissionEarned,
          thisMonthEarnings,
        },

        recentReferrals,
      },
    });
  } catch (error) {
    console.error("SUPER AFFILIATE DASHBOARD ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load super affiliate dashboard",
      error: error.message,
    });
  }
});

/* =========================
   GET /api/super-affiliate/dashboard/earnings?days=30
========================= */
router.get("/dashboard/earnings", protectSuperAffiliate, async (req, res) => {
  try {
    const superAffiliate = req.user;

    let days = Number(req.query.days || 30);
    if (![7, 14, 30, 60].includes(days)) {
      days = 30;
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const referrals = await User.find({
      referredBy: superAffiliate._id,
      role: "aff-user",
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select("createdAt")
      .lean();

    const referCommissionPerUser = Number(superAffiliate.referCommission || 0);

    const dateMap = new Map();

    for (let i = 0; i < days; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, 0);
    }

    for (const user of referrals) {
      const key = new Date(user.createdAt).toISOString().slice(0, 10);

      if (dateMap.has(key)) {
        const currentValue = Number(dateMap.get(key) || 0);
        dateMap.set(key, currentValue + referCommissionPerUser);
      }
    }

    const labels = [];
    const dailyEarnings = [];
    const cumulativeEarnings = [];

    let runningTotal = 0;

    for (const [key, value] of dateMap.entries()) {
      labels.push(formatDateLabel(key));
      dailyEarnings.push(value);

      runningTotal += value;
      cumulativeEarnings.push(runningTotal);
    }

    return res.status(200).json({
      success: true,
      data: {
        days,
        labels,
        dailyEarnings,
        cumulativeEarnings,
      },
    });
  } catch (error) {
    console.error("SUPER AFFILIATE EARNINGS CHART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load earnings chart",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Get all super affiliate users
========================= */
router.get("/admin/super-affiliate-users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "super-aff-user" })
      .select(
        "_id userId email countryCode phone firstName lastName balance referralCode role isActive createdAt updatedAt gameLossCommission depositCommission referCommission gameWinCommission gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance referralCount",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load super affiliate users",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Get single super affiliate user details
========================= */
router.get(
  "/admin/super-affiliate-users/:id",
  protectAdmin,
  async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.id,
        role: "super-aff-user",
      })
        .populate("createdUsers", "userId phone countryCode role isActive")
        .select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Super affiliate user not found",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load super affiliate user details",
        error: error.message,
      });
    }
  },
);

/* =========================
   Admin - Update super affiliate user
========================= */
router.patch(
  "/admin/super-affiliate-users/:id",
  protectAdmin,
  async (req, res) => {
    try {
      const {
        userId,
        email,
        countryCode,
        phone,
        firstName,
        lastName,
        password,
        isActive,
        currency,
        balance,
        commissionBalance,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
        gameLossCommissionBalance,
        depositCommissionBalance,
        referCommissionBalance,
        gameWinCommissionBalance,
      } = req.body || {};

      const user = await User.findOne({
        _id: req.params.id,
        role: "super-aff-user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Super affiliate user not found",
        });
      }

      const normalizedUserId = String(userId || "").trim();
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();
      const normalizedCountryCode = normalizeCountryCode(countryCode || "");
      const normalizedPhone = normalizePhone(phone || "");

      if (!normalizedUserId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      if (
        !normalizedCountryCode ||
        !validateCountryCode(normalizedCountryCode)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid country code is required",
        });
      }

      if (!normalizedPhone || !validatePhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Valid phone is required",
        });
      }

      const existingUserId = await User.findOne({
        userId: normalizedUserId,
        _id: { $ne: user._id },
      }).select("_id");

      if (existingUserId) {
        return res.status(409).json({
          success: false,
          message: "User ID already exists",
        });
      }

      const existingPhone = await User.findOne({
        countryCode: normalizedCountryCode,
        phone: normalizedPhone,
        _id: { $ne: user._id },
      }).select("_id");

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone already exists",
        });
      }

      if (normalizedEmail) {
        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: user._id },
        }).select("_id");

        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      user.userId = normalizedUserId;
      user.email = normalizedEmail;
      user.countryCode = normalizedCountryCode;
      user.phone = normalizedPhone;
      user.firstName = String(firstName || "").trim();
      user.lastName = String(lastName || "").trim();
      user.isActive = !!isActive;
      user.currency = currency || "BDT";
      user.balance = Number(balance) || 0;
      user.commissionBalance = Number(commissionBalance) || 0;
      user.gameLossCommission = Number(gameLossCommission) || 0;
      user.depositCommission = Number(depositCommission) || 0;
      user.referCommission = Number(referCommission) || 0;
      user.gameWinCommission = Number(gameWinCommission) || 0;
      user.gameLossCommissionBalance = Number(gameLossCommissionBalance) || 0;
      user.depositCommissionBalance = Number(depositCommissionBalance) || 0;
      user.referCommissionBalance = Number(referCommissionBalance) || 0;
      user.gameWinCommissionBalance = Number(gameWinCommissionBalance) || 0;

      if (String(password || "").trim()) {
        if (String(password).trim().length < 4) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 4 characters",
          });
        }

        user.password = await bcrypt.hash(String(password).trim(), 10);
      }

      await user.save();

      return res.json({
        success: true,
        message: "Super affiliate user updated successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update super affiliate user",
        error: error.message,
      });
    }
  },
);

/* =========================
   Admin - Activate / Deactivate super affiliate user
========================= */
router.patch(
  "/admin/super-affiliate-users/:id/toggle-active",
  protectAdmin,
  async (req, res) => {
    try {
      const {
        isActive,
        gameLossCommission,
        depositCommission,
        referCommission,
        gameWinCommission,
      } = req.body || {};

      const user = await User.findOne({
        _id: req.params.id,
        role: "super-aff-user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Super affiliate user not found",
        });
      }

      user.isActive = !!isActive;

      if (user.isActive) {
        user.gameLossCommission = Number(gameLossCommission) || 0;
        user.depositCommission = Number(depositCommission) || 0;
        user.referCommission = Number(referCommission) || 0;
        user.gameWinCommission = Number(gameWinCommission) || 0;
      }

      await user.save();

      return res.json({
        success: true,
        message: `Super affiliate user ${
          user.isActive ? "activated" : "deactivated"
        } successfully`,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update super affiliate user status",
        error: error.message,
      });
    }
  },
);

export { protectSuperAffiliate };
export default router;
