const express = require("express");
const router = express.Router();
const { registerCustomer, login, setupAdmin } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", registerCustomer);
router.post("/login", authLimiter, login);
router.post("/setup-admin", authLimiter, setupAdmin);

module.exports = router;