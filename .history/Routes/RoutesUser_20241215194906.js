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
  uploa,
  getLoggedUserData,
  resizeImage("user"),
  updateUser
);

module.exports = Routes;
