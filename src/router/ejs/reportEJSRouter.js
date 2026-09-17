const express = require("express");
const router = express.Router();

const ReportEJSController = require("../../controller/ejs/reportEJSController");

const authEJSMiddleware = require("../../middleware/authEJSMiddleware");
router.use(authEJSMiddleware);

router.get("/summary", ReportEJSController.summary);

router.get("/statistics", ReportEJSController.statistics);

router.get("/completion", ReportEJSController.completionOverTime);

module.exports = router;
