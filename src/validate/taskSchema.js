const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const TaskValidation = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),

    description: Joi.string().allow("").optional(),

    priority: Joi.string().valid("Low", "Medium", "High").default("Medium"),

    dueDate: Joi.date().required(),

    categoryId: objectId.allow(null).optional(),

    labels: Joi.array().items(objectId).optional(),

    order: Joi.number().integer().min(0).optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),

    description: Joi.string().allow("").optional(),

    priority: Joi.string().valid("Low", "Medium", "High").optional(),

    dueDate: Joi.date().optional(),

    categoryId: objectId.allow(null).optional(),

    labels: Joi.array().items(objectId).optional(),

    order: Joi.number().integer().min(0).optional(),

    status: Joi.string().valid("Pending", "Completed").optional(),
  }),

  reorder: Joi.object({
    order: Joi.number().integer().min(0).required(),
  }),
};

module.exports = TaskValidation;
