const express = require("express");
const router = express.Router();

const CategoryEJSController = require("../../controller/ejs/categoryEJSController");

const Validation = require("../../validate/validation");

const CategoryValidation = require("../../validate/categorySchema");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");
router.use(authEJSMiddleware);

router.get("/", CategoryEJSController.listCategories);

router.get("/create", CategoryEJSController.createPage);

router.post(
  "/create",
  Validation.validate(CategoryValidation.create),
  CategoryEJSController.createCategory,
);

router.get("/edit/:categoryId", CategoryEJSController.editPage);

router.post(
  "/edit/:categoryId",
  Validation.validate(CategoryValidation.update),
  CategoryEJSController.editCategory,
);

router.post("/delete/:categoryId", CategoryEJSController.deleteCategory);

module.exports = router;
