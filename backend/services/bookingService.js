import Booking from '../models/Booking.js';
import { getWeatherForDate, generateWeatherSuggestion } from './weatherService.js';

// Create a new booking
const createBooking = async (bookingData) => {
  try {
    // Fetch weather information
    const weatherInfo = await getWeatherForDate(bookingData.bookingDate);
    const weatherSuggestion = generateWeatherSuggestion(weatherInfo);

    const booking = new Booking({
      ...bookingData,
      weatherInfo,
      weatherSuggestion
    });

    await booking.save();
    return booking;
  } catch (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }
};

// Get all bookings
const getAllBookings = async () => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return bookings;
  } catch (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }
};

// Get booking by ID
const getBookingById = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (error) {
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }
};

// Update booking
const updateBooking = async (bookingId, updateData) => {
  try {
    const booking = await Booking.findByIdAndUpdate(bookingId, updateData, {
      new: true,
      runValidators: true
    });
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (error) {
    throw new Error(`Failed to update booking: ${error.message}`);
  }
};

// Cancel booking
const cancelBooking = async (bookingId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
};

// Confirm booking
const confirmBooking = async (bookingId) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true }
    );
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  } catch (error) {
    throw new Error(`Failed to confirm booking: ${error.message}`);
  }
};

// Get bookings by date
const getBookingsByDate = async (date) => {
  try {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      bookingDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ bookingTime: 1 });

    return bookings;
  } catch (error) {
    throw new Error(`Failed to fetch bookings by date: ${error.message}`);
  }
};

export {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getBookingsByDate
};
