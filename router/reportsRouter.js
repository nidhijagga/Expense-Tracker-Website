const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
router.get("/getReportsPage", reportsController.getReportsPage);
module.exports = router;
