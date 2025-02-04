const mongoose = require("mongoose");

// نموذج بيانات الفيديو
const videoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    view: { type: String },
    review: { type: String },
    key: { type: String },
    size: { type: String },
    duration: { type: String },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  { timestamps: true }
);

const VideoModel = mongoose.model("Video", videoSchema);
module.exports = VideoModel;
