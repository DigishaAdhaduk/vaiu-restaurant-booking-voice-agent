import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking,
  getWeather,
  healthCheck
} from "../controllers/bookingController.js";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/weather", getWeather);

router.post("/", createBooking);
router.get("/", getBookings);
router.get("/:id", getBookingById);
router.delete("/:id", deleteBooking);

export default router;
