const express = require("express");

const ReportController = require("../../controller/apis/reportController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  ReportController.taskSummary
);

router.get(
  "/statistics",
  authMiddleware,
  ReportController.taskStatistics
);

router.get(
  "/completion-over-time",
  authMiddleware,
  ReportController.completionOverTime
);

module.exports = router;