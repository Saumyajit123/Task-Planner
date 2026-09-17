const express = require("express");
const router = express.Router();

const ReminderEJSController = require("../../controller/ejs/reminderEJSController");

const Validation = require("../../validate/validation");

const ReminderValidation = require("../../validate/reminderSchema");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");
router.use(authEJSMiddleware);



router.get("/", ReminderEJSController.listReminders);

router.get("/create", ReminderEJSController.createPage);

router.post(
  "/create",
  Validation.validate(ReminderValidation.create),
  ReminderEJSController.createReminder,
);

router.get("/edit/:reminderId", ReminderEJSController.editPage);

router.post(
  "/edit/:reminderId",
  Validation.validate(ReminderValidation.update),
  ReminderEJSController.editReminder,
);

router.post("/delete/:reminderId", ReminderEJSController.deleteReminder);

module.exports = router;
