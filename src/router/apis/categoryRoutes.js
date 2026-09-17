const express = require("express");

const CategoryController = require("../../controller/apis/categoryController");
const authMiddleware = require("../../middleware/authMiddleware");
const Validation = require("../../validate/validation");
const CategoryValidation = require("../../validate/categorySchema");

const router = express.Router();


router.post(
  "/addcategory",
  authMiddleware,
  Validation.validate(CategoryValidation.create),
  CategoryController.addCategory
);

router.put(
  "/edit/:categoryId",
  authMiddleware,
  Validation.validate(CategoryValidation.update),
  CategoryController.editCategory
);

router.delete(
  "/delete/:categoryId",
  authMiddleware,
  CategoryController.deleteCategory
);

router.get(
  "/categorylist",
  authMiddleware,
  CategoryController.listCategories
);

module.exports = router;