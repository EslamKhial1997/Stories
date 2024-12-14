const { Router } = require("express");

const {
  getMe,
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/update", protect, getLoggedUserData, updateUser);

module.exports = Routes;
