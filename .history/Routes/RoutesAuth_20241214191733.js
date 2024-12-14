const { Router } = require("express");

const {
  SingUp,
  Login,
  SingInFirebase,
  verifyToken,
  getMe,
  getLoggedUserData,
  protect,
} = require("../Services/AuthServices");
const { SignupValidator } = require("../Resuble/AuthvalidatorError");

const Routes = Router();

Routes.get("/getMe", protect, getLoggedUserData, getMe);
Routes.route("/signup/firebase").post(verifyToken, SingInFirebase);

module.exports = Routes;
