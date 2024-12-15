const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { resizeImage, uploadImage } = require("../Utils/imagesHandler");

const Routes = Router();
Routes.get(
  "/",
  protect,
  updateUser
);
Routes.put(
  "/:id",
  protect,
  uploadImage,
  getLoggedUserData,
  resizeImage("user"),
  updateUser
);

module.exports = Routes;
