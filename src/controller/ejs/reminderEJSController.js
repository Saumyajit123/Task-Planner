const mongoose = require("mongoose");

const Reminder = require("../../models/reminderModel");

const Task = require("../../models/taskModel");

class ReminderEJSController {
  // LIST REMINDERS
  static listReminders = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const reminders = await Reminder.aggregate([
        {
          $match: {
            userId,
          },
        },

        {
          $lookup: {
            from: "tasks",
            localField: "taskId",
            foreignField: "_id",
            as: "task",
          },
        },

        {
          $unwind: "$task",
        },

        {
          $sort: {
            reminderTime: 1,
          },
        },
      ]);

      return res.render("reminders/list", {
        reminders,
      });
    } catch (error) {
      return res.status(500).send("Failed to fetch reminders");
    }
  };

  // CREATE PAGE
  static createPage = async (req, res) => {
    try {
      const tasks = await Task.find({
        userId: req.user.userId,
        status: "Pending",
      }).sort({
        dueDate: 1,
      });

      return res.render("reminders/create", {
        tasks,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load reminder page");
    }
  };

  // CREATE REMINDER
  static createReminder = async (req, res) => {
    try {
      const { taskId, type, reminderTime, daysOfWeek } = req.body;

      const task = await Task.findOne({
        _id: taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).send("Task not found");
      }

      await Reminder.create({
        userId: req.user.userId,

        taskId,

        type,

        reminderTime,

        daysOfWeek: type === "weekly" ? daysOfWeek || [] : [],
      });

      return res.redirect("/ui/reminders");
    } catch (error) {
      console.log(error);

      return res.status(500).send("Failed to create reminder");
    }
  };

  // EDIT PAGE
  static editPage = async (req, res) => {
    try {
      const reminder = await Reminder.findOne({
        _id: req.params.reminderId,
        userId: req.user.userId,
      });

      if (!reminder) {
        return res.status(404).send("Reminder not found");
      }

      const tasks = await Task.find({
        userId: req.user.userId,
      });

      return res.render("reminders/edit", {
        reminder,
        tasks,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load reminder");
    }
  };

  // EDIT REMINDER
  static editReminder = async (req, res) => {
    try {
      const { type, reminderTime, daysOfWeek, isActive } = req.body;

      const reminder = await Reminder.findOneAndUpdate(
        {
          _id: req.params.reminderId,
          userId: req.user.userId,
        },
        {
          type,
          reminderTime,
          daysOfWeek: type === "weekly" ? daysOfWeek || [] : [],
          isActive: isActive === "true" || isActive === true,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!reminder) {
        return res.status(404).send("Reminder not found");
      }

      return res.redirect("/ui/reminders");
    } catch (error) {
      return res.status(500).send("Failed to update reminder");
    }
  };

  // DELETE
  static deleteReminder = async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndDelete({
        _id: req.params.reminderId,
        userId: req.user.userId,
      });

      if (!reminder) {
        return res.status(404).send("Reminder not found");
      }

      return res.redirect("/ui/reminders");
    } catch (error) {
      return res.status(500).send("Failed to delete reminder");
    }
  };
}

module.exports = ReminderEJSController;
