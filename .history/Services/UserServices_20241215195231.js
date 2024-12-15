
const factory = require("./FactoryHandler");

const UsersModel = require("../Modules/UsersModel");


exports.getUsers = factory.getAll(UsersModel);
