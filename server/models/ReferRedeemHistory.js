import mongoose from "mongoose";

const { Schema } = mongoose;

const referRedeemHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    pointsUsed: {
      type: Number,
      required: true,
      min: 0,
    },

    redeemAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    rateSnapshot: {
      redeemPoint: {
        type: Number,
        required: true,
      },
      redeemMoney: {
        type: Number,
        required: true,
      },
      minimumRedeemAmount: {
        type: Number,
        required: true,
      },
      maximumRedeemAmount: {
        type: Number,
        required: true,
      },
    },

    balanceBefore: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    pointsBefore: {
      type: Number,
      default: 0,
    },

    pointsAfter: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
      index: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

referRedeemHistorySchema.index({ user: 1, createdAt: -1 });

const ReferRedeemHistory = mongoose.model(
  "ReferRedeemHistory",
  referRedeemHistorySchema,
);

export default ReferRedeemHistory;