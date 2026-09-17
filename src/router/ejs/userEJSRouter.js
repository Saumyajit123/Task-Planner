const express = require("express");
const router = express.Router();

const UserEJSController = require("../../controller/ejs/userEJSController");

const Validation = require("../../validate/validation");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");

const UserValidation = require("../../validate/userSchema");


router.get("/login", UserEJSController.loginPage);

router.post(
  "/login",
  Validation.validate(UserValidation.login),
  UserEJSController.login,
);

router.get("/signup", UserEJSController.signupPage);

router.post(
  "/signup",
  Validation.validate(UserValidation.signup),
  UserEJSController.signup,
);

router.get("/verify-email/:token", UserEJSController.verifyEmail);

router.get("/logout", UserEJSController.logout);

router.get("/profile", authEJSMiddleware, UserEJSController.profile);

router.get(
  "/profile/edit",
  authEJSMiddleware,
  UserEJSController.editProfilePage,
);

router.post(
  "/profile/edit",
  authEJSMiddleware,
  Validation.validate(UserValidation.updateProfile),
  UserEJSController.editProfile,
);

module.exports = router;
