const express = require("express");
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  updateShipmentStatus,
  trackShipment,
} = require("../controllers/shipmentController");
const { protect, adminOnly } = require("../middleware/auth");

// Admin-only routes
router.post("/shipments", protect, adminOnly, createShipment);
router.get("/shipments", protect, adminOnly, getAllShipments);
router.patch("/shipments/:trackingNumber/status", protect, adminOnly, updateShipmentStatus);

// Public route, no login required
router.get("/track/:trackingNumber", trackShipment);

module.exports = router;