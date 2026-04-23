import mongoose from "mongoose";

const TextBiSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  { _id: false },
);

const DepositContactSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    label: { type: TextBiSchema, default: () => ({}) },
    number: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { _id: false },
);

const DepositMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    methodName: {
      type: TextBiSchema,
      default: () => ({}),
    },

    methodType: {
      type: String,
      enum: ["personal", "agent"],
      default: "agent",
    },

    logoUrl: {
      type: String,
      default: "",
    },

    minDepositAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Minimum deposit amount cannot be negative"],
    },

    maxDepositAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Maximum deposit amount cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    contacts: {
      type: [DepositContactSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("DepositMethod", DepositMethodSchema);
