import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const router = express.Router();

const demoAdmin = {
  email: "admin@yourdomain.com",
  password: "123456",
};

/* =========================
   Protect Admin
========================= */
export const protectAdmin = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized - no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Not authorized - admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized - invalid token" });
  }
};

/* =========================
   Mother Only
========================= */
const requireMother = (req, res, next) => {
  if (req.admin?.role !== "mother") {
    return res.status(403).json({ message: "Only mother admin allowed" });
  }
  next();
};

/* =========================
   Create First Admin
========================= */
router.post("/create-first-time", async (req, res) => {
  try {
    const { email, password } = req.body?.email ? req.body : demoAdmin;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await Admin.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: "mother",
      permissions: [],
    });

    return res.status(201).json({
      success: true,
      message: "First admin created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
      demoLogin: {
        email: demoAdmin.email,
        password: demoAdmin.password,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({
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
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Get Profile
========================= */
router.get("/profile", protectAdmin, async (req, res) => {
  return res.json({
    success: true,
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions || [],
    },
  });
});

/* =========================
   Update Profile
========================= */
router.put("/profile", protectAdmin, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const normalizedNewEmail =
      typeof email === "string" ? email.toLowerCase().trim() : admin.email;

    const wantEmailChange = normalizedNewEmail !== admin.email;
    const wantPasswordChange =
      typeof newPassword === "string" && newPassword.trim().length > 0;

    if (!wantEmailChange && !wantPasswordChange) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    if (wantEmailChange) {
      const exists = await Admin.findOne({ email: normalizedNewEmail });
      if (exists && String(exists._id) !== String(admin._id)) {
        return res.status(409).json({ message: "Email already in use" });
      }
      admin.email = normalizedNewEmail;
    }

    if (wantPasswordChange) {
      if (newPassword.trim().length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      admin.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    await admin.save();

    return res.json({
      success: true,
      message: "Profile updated successfully. Please login again.",
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || [],
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Create Admin
========================= */
router.post("/create-admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await Admin.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "mother" ? "mother" : "sub",
      permissions:
        role === "mother" ? [] : Array.isArray(permissions) ? permissions : [],
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions || [],
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   List Admins
========================= */
router.get("/admins", protectAdmin, requireMother, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("_id email role permissions createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      admins,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Update Admin
========================= */
router.put("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const { email, role, permissions, newPassword } = req.body || {};

    const target = await Admin.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (typeof email === "string" && email.trim() !== "") {
      const normalizedEmail = email.toLowerCase().trim();

      const exists = await Admin.findOne({ email: normalizedEmail });
      if (exists && String(exists._id) !== String(target._id)) {
        return res
          .status(400)
          .json({ message: "Email already in use by another admin" });
      }

      target.email = normalizedEmail;
    }

    if (typeof role === "string") {
      target.role = role === "mother" ? "mother" : "sub";

      if (target.role === "mother") {
        target.permissions = [];
      }
    }

    if (Array.isArray(permissions) && target.role !== "mother") {
      target.permissions = permissions;
    }

    if (typeof newPassword === "string" && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      target.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    await target.save();

    return res.json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        id: target._id,
        email: target.email,
        role: target.role,
        permissions: target.permissions || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

/* =========================
   Delete Admin
========================= */
router.delete("/admins/:id", protectAdmin, requireMother, async (req, res) => {
  try {
    const target = await Admin.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (String(target._id) === String(req.admin._id)) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account" });
    }

    await Admin.deleteOne({ _id: target._id });

    return res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;