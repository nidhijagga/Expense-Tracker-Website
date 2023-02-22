const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.use(express.static("public"));

router.get("/", userController.getLoginPage);
router.post("/login", userController.postUserLogin);
router.post("/signUp", userController.postUserSignUp);

module.exports = router;
