import mongoose from "mongoose";

const SliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

SliderSchema.index({ order: 1, createdAt: -1 });

export default mongoose.models.Slider || mongoose.model("Slider", SliderSchema);