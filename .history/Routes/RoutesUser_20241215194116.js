const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { UploadImageService, resizeImage } = require("../Utils/imagesHandler");

const Routes = Router();
uploadImage,UtilsValidator, 
    resizeImage("gallery"),
Routes.put("/:id", protect,UploadImageService, getLoggedUserData,resizeImage updateUser);

module.exports = Routes;
