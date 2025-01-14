const chatModel = require("../Modules/ChatModel");
const factory = require("./FactoryHandler");

exports.createChat = factory.createOne(chatModel);
exports.getChats = factory.getAll(chatModel);
exports.getChat = factory.getOne(chatModel);
exports.updateChat = factory.updateOne(chatModel);
exports.deleteChat = factory.deleteOne(chatModel);
