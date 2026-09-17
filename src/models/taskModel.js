const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  priority: {
    type: String,
    required: [true, "Priority is required"],
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },

  dueDate: {
    type: Date,
    required: [true, "Due date is required"],
  },

  status: {
    type: String,
    required: [true, "Status is required"],
    enum: ["Pending, Completed"],
    default: "Pending",
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },

  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Label",
    },
  ],

  order: {
    type: Number,
    default: 0,
  },

  completedAt: {
    type: Date,
    default: null,
  },
},
{
    timestamps: true,
}
);


const TaskModel = mongoose.model("Task", taskSchema);

module.exports = TaskModel;
