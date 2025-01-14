const { default: mongoose } = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    dateSent: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user ID is Required"],
      ref: "User",
    },
    dataReceived: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user ID is Required"],
      ref: "User",
    },
    content: String,
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
