const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: {type: String,
    required: true,
    unique: true,},
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  phone: String,
  grander: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  birthday: Date,
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;
