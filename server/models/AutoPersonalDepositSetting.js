import mongoose from "mongoose";

const { Schema } = mongoose;

const PersonalMethodSchema = new Schema(
  {
    methodId: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay"],
      required: true,
      lowercase: true,
      trim: true,
    },

    methodName: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    image: {
      type: String,
      default: "",
      trim: true,
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

const BonusSchema = new Schema(
  {
    title: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    bonusType: {
      type: String,
      enum: ["fixed", "percent"],
      default: "fixed",
      required: true,
    },

    bonusValue: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
      required: true,
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

const AutoPersonalDepositSettingSchema = new Schema(
  {
    apiKey: {
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

    methods: {
      type: [PersonalMethodSchema],
      default: [],
    },

    bonuses: {
      type: [BonusSchema],
      default: [],
    },

    lastKeyValidation: {
      valid: { type: Boolean, default: false },
      reason: { type: String, default: "", trim: true },
      checkedAt: { type: Date, default: null },
      response: { type: Object, default: {} },
    },

    supportNumber: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

const AutoPersonalDepositSetting = mongoose.model(
  "AutoPersonalDepositSetting",
  AutoPersonalDepositSettingSchema,
);

export default AutoPersonalDepositSetting;