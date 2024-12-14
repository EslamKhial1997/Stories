const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");

const Routes = Router();

Routes.get("/:id",protect getLoggedUserData, updateUser);

module.exports = Routes;
