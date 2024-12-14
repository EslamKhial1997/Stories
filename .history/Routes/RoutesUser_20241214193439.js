const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.put("/:id", protect, getLoggedUserData, updateUser);

module.exports = Routes;
