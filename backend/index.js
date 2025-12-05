import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDatabase from "./config/database.js";
import bookingsRouter from "./routes/bookings.js";
import analyticsRouter from "./routes/analytics.js";

dotenv.config();
connectDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Restaurant Booking Voice Agent API",
    version: "1.0.0",
    endpoints: {
      health: "/api/bookings/health",
      weather: "/api/bookings/weather",
      bookings: "/api/bookings",
      analyticsBookingsPerDay: "/api/analytics/bookings-per-day",
      analyticsCuisine: "/api/analytics/cuisine-popularity"
    }
  });
});

app.use("/api/bookings", bookingsRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
