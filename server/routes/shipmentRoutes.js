const express = require("express");
const router = express.Router();
const {
  createShipment,
  getAllShipments,
  updateShipmentStatus,
  updateShipmentDetails,
  trackShipment,
} = require("../controllers/shipmentController");
const { protect, employeeOrAdmin } = require("../middleware/auth");

router.post("/shipments", protect, employeeOrAdmin, createShipment);
router.get("/shipments", protect, employeeOrAdmin, getAllShipments);
router.patch("/shipments/:trackingNumber/status", protect, employeeOrAdmin, updateShipmentStatus);
router.patch("/shipments/:trackingNumber", protect, employeeOrAdmin, updateShipmentDetails);

router.get("/track/:trackingNumber", trackShipment);

module.exports = router;