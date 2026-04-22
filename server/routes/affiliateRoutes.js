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

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      countryCode: user.countryCode,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
};

/**
 * helper: YYYY-MM-DD -> Jan 12
 */
const formatDateLabel = (dateString) => {
  const d = new Date(dateString);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const protectAffiliate = async (req, res, next) => {
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

    if (!user || user.role !== "aff-user") {
      return res.status(401).json({
        success: false,
        message: "Affiliate not found",
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


const ALPHA_NUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

const generateRandomCode = (length = 6) => {
  let result = "";

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * ALPHA_NUMERIC.length);
    result += ALPHA_NUMERIC[randomIndex];
  }

  return result;
};

const generateUniqueUserId = async () => {
  let userId = "";
  let exists = true;

  while (exists) {
    userId = generateRandomCode(6);
    const found = await User.findOne({ userId }).select("_id");
    exists = !!found;
  }

  return userId;
};

const generateUniqueReferralCode = async () => {
  let referralCode = "";
  let exists = true;

  while (exists) {
    referralCode = generateRandomCode(6);
    const found = await User.findOne({ referralCode }).select("_id");
    exists = !!found;
  }

  return referralCode;
};

/* =========================
   Affiliate Register
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      countryCode: rawCountryCode,
      phone: rawPhone,
      email,
      password,
      confirmPassword,
      verificationCode,
    } = req.body || {};

    const countryCode = normalizeCountryCode(rawCountryCode);
    const phone = normalizePhone(rawPhone);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const safeFirstName = String(firstName || "").trim();
    const safeLastName = String(lastName || "").trim();
    const safeVerificationCode = String(verificationCode || "").trim();

    if (
      !safeFirstName ||
      !safeLastName ||
      !countryCode ||
      !phone ||
      !normalizedEmail ||
      !password ||
      !confirmPassword ||
      !safeVerificationCode
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validateCountryCode(countryCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid country code",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!validateEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!/^\d{4,6}$/.test(safeVerificationCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (String(password).length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Confirm password does not match",
      });
    }

    const phoneExists = await User.findOne({
      countryCode,
      phone,
    }).select("_id");

    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    const emailExists = await User.findOne({
      email: normalizedEmail,
    }).select("_id");

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const userId = await generateUniqueUserId();
    const referralCode = await generateUniqueReferralCode();
    const hashedPassword = await bcrypt.hash(password, 10);

    const affiliate = await User.create({
      userId,
      referralCode,
      firstName: safeFirstName,
      lastName: safeLastName,
      countryCode,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
      role: "aff-user",
      isActive: false,
    });

    return res.status(201).json({
      success: true,
      message:
        "Affiliate registration successful. Please wait for admin approval before login.",
      user: {
        id: affiliate._id,
        userId: affiliate.userId,
        referralCode: affiliate.referralCode,
        firstName: affiliate.firstName,
        lastName: affiliate.lastName,
        countryCode: affiliate.countryCode,
        phone: affiliate.phone,
        email: affiliate.email,
        role: affiliate.role,
        isActive: affiliate.isActive,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone, email, userId or referralCode already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Affiliate Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const { phone: rawPhone, password } = req.body || {};
    const phone = normalizePhone(rawPhone);

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const user = await User.findOne({
      phone,
      role: "aff-user",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin approval pending. Please wait for activation.",
      });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        countryCode: user.countryCode,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Affiliate Profile
========================= */
router.get("/profile", protectAffiliate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/* =========================
   GET /api/affiliate/me/balance
========================= */
router.get("/me/balance", protectAffiliate, async (req, res) => {
  try {
    return res.json({
      success: true,
      balance: Number(req.user?.balance || 0),
      currency: req.user?.currency || "BDT",
      userId: req.user?.userId || "",
      phone: req.user?.phone || "",
      role: req.user?.role || "aff-user",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load balance",
      error: error.message,
    });
  }
});


router.get("/my-users", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

    const users = await User.find({
      referredBy: affiliate._id,
      role: "user",
    })
      .select("_id userId email countryCode phone balance currency isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load referred users",
      error: error.message,
    });
  }
});


router.patch("/my-users/:id/toggle-status", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;
    const { isActive } = req.body || {};

    const targetUser = await User.findOne({
      _id: req.params.id,
      referredBy: affiliate._id,
      role: "user",
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found under your referrals",
      });
    }

    targetUser.isActive = !!isActive;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User ${targetUser.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        _id: targetUser._id,
        userId: targetUser.userId,
        isActive: targetUser.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
});

