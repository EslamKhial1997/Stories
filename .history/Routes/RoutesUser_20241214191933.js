const { Router } = require("express");

const {
 
  getMe,
  getLoggedUserData,
  protect,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/update", protect, getLoggedUserData, getMe);

module.exports = Routes;
