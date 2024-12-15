const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { UploadImageService } = require("../Utils/imagesHandler");

const Routes = Router();
uploadImage,UtilsValidator, 
    resizeImage("gallery"),
Routes.put("/:id", protect,UploadImageService, getLoggedUserData, updateUser);

module.exports = Routes;
