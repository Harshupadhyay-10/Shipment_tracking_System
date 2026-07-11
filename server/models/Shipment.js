const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    location: { type: String },
    note: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const partySchema = {
  name: { type: String, required: true },
  countryCode: { type: String, required: true, default: "+91" },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
};

const shipmentSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },
    sender: partySchema,
    receiver: partySchema,

    mode: {
      type: String,
      enum: ["Air", "Road", "Sea"],
      required: true,
      default: "Road",
      },
      clientName: { type: String, required: true },
      consignee: { type: String, required: true },

    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
      },
    
    packageDetails: {
      weight: { type: Number },
      weightUnit: { type: String, enum: ["kg", "g", "lb"], default: "kg" },
      numberOfPackages: { type: Number},
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      sizeUnit: { type: String, enum: ["cm", "in"], default: "cm" },
      description: { type: String },
      buyingRate: { type: Number },
      sellingRate: { type: Number },
    },

    currentStatus: {
      type: String,
      enum: ["Pending", "Picked Up", "In Transit", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },

    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);