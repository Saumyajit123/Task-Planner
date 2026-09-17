const mongoose = require("mongoose");

const Task = require("../../models/taskModel");
const Category = require("../../models/categoryModel");
const Label = require("../../models/labelModel");

class TaskEJSController {
  // LIST TASKS PAGE
  static listTasks = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.userId);

      const { status, categoryId, labelId, date } = req.query;

      const match = {
        userId,
      };

      if (status) {
        match.status = status;
      }

      if (categoryId) {
        match.categoryId = new mongoose.Types.ObjectId(categoryId);
      }

      if (labelId) {
        match.labels = new mongoose.Types.ObjectId(labelId);
      }

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
      ]);

      const categories = await Category.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      const labels = await Label.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      return res.render("tasks/list", {
        tasks,
        categories,
        labels,
        filters: {
          status,
          categoryId,
          labelId,
          date,
        },
      });
    } catch (error) {
      console.log(error);

      return res.status(500).send("Failed to fetch tasks");
    }
  };

  // CREATE PAGE
  static createTaskPage = async (req, res) => {
    try {
      const categories = await Category.find({
        userId: req.user.userId,
      });

      const labels = await Label.find({
        userId: req.user.userId,
      });

      return res.render("tasks/create", {
        categories,
        labels,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load create task page");
    }
  };

  // CREATE TASK
  static createTask = async (req, res) => {
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
          return res.status(400).send("Invalid category");
        }
      }

      if (labels) {
        const labelCount = await Label.countDocuments({
          _id: {
            $in: labels,
          },
          userId,
        });

        if (labelCount !== labels.length) {
          return res.status(400).send("Invalid label");
        }
      }

      await Task.create({
        userId,
        title,
        description,
        priority,
        dueDate,
        categoryId: categoryId || null,
        labels: labels || [],
        order: order || 0,
      });

      return res.redirect("/ui/tasks");
    } catch (error) {
      console.log(error);

      return res.status(500).send("Failed to create task");
    }
  };

  // EDIT PAGE
  static editTaskPage = async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Task.findOne({
        _id: taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).send("Task not found");
      }

      const categories = await Category.find({
        userId: req.user.userId,
      });

      const labels = await Label.find({
        userId: req.user.userId,
      });

      return res.render("tasks/edit", {
        task,
        categories,
        labels,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load task");
    }
  };

  // EDIT TASK
  static editTask = async (req, res) => {
    try {
      const { taskId } = req.params;

      const userId = req.user.userId;

      const task = await Task.findOne({
        _id: taskId,
        userId,
      });

      if (!task) {
        return res.status(404).send("Task not found");
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
          return res.status(400).send("Invalid category");
        }
      }

      task.title = title;
      task.description = description;
      task.priority = priority;
      task.dueDate = dueDate;
      task.categoryId = categoryId || null;
      task.labels = labels || [];

      if (order !== undefined) {
        task.order = order;
      }

      if (status) {
        task.status = status;

        task.completedAt = status === "Completed" ? new Date() : null;
      }

      await task.save();

      return res.redirect("/ui/tasks");
    } catch (error) {
      return res.status(500).send("Failed to update task");
    }
  };

  // DELETE TASK
  static deleteTask = async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Task.findOneAndDelete({
        _id: taskId,
        userId: req.user.userId,
      });

      if (!task) {
        return res.status(404).send("Task not found");
      }

      return res.redirect("/ui/tasks");
    } catch (error) {
      return res.status(500).send("Failed to delete task");
    }
  };

  // COMPLETE TASK
  static completeTask = async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          userId: req.user.userId,
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
        return res.status(404).send("Task not found");
      }

      return res.redirect("/ui/tasks");
    } catch (error) {
      return res.status(500).send("Failed to complete task");
    }
  };

  // REORDER
  static reorderTask = async (req, res) => {
    try {
      const { taskId } = req.params;

      const { order } = req.body;

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          userId: req.user.userId,
        },
        {
          order,
        },
        {
          new: true,
        },
      );

      if (!task) {
        return res.status(404).send("Task not found");
      }

      return res.redirect("/ui/tasks");
    } catch (error) {
      return res.status(500).send("Failed to reorder task");
    }
  };
}

module.exports = TaskEJSController;
