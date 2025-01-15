const { default: mongoose } = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user ID is Required"],
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user ID is Required"],
      ref: "User",
    },
    message: String,
    username: String,
    Seen: {
      type: Boolean,
      default: false,
    },

    dateSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
const chatModel = mongoose.model("chat", chatSchema);
module.exports = chatModel;
