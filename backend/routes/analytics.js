import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

router.get("/bookings-per-day", async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$bookingDate", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: data.map((d) => ({ date: d._id, count: d.count }))
    });
  } catch (err) {
    console.error("Analytics bookings-per-day error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/cuisine-popularity", async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$cuisinePreference", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: data.map((d) => ({
        cuisine: d._id || "Unknown",
        count: d.count
      }))
    });
  } catch (err) {
    console.error("Analytics cuisine-popularity error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
