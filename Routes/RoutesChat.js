const { Router } = require("express");

const { protect } = require("../Services/AuthServices");
const {
  createChat,
  getChats,
  updateChat,
  getChat,
  deleteChat,
} = require("../Services/ChatServices");

const Routes = Router();
Routes.route("/").post( createChat).get(getChats);
Routes.route("/:id").put(protect, updateChat).get(getChat).delete(deleteChat);

module.exports = Routes;
