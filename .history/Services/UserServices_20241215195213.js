const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./FactoryHandler");
const admin = require("firebase-admin");
const UsersModel = require("../Modules/UsersModel");
const jwt = require("jsonwebtoken");
var serviceAccount = require("../Config/chat-6bb95-firebase-adminsdk-r8fll-ba6c735556.json");
const ApiError = require("../Resuble/ApiErrors");


exports.Login = expressAsyncHandler(async (req, res, next) => {
  const user = await UsersModel.findOne({
    $or: [{ email: req.body.email }, { firebaseUID: req.body.firebaseUID }],
  });
  if (!user && !bcrypt.compare(req.body.password, user.password)) {
    return next(new ApiError("InCorrect password Or Email", 404));
  }
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "90d",
  });
  res.status(200).json({ data: user, token });
});



exports.updateUser = factory.updateOne(UsersModel, "user");
exports.getMe = factory.getOne(UsersModel);
