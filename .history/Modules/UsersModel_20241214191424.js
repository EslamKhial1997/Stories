const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: String,
  email: String,
  username:String,
  phone:String,
  grander:{
    type:String,
    enum:["ma"]
  }
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel; 
