const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Public signup, always creates a customer account.
// Admin accounts are created once through the /setup-admin route, then that route locks itself forever.
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, address, companyName } = req.body;

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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      companyName: companyName || "",
      role: "customer",
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${minutesLeft} minute(s)` });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minute lock
        user.failedLoginAttempts = 0;
      }

      await user.save();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Successful login clears any prior failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      companyName: user.companyName,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// One-time admin creation. Only works if no admin exists yet AND the caller
// provides the correct SETUP_SECRET. Once an admin exists, this always fails,
// permanently, so it can never be used again even if someone finds the URL.
const setupAdmin = async (req, res) => {
  try {
    const { setupSecret, name, email, password, phone, address } = req.body;

    if (!setupSecret || setupSecret !== process.env.SETUP_SECRET) {
      return res.status(403).json({ message: "Invalid setup secret" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ message: "An admin account already exists, setup is locked" });
    }

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "Name, email, password, phone and address are required" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      companyName: "Go Between India Logistics",
      role: "admin",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Admin setup failed", error: err.message });
  }
};

module.exports = { registerCustomer, login, setupAdmin };