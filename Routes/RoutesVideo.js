const { Router } = require("express");

const {
  getLoggedUserData,
  protect,
  updateUser,
} = require("../Services/AuthServices");
const { resizeImage, uploadImage } = require("../Utils/imagesHandler");
const {
  createVideo,
  getVideos,
  updateVideo,
  getVideo,
  deleteVideo,
} = require("../Services/VideoServices");

const Routes = Router();
Routes.use(protect);
Routes.use(getLoggedUserData);
Routes.route("/").post(createVideo).get(getVideos);
Routes.route("/:id").get(getVideo).put(updateVideo).delete(deleteVideo);

module.exports = Routes;
