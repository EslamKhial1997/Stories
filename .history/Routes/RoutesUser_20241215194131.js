const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { UploadImageService, resizeImage } = require("../Utils/imagesHandler");

const Routes = Router();
Routes.put(
  "/:id",
  protect,
  UploadImageService,
  getLoggedUserData,
  resizeImage("user"),
  updateUser
);

module.exports = Routes;
