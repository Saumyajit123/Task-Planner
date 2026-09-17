const Category = require("../../models/categoryModel");
const Task = require("../../models/taskModel");

class CategoryEJSController {
  // LIST
  static listCategories = async (req, res) => {
    try {
      const categories = await Category.find({
        userId: req.user.userId,
      }).sort({
        name: 1,
      });

      return res.render("categories/list", {
        categories,
      });
    } catch (error) {
      return res.status(500).send("Failed to fetch categories");
    }
  };

  // CREATE PAGE
  static createPage = async (req, res) => {
    return res.render("categories/create", {
      error: null,
    });
  };

  // CREATE
  static createCategory = async (req, res) => {
    try {
      const { name, description } = req.body;

      const existing = await Category.findOne({
        userId: req.user.userId,
        name,
      });

      if (existing) {
        return res.status(409).render("categories/create", {
          error: "Category already exists",
        });
      }

      await Category.create({
        userId: req.user.userId,
        name,
        description,
      });

      return res.redirect("/ui/categories");
    } catch (error) {
      return res.status(500).send("Failed to create category");
    }
  };

  // EDIT PAGE
  static editPage = async (req, res) => {
    try {
      const category = await Category.findOne({
        _id: req.params.categoryId,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(404).send("Category not found");
      }

      return res.render("categories/edit", {
        category,
        error: null,
      });
    } catch (error) {
      return res.status(500).send("Failed to load category");
    }
  };

  // EDIT
  static editCategory = async (req, res) => {
    try {
      const category = await Category.findOneAndUpdate(
        {
          _id: req.params.categoryId,
          userId: req.user.userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!category) {
        return res.status(404).send("Category not found");
      }

      return res.redirect("/ui/categories");
    } catch (error) {
      return res.status(500).send("Failed to update category");
    }
  };

  // DELETE
  static deleteCategory = async (req, res) => {
    try {
      const category = await Category.findOneAndDelete({
        _id: req.params.categoryId,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(404).send("Category not found");
      }

      await Task.updateMany(
        {
          userId: req.user.userId,
          categoryId: req.params.categoryId,
        },
        {
          $set: {
            categoryId: null,
          },
        },
      );

      return res.redirect("/ui/categories");
    } catch (error) {
      return res.status(500).send("Failed to delete category");
    }
  };
}

module.exports = CategoryEJSController;
