const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: String,
  email: String,
  username: String,
  phone: String,
  grander: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  b
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;
