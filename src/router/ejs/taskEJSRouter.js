const express = require("express");
const router = express.Router();

const TaskEJSController = require("../../controller/ejs/taskEJSController");

const Validation = require("../../validate/validation");

const TaskValidation = require("../../validate/taskSchema");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");
router.use(authEJSMiddleware);



router.get("/list", TaskEJSController.listTasks);

router.get("/create", TaskEJSController.createTaskPage);

router.post(
  "/create",
  Validation.validate(TaskValidation.create),
  TaskEJSController.createTask,
);

router.get("/edit/:taskId", TaskEJSController.editTaskPage);

router.post(
  "/edit/:taskId",
  Validation.validate(TaskValidation.update),
  TaskEJSController.editTask,
);

router.post("/delete/:taskId", TaskEJSController.deleteTask);

router.post("/complete/:taskId", TaskEJSController.completeTask);

router.post(
  "/reorder/:taskId",
  Validation.validate(TaskValidation.reorder),
  TaskEJSController.reorderTask,
);

module.exports = router;
