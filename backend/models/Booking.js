import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true
    },
    customerName: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    numberOfGuests: {
      type: Number,
      required: true
    },
    bookingDate: {
      type: String,
      required: true
    },
    bookingTime: {
      type: String,
      required: true
    },
    cuisinePreference: {
      type: String,
      required: true
    },
    specialRequests: {
      type: String,
      default: ""
    },
    weatherInfo: {
      type: Object,
      default: null
    },
    seatingPreference: {
      type: String,
      enum: ["indoor", "outdoor"],
      required: true
    },
    tableNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed"
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
