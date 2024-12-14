const { Router } = require("express");

const {
  SingInFirebase,
  verifyToken,
  getMe,
  getLoggedUserData,
  protect,
  Login,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/getMe", protect, getLoggedUserData, getMe);
Routes.post("/login", Login);
Routes.route("/firebase").post(verifyToken, SingInFirebase);

module.exports = Routes;
