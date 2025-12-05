import Booking from "../models/Booking.js";
import { getWeatherForDate } from "../services/weatherService.js";
import { sendBookingConfirmationEmail } from "../services/emailService.js";

const TOTAL_TABLES = parseInt(process.env.TOTAL_TABLES || "10", 10);

function generateBookingId() {
  const num = Math.floor(Math.random() * 10000);
  return "VAIU-" + String(num).padStart(4, "0");
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 11; h <= 23; h++) {
    for (let m of [0, 30]) {
      if (h === 23 && m === 30) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

async function findAlternativeSlots(bookingDate, currentTime) {
  const slots = generateTimeSlots();
  const startIndex = Math.max(slots.indexOf(currentTime), 0);
  const candidates = [
    ...slots.slice(startIndex + 1),
    ...slots.slice(0, startIndex)
  ];

  const suggestions = [];
  for (const time of candidates) {
    const count = await Booking.countDocuments({
      bookingDate,
      bookingTime: time,
      status: { $ne: "cancelled" }
    });

    if (count < TOTAL_TABLES) {
      suggestions.push(time);
      if (suggestions.length >= 3) break;
    }
  }
  return suggestions;
}

export const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      phoneNumber,
      email,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      seatingPreference,
      specialRequests
    } = req.body;

    if (!bookingDate || !bookingTime) {
      return res.status(400).json({
        success: false,
        message: "bookingDate and bookingTime are required"
      });
    }

    const existingBookings = await Booking.find({
      bookingDate,
      bookingTime,
      status: { $ne: "cancelled" }
    }).sort({ createdAt: 1 });

    if (existingBookings.length >= TOTAL_TABLES) {
      const suggestions = await findAlternativeSlots(bookingDate, bookingTime);
      return res.status(409).json({
        success: false,
        code: "FULLY_BOOKED",
        message:
          "All tables are already booked for this date and time. Please choose another time.",
        suggestions
      });
    }

    const tableNumber = existingBookings.length + 1;

    const location = process.env.DEFAULT_LOCATION || "Delhi,IN";
    const weatherInfo = await getWeatherForDate(bookingDate, location);

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      customerName,
      phoneNumber,
      email,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      seatingPreference,
      specialRequests,
      weatherInfo,
      tableNumber,
      status: "confirmed"
    });

    sendBookingConfirmationEmail(booking).catch(() => {});

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (err) {
    console.error("Get booking by id error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.id },
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWeather = async (req, res) => {
  try {
    const { date, location } = req.query;
    const loc = location || process.env.DEFAULT_LOCATION || "Delhi,IN";
    const weather = await getWeatherForDate(date, loc);
    res.json(weather);
  } catch (err) {
    console.error("Get weather error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const healthCheck = async (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    uptime: process.uptime()
  });
};
