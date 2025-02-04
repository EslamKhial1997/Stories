const { default: mongoose } = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type:String,
      required: [true, "user ID is Required"],
    
    },
    receiverId: {
      type:String,
      required: [true, "user ID is Required"],
   
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
