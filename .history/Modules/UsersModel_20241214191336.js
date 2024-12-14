const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: String,
  username:String,
  email: String,
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel; 
