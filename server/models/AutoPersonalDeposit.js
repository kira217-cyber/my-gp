import mongoose from "mongoose";

const { Schema } = mongoose;

const AffiliateDepositCommissionSchema = new Schema(
  {
    affiliatorId: {
      type: String,
      default: "",
      trim: true,
    },

    affiliatorUserId: {
      type: String,
      default: "",
      trim: true,
    },

    percent: {
      type: Number,
      default: 0,
      min: 0,
    },

    baseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const SelectedBonusSchema = new Schema(
  {
    bonusId: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
    },

    bonusType: {
      type: String,
      enum: ["fixed", "percent", ""],
      default: "",
    },

    bonusValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: false },
);

const CalcSchema = new Schema(
  {
    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    bonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    turnoverMultiplier: {
      type: Number,
      default: 1,
      min: 0,
    },

    targetTurnover: {
      type: Number,
      default: 0,
      min: 0,
    },

    affiliateDepositCommission: {
      type: AffiliateDepositCommissionSchema,
      default: () => ({
        affiliatorId: "",
        affiliatorUserId: "",
        percent: 0,
        baseAmount: 0,
        commissionAmount: 0,
      }),
    },
  },
  { _id: false },
);

const AutoPersonalDepositSchema = new Schema(
  {
    userIdentity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },

    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", ""],
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    paymentPageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    token: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    from: {
      type: String,
      default: "",
      trim: true,
    },

    trxid: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    deviceName: {
      type: String,
      default: "",
      trim: true,
    },

    deviceId: {
      type: String,
      default: "",
      trim: true,
    },

    bdTimeZone: {
      type: String,
      default: "",
      trim: true,
    },

    webhookPayload: {
      type: Object,
      default: {},
    },

    checkoutItems: {
      type: Object,
      default: {},
    },

    paidAt: {
      type: Date,
      default: null,
    },

    balanceAdded: {
      type: Boolean,
      default: false,
      index: true,
    },

    selectedBonus: {
      type: SelectedBonusSchema,
      default: () => ({
        bonusId: "",
        title: { bn: "", en: "" },
        bonusType: "",
        bonusValue: 0,
        bonusAmount: 0,
        turnoverMultiplier: 1,
      }),
    },

    calc: {
      type: CalcSchema,
      default: () => ({
        depositAmount: 0,
        bonusAmount: 0,
        creditedAmount: 0,
        turnoverMultiplier: 1,
        targetTurnover: 0,
        affiliateDepositCommission: {
          affiliatorId: "",
          affiliatorUserId: "",
          percent: 0,
          baseAmount: 0,
          commissionAmount: 0,
        },
      }),
    },
  },
  { timestamps: true },
);

AutoPersonalDepositSchema.index({ userIdentity: 1, createdAt: -1 });
AutoPersonalDepositSchema.index({ invoiceNumber: 1, status: 1 });
AutoPersonalDepositSchema.index({ status: 1, createdAt: -1 });
AutoPersonalDepositSchema.index({ method: 1, status: 1 });

const AutoPersonalDeposit = mongoose.model(
  "AutoPersonalDeposit",
  AutoPersonalDepositSchema,
);

export default AutoPersonalDeposit;