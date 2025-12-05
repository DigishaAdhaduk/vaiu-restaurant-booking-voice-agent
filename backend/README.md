**Backend – Vaiu Restaurant Booking Agent**

Node.js + Express backend powering:

Bookings API

Weather API integration

Email service

Table availability engine

Admin analytics

📁 Folder Structure
index.js
config/database.js
controllers/bookingController.js
models/Booking.js
routes/bookings.js
services/
   ├── weatherService.js
   ├── emailService.js
   ├── availabilityService.js
utils/
   └── bookingIdGenerator.js

🔌 API Routes

Full documentation here:
👉 docs/API_REFERENCE.md

▶️ Running the Backend
npm install
npm run dev


Environment variables found in .env:

PORT=
MONGODB_URI=
WEATHER_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
