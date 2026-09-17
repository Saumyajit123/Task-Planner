const express = require("express");

const UserController = require("../../controller/apis/userController");
const Validation = require("../../validate/validation");
const authMiddleware = require("../../middleware/authMiddleware");
const UserValidation = require("../../validate/userSchema");

const router = express.Router();

router.post(
  "/signup",
  Validation.validate(UserValidation.signup),
  UserController.signup,
);

router.get("/verify-email/:token", UserController.verifyEmail);

router.post(
  "/login",
  Validation.validate(UserValidation.login),
  UserController.login,
);

router.get("/profile", authMiddleware, UserController.getProfile);

router.put(
  "/update/profile",
  authMiddleware,
  Validation.validate(UserValidation.updateProfile),
  UserController.updateProfile,
);

module.exports = router;