router.get("/commission-status", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

    return res.status(200).json({
      success: true,
      data: {
        currency: affiliate.currency || "BDT",
        mainBalance: Number(affiliate.commissionBalance || 0),

        gameLossCommission: Number(affiliate.gameLossCommission || 0),
        gameWinCommission: Number(affiliate.gameWinCommission || 0),
        referCommission: Number(affiliate.referCommission || 0),
        depositCommission: Number(affiliate.depositCommission || 0),

        gameWinCommissionBalance: Number(
          affiliate.gameWinCommissionBalance || 0,
        ),
        referCommissionBalance: Number(
          affiliate.referCommissionBalance || 0,
        ),
        depositCommissionBalance: Number(
          affiliate.depositCommissionBalance || 0,
        ),
        gameLossCommissionBalance: Number(
          affiliate.gameLossCommissionBalance || 0,
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

/**
 * GET /api/affiliate/dashboard/me
 */
router.get("/dashboard/me", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

    const totalReferrals = await User.countDocuments({
      referredBy: affiliate._id,
    });

    const activeReferrals = await User.countDocuments({
      referredBy: affiliate._id,
      isActive: true,
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthNewReferrals = await User.countDocuments({
      referredBy: affiliate._id,
      createdAt: { $gte: startOfMonth },
    });

    const recentReferrals = await User.find({
      referredBy: affiliate._id,
    })
      .select("userId phone countryCode balance currency isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    const referCommissionPerUser = Number(affiliate.referCommission || 0);
    const thisMonthEarnings = thisMonthNewReferrals * referCommissionPerUser;

    const referCommissionBalance = Number(
      affiliate.referCommissionBalance || 0,
    );
    const depositCommissionBalance = Number(
      affiliate.depositCommissionBalance || 0,
    );
    const gameLossCommissionBalance = Number(
      affiliate.gameLossCommissionBalance || 0,
    );
    const gameWinCommissionBalance = Number(
      affiliate.gameWinCommissionBalance || 0,
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
          _id: affiliate._id,
          userId: affiliate.userId,
          firstName: affiliate.firstName || "",
          lastName: affiliate.lastName || "",
          fullName:
            `${affiliate.firstName || ""} ${affiliate.lastName || ""}`.trim(),
          email: affiliate.email || "",
          phone: affiliate.phone || "",
          countryCode: affiliate.countryCode || "",
          referralCode: affiliate.referralCode || "",
          currency: affiliate.currency || "BDT",
          isActive: !!affiliate.isActive,

          balance: Number(affiliate.balance || 0),
          commissionBalance: Number(affiliate.commissionBalance || 0),

          referCommission: Number(affiliate.referCommission || 0),
          gameLossCommission: Number(affiliate.gameLossCommission || 0),
          depositCommission: Number(affiliate.depositCommission || 0),
          gameWinCommission: Number(affiliate.gameWinCommission || 0),

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
    console.error("AFFILIATE DASHBOARD ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate dashboard",
      error: error.message,
    });
  }
});

/**
 * GET /api/affiliate/dashboard/earnings?days=30
 */
router.get("/dashboard/earnings", protectAffiliate, async (req, res) => {
  try {
    const affiliate = req.user;

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
      referredBy: affiliate._id,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select("createdAt")
      .lean();

    const referCommissionPerUser = Number(affiliate.referCommission || 0);

    const dateMap = new Map();

    for (let i = 0; i < days; i++) {
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
    console.error("AFFILIATE EARNINGS CHART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load earnings chart",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Get all affiliate users
========================= */
router.get("/admin/affiliate-users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "aff-user" })
      .select(
        "_id userId email countryCode phone firstName lastName balance referralCode role isActive createdAt updatedAt gameLossCommission depositCommission referCommission gameWinCommission",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate users",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Get single affiliate user details
========================= */
router.get("/admin/affiliate-users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "aff-user",
    })
      .populate("referredBy", "userId phone")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Affiliate user not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load affiliate user details",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Update affiliate user
========================= */
router.patch("/admin/affiliate-users/:id", protectAdmin, async (req, res) => {
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
      role: "aff-user",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Affiliate user not found",
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

    if (!normalizedCountryCode || !validateCountryCode(normalizedCountryCode)) {
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
      message: "Affiliate user updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update affiliate user",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Activate / Deactivate affiliate user
========================= */
router.patch(
  "/admin/affiliate-users/:id/toggle-active",
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
        role: "aff-user",
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Affiliate user not found",
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
        message: `Affiliate user ${user.isActive ? "activated" : "deactivated"} successfully`,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update affiliate user status",
        error: error.message,
      });
    }
  },
);

export default router;
