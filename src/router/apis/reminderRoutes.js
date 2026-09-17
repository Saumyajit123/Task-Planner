const express = require("express");

const ReminderController = require("../../controller/apis/reminderController");
const authMiddleware = require("../../middleware/authMiddleware");
const Validation = require("../../validate/validation");
const ReminderValidation = require("../../validate/reminderSchema");

const router = express.Router();

router.post(
  "/setreminder",
  authMiddleware,
  Validation.validate(ReminderValidation.create),
  ReminderController.setReminder
);

router.put(
  "/update/:reminderId",
  authMiddleware,
  Validation.validate(ReminderValidation.update),
  ReminderController.editReminder
);

router.delete(
  "/delete/:reminderId",
  authMiddleware,
  ReminderController.deleteReminder
);

router.get(
  "/reminderlist",
  authMiddleware,
  ReminderController.listReminders
);

module.exports = router;