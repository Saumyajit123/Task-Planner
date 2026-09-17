const Joi = require("joi");

const CategoryValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),

    description: Joi.string().allow("").optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),

    description: Joi.string().allow("").optional(),
  }),
};

module.exports = CategoryValidation;
