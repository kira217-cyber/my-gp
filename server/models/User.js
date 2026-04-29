import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 4,
      maxlength: 15,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    countryCode: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "aff-user", "super-aff-user"],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    balance: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    createdUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionBalance: {
      type: Number,
      default: 0,
    },

    gameLossCommission: {
      type: Number,
      default: 0,
    },

    depositCommission: {
      type: Number,
      default: 0,
    },

    referCommission: {
      type: Number,
      default: 0,
    },

    gameWinCommission: {
      type: Number,
      default: 0,
    },

    gameLossCommissionBalance: {
      type: Number,
      default: 0,
    },

    depositCommissionBalance: {
      type: Number,
      default: 0,
    },

    referCommissionBalance: {
      type: Number,
      default: 0,
    },

    gameWinCommissionBalance: {
      type: Number,
      default: 0,
    },

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ countryCode: 1, phone: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;
