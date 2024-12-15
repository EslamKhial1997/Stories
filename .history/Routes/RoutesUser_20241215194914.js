const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { UploadImageService, resizeImage, uploadImage } = require("../Utils/imagesHandler");

const Routes = Router();
Routes.put(
  "/:id",
  protect,
  uploadImage,
  getLoggedUserData,
  resizeImage("user"),
  updateUser
);

module.exports = Routes;
