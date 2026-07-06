require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@gobetween.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  await User.create({
    name: "Go Between Admin",
    email: "admin@gobetween.com",
    password: "ChangeThisPassword123",
    phone: "0000000000",
    address: "Go Between India Logistics HQ",
    companyName: "Go Between India Logistics",
    role: "admin",
  });

  console.log("Admin account created");
  process.exit();
};

createAdmin();