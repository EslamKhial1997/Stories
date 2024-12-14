const { Router } = require("express");

const {
  SingInFirebase,
  verifyToken,
  getMe,
  getLoggedUserData,
  protect,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/getMe", protect, getLoggedUserData, getMe);
Routes.get("/login", protect, getLoggedUserData, getMe);
Routes.route("/firebase").post(verifyToken, SingInFirebase);

module.exports = Routes;
