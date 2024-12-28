const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./FactoryHandler");
const admin = require("firebase-admin");
const UsersModel = require("../Modules/UsersModel");
const jwt = require("jsonwebtoken");
var serviceAccount = require("../Config/chat-6bb95-firebase-adminsdk-r8fll-ba6c735556.json");
const ApiError = require("../Resuble/ApiErrors");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
exports.protect = expressAsyncHandler(async (req, res, next) => {
  let token;

  // الحصول على التوكن من الهيدر
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // التحقق من وجود التوكن
  if (!token) {
    return next(new ApiError("Invalid authorization, please login", 401));
  }

  let decodedToken;
  let verify;

  try {
    // التحقق من التوكن باستخدام Firebase Admin SDK
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (error) {
    // إذا فشل التحقق من Firebase، نتحقق من أنه JWT محلي
    try {
      verify = jwt.verify(token, process.env.SECRET_KEY);
    } catch (jwtError) {
      return next(new ApiError("Invalid Token", 401));
    }
  }

  // البحث عن المستخدم باستخدام firebaseUid أو _id
  const currentUser = await UsersModel.findOne({
    $or: [{ firebaseUid: decodedToken?.uid }, { _id: verify?.userId }],
  });

  // التحقق من وجود المستخدم
  if (!currentUser) {
    return next(new ApiError("User does not exist", 401));
  }

  // تخزين بيانات المستخدم في الطلب
  req.user = currentUser;

  // الانتقال إلى المعالج التالي
  next();
});
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
const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const UsersModel = require("../models/UsersModel");

exports.SingInFirebase = expressAsyncHandler(async (req, res, next) => {
  const { uid, email, username, image } = req.body;

  try {
    // البحث عن المستخدم بناءً على Firebase UID
    let user = await UsersModel.findOne({ firebaseUID: uid });

    // إذا لم يكن المستخدم موجودًا، نقوم بإنشاء حساب جديد
    if (!user) {
      const createAuth = await UsersModel.create({
        email,
        username,
        firebaseUID: uid,
        image,
      });

      // إنشاء التوكن للمستخدم الجديد
      const token = jwt.sign({ userId: createAuth._id }, process.env.SECRET_KEY, {
        expiresIn: "365d", // تم تحديد المدة بشكل صحيح
      });

      return res.status(201).json({ data: createAuth, token });
    } else {
      // إذا كان المستخدم موجودًا بالفعل، نقوم بإنشاء التوكن له
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "365d", // تم تحديد المدة بشكل صحيح
      });

      return res.status(200).json({ data: user, token });
    }
  } catch (error) {
    // في حالة حدوث أي خطأ، قم بتمريره إلى المعالج التالي
    next(error);
  }
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
