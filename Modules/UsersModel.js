const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: String,
  password:String,
  email: String,
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel; 
