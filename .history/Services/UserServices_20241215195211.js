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


exports.verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1]; // الحصول على التوكن من الهيدر

  if (!idToken) {
    return res.status(401).send("Unauthorized");
  }

  try {
    // التحقق من التوكن باستخدام Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken; // تخزين بيانات اليوزر في الطلب
    next();
  } catch (error) {
    return res.status(401).send("Invalid Token");
  }
};
exports.updateUser = factory.updateOne(UsersModel, "user");
exports.getMe = factory.getOne(UsersModel);
