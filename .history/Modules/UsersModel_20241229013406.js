const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: String,
  username: String,
  phone: String,
  image: String,
  nickname: String,
  grander: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  birthday: String,
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;
