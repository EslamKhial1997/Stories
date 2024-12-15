const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./FactoryHandler");

const UsersModel = require("../Modules/UsersModel");


exports.getUsers = factory.getAll(UsersModel);
