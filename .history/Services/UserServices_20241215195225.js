const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./FactoryHandler");
const admin = require("firebase-admin");
const UsersModel = require("../Modules/UsersModel");
const jwt = require("jsonwebtoken");
var serviceAccount = require("../Config/chat-6bb95-firebase-adminsdk-r8fll-ba6c735556.json");
const ApiError = require("../Resuble/ApiErrors");

exports.getUsers = factory.getAll(UsersModel);
