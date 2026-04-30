import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    text: {
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

    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

NoticeSchema.index({ isActive: 1, createdAt: -1 });

const Notice =
  mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);

export default Notice;