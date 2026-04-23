import mongoose from "mongoose";

const WithdrawRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    methodId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    fields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    balanceBefore: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

WithdrawRequestSchema.index({ user: 1, createdAt: -1 });
WithdrawRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("WithdrawRequest", WithdrawRequestSchema);
