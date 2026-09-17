const mongoose = require("mongoose");

const Task = require("../../models/taskModel");
const Category = require("../../models/categoryModel");
const Label = require("../../models/labelModel");

class TaskController {
  // Add Task
  static addTask = async (req, res) => {
    try {
      const userId = req.user.userId;

      const {
        title,
        description,
        priority,
        dueDate,
        categoryId,
        labels,
        order,
      } = req.body;

      if (categoryId) {
        const category = await Category.findOne({
          _id: categoryId,
          userId,
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Invalid category",
          });
        }
      }

      //Validate labels belong to user:
      if (labels && labels.length > 0) {
        const labelCount = await Label.countDocuments({
          _id: {
            $in: labels,
          },
          userId,
        });

        if (labelCount !== labels.length) {
          return res.status(400).json({
            success: false,
            message: "One or more labels are invalid",
          });
        }
      }

      const task = await Task.create({
        userId,
        title,
        description,
        priority,
        dueDate,
        categoryId: categoryId || null,
        labels: labels || [],
        order: order || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error.message,
      });
    }
  };

  // Update task:
  static editTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID",
        });
      }

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

      const {
        title,
        description,
        priority,
        dueDate,
        categoryId,
        labels,
        order,
        status,
      } = req.body;

      if (categoryId) {
        const category = await Category.findOne({
          _id: categoryId,
          userId,
        });

        if (!category) {
          return res.status(400).json({
            success: false,
            message: "Invalid category",
          });
        }
      }

      if (labels) {
        const labelCount = await Label.countDocuments({
          _id: {
            $in: labels,
          },
          userId,
        });

        if (labelCount !== label.length) {
          return res.status(400).json({
            success: false,
            message: "Invalid label",
          });
        }
      }

      if (title !== undefined) {
        task.title = title;
      }

      if (description !== undefined) {
        task.description = description;
      }

      if (priority !== undefined) {
        task.priority = priority;
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate;
      }

      if (labels !== undefined) {
        task.labels = labels;
      }

      if (categoryId !== undefined) {
        task.categoryId = categoryId;
      }

      if (order !== undefined) {
        task.order = order;
      }

      if (status !== undefined) {
        task.status = status;

        if (status === "completed") {
          task.completedAt = new Date();
        } else {
          task.completedAt = null;
        }
      }

      await task.save();

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update task",
      });
    }
  };

  // Delete Task:
  static deleteTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      const task = await Task.findByIdAndDelete({
        _id: taskId,
        userId,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete task",
      });
    }
  };

  // Complete task:
  static completeTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          userId,
        },
        {
          status: "Completed",
          completedAt: new Date(),
        },
        {
          new: true,
        },
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task marked as completed",
        task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to complete task",
      });
    }
  };

  // List tasks:
  static listTasks = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const { status, categoryId, labelId, date } = req.query;

      const match = { userId };

      if (status) {
        match.status = status;
      }

      if (categoryId) {
        match.categoryId = new mongoose.Types.ObjectId(categoryId);
      }

      if (labelId) {
        match.labels = new mongoose.Types.ObjectId(labelId);
      }

      // Today/ tomorrow/ week:
      if (date) {
        const now = new Date();

        let start;
        let end;

        if (date === "today") {
          start = new Date(now);
          start.setHours(0, 0, 0, 0);

          end = new Date(start);
          end.setDate(end.getDate() + 1);
        }

        if (date === "tomorrow") {
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          start.setDate(start.getDate() + 1);

          end = new Date(start);
          end.setDate(end.getDate() + 1);
        }

        if (date === "week") {
          start = new Date(now);
          start.setHours(0, 0, 0, 0);

          const day = start.getDay();

          start.setDate(start.getDate() - day);

          end = new Date(start);
          end.setDate(end.getDate() + 7);
        }

        if (start && end) {
          match.dueDate = {
            $gte: start,
            $lt: end,
          };
        }
      }

      const tasks = await Task.aggregate([
        {
          $match: match,
        },

        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },

        {
          $lookup: {
            from: "labels",
            localField: "labels",
            foreignField: "_id",
            as: "labels",
          },
        },

        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $sort: {
            order: 1,
            dueDate: 1,
          },
        },

        {
          $project: {
            title: 1,
            description: 1,
            priority: 1,
            dueDate: 1,
            status: 1,
            order: 1,
            completedAt: 1,
            createdAt: 1,
            category: {
              _id: "$category._id",
              name: "$category.name",
              description: "$category.description",
            },
            labels: {
              _id: 1,
              name: 1,
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
      });
    }
  };

  //Reorder tasks:
  static reorderTask = async (req, res) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;
      const { order } = req.body;

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          userId,
        },
        {
          order,
        },
        {
          new: true,
        },
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Task reordered successfully",
        task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to reorder task",
      });
    }
  };
}

module.exports = TaskController;
