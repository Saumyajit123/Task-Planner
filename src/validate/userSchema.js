const Joi = require("joi");

const UserValidation = {
  signup: Joi.object({
    name: Joi.string().min(2).max(100).required(),

    email: Joi.string().email().required(),

    password: Joi.string().min(6).max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),

    email: Joi.string().email().optional(),

    profilePicture: Joi.string().allow("").optional(),
  }),
};

module.exports = UserValidation;
