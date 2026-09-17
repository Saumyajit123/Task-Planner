const express = require("express");

const TaskController = require("../../controller/apis/taskController");

const authMiddleware = require("../../middleware/authMiddleware");
const Validation = require("../../validate/validation");
const TaskValidation = require("../../validate/taskSchema");

const router = express.Router();

router.post(
  "/addtask",
  authMiddleware,
  Validation.validate(TaskValidation.create),
  TaskController.addTask,
);

router.put(
  "/edit/:taskId",
  authMiddleware,
  Validation.validate(TaskValidation.update),
  TaskController.editTask,
);

router.delete("/delete/:taskId", authMiddleware, TaskController.deleteTask);

router.patch("/complete/:taskId", authMiddleware, TaskController.completeTask);

router.get("/tasklist", authMiddleware, TaskController.listTasks);

router.patch(
  "/reorder/:taskId",
  authMiddleware,
  Validation.validate(TaskValidation.reorder),
  TaskController.reorderTask,
);

module.exports = router;
