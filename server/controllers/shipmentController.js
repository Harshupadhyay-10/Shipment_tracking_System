const Shipment = require("../models/Shipment");
const generateTrackingNumber = require("../utils/generateTrackingNumber");
const sendEmail = require("../utils/sendEmail");

// @desc   Create a new shipment (admin)
// @route  POST /api/shipments
const createShipment = async (req, res) => {
  try {
    const { sender, receiver, packageDetails, mode, clientName, consignee } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Sender and receiver details are required" });
    }

    if (!mode || !clientName || !consignee) {
      return res.status(400).json({ message: "Mode, client name, and consignee are required" });
    }

    const createdBy = {
      id: req.user.id,
      name: req.user.name || req.user.email,
      email: req.user.email,
    };

    let trackingNumber;
    let exists = true;
    while (exists) {
      trackingNumber = generateTrackingNumber(mode);
      exists = await Shipment.findOne({ trackingNumber });
    }

    const shipment = await Shipment.create({
      trackingNumber,
      mode,
      clientName,
      consignee,
      sender,
      receiver,
      packageDetails,
      createdBy,
      currentStatus: "Pending",
      statusHistory: [{ status: "Pending", note: "Shipment created" }],
    });

    if (receiver.email) {
      const trackingLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/track/${trackingNumber}`;

      sendEmail({
        to: receiver.email,
        subject: `Your shipment is on its way, Tracking Number ${trackingNumber}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <h2 style="color: #1B4B7A;">Go Between India Logistics</h2>
            <p>Hi ${receiver.name},</p>
            <p>A shipment from <strong>${sender.name}</strong> has been booked for you.</p>
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p>
              <a href="${trackingLink}" style="background: #1B4B7A; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Shipment
              </a>
            </p>
            <p style="color: #555; font-size: 14px;">
              You can also create a free account to view all your shipments in one place at any time.
            </p>
          </div>
        `,
      });
    }

    res.status(201).json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Failed to create shipment", error: err.message });
  }
};

// @desc   Get all shipments (admin)
// @route  GET /api/shipments
const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shipments", error: err.message });
  }
};

// @desc   Update shipment status (admin)
// @route  PATCH /api/shipments/:trackingNumber/status
const updateShipmentStatus = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, location, note } = req.body;

    const validStatuses = ["Pending", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.currentStatus = status;
    shipment.statusHistory.push({ status, location, note });
    await shipment.save();

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
};

// @desc   Public tracking lookup (customer) — only exposes safe fields
// @route  GET /api/track/:trackingNumber
const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({ trackingNumber }).select(
      "trackingNumber mode currentStatus statusHistory createdAt sender.city receiver.city"
    );

    if (!shipment) {
      return res.status(404).json({ message: "No shipment found with this tracking number" });
    }

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tracking info", error: err.message });
  }
};

// @desc   Update shipment details (admin/employee), separate from status updates
// @route  PATCH /api/shipments/:trackingNumber
const updateShipmentDetails = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { sender, receiver, mode, clientName, consignee, packageDetails } = req.body;

    const shipment = await Shipment.findOne({ trackingNumber });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (sender) shipment.sender = sender;
    if (receiver) shipment.receiver = receiver;
    if (mode) shipment.mode = mode;
    if (clientName) shipment.clientName = clientName;
    if (consignee) shipment.consignee = consignee;
    if (packageDetails) shipment.packageDetails = packageDetails;

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Failed to update shipment", error: err.message });
  }
};


module.exports = {
  createShipment,
  getAllShipments,
  updateShipmentStatus,
  updateShipmentDetails,
  trackShipment,
};