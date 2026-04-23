import mongoose from "mongoose";

const I18nSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

const FieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },

    label: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    placeholder: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    type: {
      type: String,
      enum: ["text", "number", "tel", "email"],
      default: "text",
    },

    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const WithdrawMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    logoUrl: {
      type: String,
      default: "",
    },

    minimumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumWithdrawAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    fields: {
      type: [FieldSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const WithdrawMethod =
  mongoose.models.WithdrawMethod ||
  mongoose.model("WithdrawMethod", WithdrawMethodSchema);

export default WithdrawMethod;