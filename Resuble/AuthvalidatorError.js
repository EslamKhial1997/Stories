const { check } = require("express-validator");
const { default: slugify } = require("slugify");
const {
  MiddlewareValidator,
} = require("../Middleware/MiddlewareValidatorError");
const UsersModel = require("../Modules/UsersModel");

exports.SignupValidator = [
  check("password")
    .optional(),
  check("password")
    .isLength({ min: 6 })
    .withMessage("To Shoort Password To CreateUser Validator")
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .optional(),

  check("email").notEmpty().withMessage("is required E-mail"),
  check("email")
    .isEmail()
    .withMessage("Must be at E-mail Address")
    .custom((val) =>
      UsersModel.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("الايميل موجود من قبل"));
        }
      })
    ),
  MiddlewareValidator,
];
exports.LoginValidator = [
  check("password")
    .notEmpty()
    .withMessage("is required Password")
    .withMessage("To Shoort Password To CreateUser Validator"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("To Shoort Password To CreateUser Validator"),
  check("email").notEmpty().withMessage("is required E-mail"),

  MiddlewareValidator,
];
