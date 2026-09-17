const express = require("express");
const router = express.Router();

const LabelEJSController = require("../../controller/ejs/labelEJSController");

const Validation = require("../../validate/validation");

const LabelValidation = require("../../validate/labelSchema");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");
router.use(authEJSMiddleware);



router.get("/", LabelEJSController.listLabels);

router.get("/create", LabelEJSController.createPage);

router.post(
  "/create",
  Validation.validate(LabelValidation.create),
  LabelEJSController.createLabel,
);

router.get("/edit/:labelId", LabelEJSController.editPage);

router.post(
  "/edit/:labelId",
  Validation.validate(LabelValidation.update),
  LabelEJSController.editLabel,
);

router.post("/delete/:labelId", LabelEJSController.deleteLabel);

module.exports = router;
