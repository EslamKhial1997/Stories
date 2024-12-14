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
  bi
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;
