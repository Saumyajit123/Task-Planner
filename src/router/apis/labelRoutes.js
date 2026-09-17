const express = require("express");

const LabelController = require("../../controller/apis/labelController");
const authMiddleware = require("../../middleware/authMiddleware");
const Validation = require("../../validate/validation");
const LabelValidation = require("../../validate/labelSchema");

const router = express.Router();


router.post(
  "/addlabel",
  authMiddleware,
  Validation.validate(LabelValidation.create),
  LabelController.addLabel
);

router.put(
  "/edit/:labelId",
  authMiddleware,
  Validation.validate(LabelValidation.update),
  LabelController.editLabel
);

router.delete(
  "/delete/:labelId",
  authMiddleware,
  LabelController.deleteLabel
);

router.get(
  "/labellist",
  authMiddleware,
  LabelController.listLabels
);

module.exports = router;