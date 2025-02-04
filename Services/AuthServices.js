const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./FactoryHandler");
const admin = require("firebase-admin");
const UsersModel = require("../Modules/UsersModel");
const jwt = require("jsonwebtoken");
var serviceAccount = require("../config/chat-6bb95-firebase-adminsdk-r8fll-ba6c735556.json");
const ApiError = require("../Resuble/ApiErrors");
const logger = require('../config/logger');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.getLoggedUserData = expressAsyncHandler(async (req, res, next) => {
  logger.debug('Getting logged user data', { userId: req.user._id });
  req.params.id = req.user._id;
  next();
});

exports.protect = expressAsyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    logger.warn('Authentication attempt without token');
    return next(new ApiError("Invalid authorization, please login", 401));
  }

  let decodedToken;
  let verify;

  try {
    decodedToken = await admin.auth().verifyIdToken(token);
    logger.debug('Firebase token verified successfully', { uid: decodedToken.uid });
  } catch (error) {
    try {
      verify = jwt.verify(token, process.env.SECRET_KEY);
      logger.debug('JWT token verified successfully', { userId: verify.userId });
    } catch (jwtError) {
      logger.error('Token verification failed', { error: jwtError });
      return next(new ApiError("Invalid Token", 401));
    }
  }

  const currentUser = await UsersModel.findOne({
    $or: [{ firebaseUid: decodedToken?.uid }, { _id: verify?.userId }],
  });

  if (!currentUser) {
    logger.warn('Authentication attempt with non-existent user', {
      firebaseUid: decodedToken?.uid,
      userId: verify?.userId
    });
    return next(new ApiError("User does not exist", 401));
  }

  logger.info('User authenticated successfully', { userId: currentUser._id });
  req.user = currentUser;
  next();
});

exports.Login = expressAsyncHandler(async (req, res, next) => {
  logger.debug('Login attempt', { email: req.body.email });
  
  const user = await UsersModel.findOne({
    $or: [{ email: req.body.email }, { firebaseUID: req.body.firebaseUID }],
  });

  if (!user && !bcrypt.compare(req.body.password, user.password)) {
    logger.warn('Failed login attempt', { email: req.body.email });
    return next(new ApiError("InCorrect password Or Email", 404));
  }

  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "90d",
  });

  logger.info('User logged in successfully', { userId: user._id });
  res.status(200).json({ data: user, token });
});

exports.SingInFirebase = expressAsyncHandler(async (req, res, next) => {
  const { uid, email, username, image } = req.body;
  logger.debug('Firebase sign in attempt', { email, uid });

  try {
    let user = await UsersModel.findOne({ firebaseUID: uid });

    if (!user) {
      logger.info('Creating new user with Firebase', { email, uid });
      const createAuth = await UsersModel.create({
        email,
        username,
        firebaseUID: uid,
        image,
      });

      const token = jwt.sign({ userId: createAuth._id }, process.env.SECRET_KEY, {
        expiresIn: "365d",
      });

      logger.info('New user created successfully', { userId: createAuth._id });
      return res.status(201).json({ data: createAuth, token });
    } else {
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "365d",
      });

      logger.info('Existing user signed in with Firebase', { userId: user._id });
      return res.status(200).json({ data: user, token });
    }
  } catch (error) {
    logger.error('Firebase sign in error', { error: error.message, uid });
    next(error);
  }
});

exports.verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1];

  if (!idToken) {
    logger.warn('Token verification attempt without token');
    return res.status(401).send("Unauthorized");
  } 

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    logger.debug('Token verified successfully', { uid: decodedToken.uid });
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    return res.status(401).send("Invalid Token");
  }
};

exports.updateUser = factory.updateOne(UsersModel, "user");
exports.getMe = factory.getOne(UsersModel);
