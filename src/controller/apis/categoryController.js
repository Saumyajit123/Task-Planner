const Category = require("../../models/categoryModel");
const Task = require("../../models/taskModel");

class CategoryController {
  // ADD CATEGORY
  static addCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
      const userId = req.user.userId;

      const existing = await Category.findOne({
        userId,
        name,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      const category = await Category.create({
        userId,
        name,
        description,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create category",
      });
    }
  };

  // EDIT CATEGORY
  static editCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const userId = req.user.userId;

      const category = await Category.findOneAndUpdate(
        {
          _id: categoryId,
          userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update category",
      });
    }
  };

  // DELETE CATEGORY
  static deleteCategory = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const userId = req.user.userId;

      const category = await Category.findOneAndDelete({
        _id: categoryId,
        userId,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Remove category from associated tasks
      await Task.updateMany(
        {
          userId,
          categoryId,
        },
        {
          $set: {
            categoryId: null,
          },
        },
      );

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete category",
      });
    }
  };

  // LIST CATEGORIES
  static listCategories = async (req, res) => {
    try {
      const categories = await Category.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      });
    }
  };
}

module.exports = CategoryController;
