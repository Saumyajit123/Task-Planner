const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    type: {
      type: String,
      enum: ["once", "daily", "weekly"],
      default: "once",
    },

    reminderTime: {
      type: Date,
      required: true,
    },

    daysOfWeek: [
      {
        type: Number,
        min: 0,
        max: 6,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const RemindelModel = mongoose.model("Reminder", ReminderSchema);

module.exports = RemindelModel;
