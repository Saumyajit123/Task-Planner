const mongoose = require("mongoose");

const Reminder = require("../../models/reminderModel");
const Task = require("../../models/taskModel");

class ReminderController {
  // SET REMINDER
  static setReminder = async (req, res) => {
    try {
      const userId = req.user.userId;

      const { taskId, type, reminderTime, daysOfWeek } = req.body;

      const task = await Task.findOne({
        _id: taskId,
        userId,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (type === "weekly" && (!daysOfWeek || daysOfWeek.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "daysOfWeek is required for weekly reminders",
        });
      }

      const reminder = await Reminder.create({
        userId,
        taskId,
        type,
        reminderTime,
        daysOfWeek: type === "weekly" ? daysOfWeek : [],
      });

      return res.status(201).json({
        success: true,
        message: "Reminder created successfully",
        reminder,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create reminder",
      });
    }
  };

  // EDIT REMINDER
  static editReminder = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { reminderId } = req.params;

      const reminder = await Reminder.findOneAndUpdate(
        {
          _id: reminderId,
          userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: "Reminder not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reminder updated successfully",
        reminder,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update reminder",
      });
    }
  };

  // DELETE REMINDER
  static deleteReminder = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { reminderId } = req.params;

      const reminder = await Reminder.findOneAndDelete({
        _id: reminderId,
        userId,
      });

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: "Reminder not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reminder deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete reminder",
      });
    }
  };

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
          $project: {
            type: 1,
            reminderTime: 1,
            daysOfWeek: 1,
            isActive: 1,

            task: {
              _id: "$task._id",
              title: "$task.title",
              dueDate: "$task.dueDate",
              status: "$task.status",
            },
          },
        },

        {
          $sort: {
            reminderTime: 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: reminders.length,
        reminders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reminders",
      });
    }
  };
}

module.exports = ReminderController;
