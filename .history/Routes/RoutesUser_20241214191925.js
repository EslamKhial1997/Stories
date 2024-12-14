const { Router } = require("express");

const {
  SingInFirebase,
  verifyToken,
  getMe,
  getLoggedUserData,
  protect,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/update", protect, getLoggedUserData, getMe);
Routes.route("/signup/firebase").post(verifyToken, SingInFirebase);

module.exports = Routes;
