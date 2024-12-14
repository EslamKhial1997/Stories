const { Router } = require("express");

const {
  SingInFirebase,
  verifyToken,
  getMe,
  getLoggedUserData,
  protect,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/uodate", protect, getLoggedUserData, getMe);
Routes.route("/signup/firebase").post(verifyToken, SingInFirebase);

module.exports = Routes;
