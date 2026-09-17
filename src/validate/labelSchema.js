const Joi = require("joi");

const LabelValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(50).required(),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(50).required(),
  }),
};

module.exports = LabelValidation;
