const User = require("../models/User");

const createEmployee = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "Name, email, password, phone and address are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const employee = await User.create({
      name, email, password, phone, address, role: "employee",
    });

    res.status(201).json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create employee", error: err.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" }).select("-password").sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch employees", error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: "employee" });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await employee.deleteOne();
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete employee", error: err.message });
  }
};

module.exports = { createEmployee, getAllEmployees, deleteEmployee };