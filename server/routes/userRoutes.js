import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protectAdmin } from "./adminRoutes.js";

const router = express.Router();

const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

const randomAlphaNum = (length = 6) => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
  }
  return result;
};

const generateUniqueValue = async (field, length = 6) => {
  let value = "";
  let exists = true;

  while (exists) {
    value = randomAlphaNum(length);
    const doc = await User.findOne({ [field]: value }).select("_id");
    exists = !!doc;
  }

  return value;
};

const normalizeCountryCode = (value = "") => {
  const cleaned = String(value).trim();
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? cleaned : `+${cleaned.replace(/\D/g, "")}`;
};

const normalizePhone = (value = "") => {
  return String(value).replace(/\D/g, "").trim();
};

const validateCountryCode = (value = "") => {
  return /^\+\d{1,5}$/.test(value);
};

const validatePhone = (value = "") => {
  return /^\d{6,15}$/.test(value);
};

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

export const protectUser = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/* =========================
   Register
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      countryCode: rawCountryCode,
      phone: rawPhone,
      password,
      confirmPassword,
      refCode: rawRefCode,
    } = req.body || {};


    const countryCode = normalizeCountryCode(rawCountryCode);
    const phone = normalizePhone(rawPhone);
    const refCode = String(rawRefCode || "").trim().toUpperCase();

    if (!countryCode || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "countryCode, phone, password and confirmPassword are required",
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

    if (password.length < 4) {
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

    const exists = await User.findOne({ countryCode, phone }).select("_id");
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    let referredByUser = null;

    if (refCode) {
      referredByUser = await User.findOne({
        referralCode: refCode,
        role: "aff-user",
      }).select(
        "_id referralCode role referCommission createdUsers referralCount commissionBalance referCommissionBalance",
      );


      if (!referredByUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
        });
      }
    }

    const userId = await generateUniqueValue("userId", 6);
    const referralCode = await generateUniqueValue("referralCode", 6);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userId,
      referralCode,
      countryCode,
      phone,
      password: hashedPassword,
      role: "user",
      isActive: true,
      referredBy: referredByUser ? referredByUser._id : null,
    });

    if (referredByUser) {
      const referCommissionAmount = Number(referredByUser.referCommission || 0);

      await User.updateOne(
        { _id: referredByUser._id },
        {
          $addToSet: { createdUsers: user._id },
          $inc: {
            referralCount: 1,
            referCommissionBalance: referCommissionAmount,
          },
        },
      );
    }

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        userId: user.userId,
        countryCode: user.countryCode,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        referralCode: user.referralCode,
        balance: user.balance,
        currency: user.currency,
        referredBy: user.referredBy || null,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone, userId or referralCode already exists",
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
   Login
========================= */
router.post("/login", async (req, res) => {
  try {
    const {
      countryCode: rawCountryCode,
      phone: rawPhone,
      password,
    } = req.body || {};

    const countryCode = normalizeCountryCode(rawCountryCode);
    const phone = normalizePhone(rawPhone);

    if (!countryCode || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "countryCode, phone and password are required",
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

    const user = await User.findOne({ countryCode, phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
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
        countryCode: user.countryCode,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        referralCode: user.referralCode,
        balance: user.balance,
        currency: user.currency,
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
   Profile
========================= */
router.get("/profile", protectUser, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/* =========================
   Me - Balance
========================= */
router.get("/me/balance", protectUser, async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        id: req.user._id,
        userId: req.user.userId,
        balance: Number(req.user.balance || 0),
        currency: req.user.currency || "BDT",
      },
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
   Admin - Get all users
========================= */
router.get("/admin/all-users", protectAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select(
        "_id userId email countryCode phone firstName lastName balance referralCode role isActive createdAt updatedAt",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load users",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Get single user details
========================= */
router.get("/admin/all-users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("referredBy", "userId phone")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load user details",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Update user
========================= */
router.patch("/admin/all-users/:id", protectAdmin, async (req, res) => {
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

/* =========================
   Admin - Toggle status
========================= */
router.patch(
  "/admin/all-users/:id/toggle-status",
  protectAdmin,
  async (req, res) => {
    try {
      const { isActive } = req.body || {};

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.isActive = !!isActive;
      await user.save();

      return res.json({
        success: true,
        message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
        error: error.message,
      });
    }
  },
);

export default router;
