const express = require("express");
const router = express.Router();
const { getAllCustomers } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/users", protect, adminOnly, getAllCustomers);

module.exports = router;