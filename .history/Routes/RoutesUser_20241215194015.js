const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");

const Routes = Router();
uploadImage,UtilsValidator, 
    resizeImage("gallery"),
Routes.put("/:id", protect,upload getLoggedUserData, updateUser);

module.exports = Routes;
