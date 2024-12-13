const messageSchema = new mongoose.Schema({
  senderId: mongoose.Schema.Types.ObjectId,
  receiverId: mongoose.Schema.Types.ObjectId,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const MessagesModel = mongoose.model("Users", messageSchema);
module.exports = MessagesModel;
