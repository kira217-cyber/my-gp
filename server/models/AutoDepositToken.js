import mongoose from "mongoose";

const { Schema } = mongoose;

const BonusSchema = new Schema(
  {
    title: {
      bn: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },

    bonusType: {
      type: String,
      enum: ["fixed", "percent"],
      required: true,
      default: "fixed",
    },

    bonusValue: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    turnoverMultiplier: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true },
);

const AutoDepositTokenSchema = new Schema(
  {
    businessToken: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: false,
    },

    minAmount: {
      type: Number,
      default: 5,
      min: 1,
    },

    maxAmount: {
      type: Number,
      default: 500000,
      min: 0,
    },

    bonuses: {
      type: [BonusSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const AutoDepositToken = mongoose.model(
  "AutoDepositToken",
  AutoDepositTokenSchema,
);

export default AutoDepositToken;