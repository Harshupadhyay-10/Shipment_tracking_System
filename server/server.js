require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const shipmentRoutes = require("./routes/shipmentRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GoBetween Tracker API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", shipmentRoutes);
app.use("/api", userRoutes);
app.use("/api", employeeRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));