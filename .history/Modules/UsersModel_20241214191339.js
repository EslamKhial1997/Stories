const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: String,
  email: String,
  username:String,
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel; 
