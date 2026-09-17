const Joi = require("joi");

const ReminderValidation = {
  create: Joi.object({
    taskId: Joi.string().hex().length(24).required(),

    type: Joi.string().valid("once", "daily", "weekly").required(),

    reminderTime: Joi.date().required(),

    daysOfWeek: Joi.array()
      .items(Joi.number().integer().min(0).max(6))
      .when("type", {
        is: "weekly",
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
  }),

  update: Joi.object({
    type: Joi.string().valid("once", "daily", "weekly").optional(),

    reminderTime: Joi.date().optional(),

    daysOfWeek: Joi.array()
      .items(Joi.number().integer().min(0).max(6))
      .optional(),

    isActive: Joi.boolean().optional(),
  }),
};

module.exports = ReminderValidation;
