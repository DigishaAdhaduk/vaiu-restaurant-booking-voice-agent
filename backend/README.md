# ⚙️ Backend – Vaiu Restaurant Booking Voice Agent

This directory contains the Node.js and Express backend that powers the voice-based restaurant booking system.

---

## 🚀 Responsibilities

- Booking creation and management APIs
- Table availability and conflict prevention logic
- Weather API integration for seating recommendations
- Email booking confirmation using SMTP
- Admin analytics and reporting

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- REST APIs
- SMTP Email Service
- External Weather API

---

## ▶️ Running the Backend

Install dependencies:
npm install

Start the development server:
npm run dev

---

## 🔐 Environment Variables

Create a `.env` file with the following variables:

PORT=
MONGODB_URI=
WEATHER_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

---

## ✨ Architecture Notes

- Service-based architecture
- Clear separation of concerns
- Designed for scalability and easy extension
