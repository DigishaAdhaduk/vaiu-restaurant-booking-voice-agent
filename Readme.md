# Vaiu Restaurant Booking Voice Agent

A full-stack (MERN-style) voice-enabled AI agent that helps users book restaurant tables through natural conversation. Built for the Vaiu AI Software Developer Internship assignment.

## Features

- Voice-based conversation using the Web Speech API
- Collects:
  - Customer name, phone, email
  - Number of guests
  - Booking date (e.g., "12th December 2025")
  - Booking time (12-hour format, e.g., "7:30 PM")
  - Cuisine preference (Italian, Chinese, Indian, Mexican, Japanese, American, Thai, Mediterranean)
  - Special requests (birthday, anniversary, dietary, etc.)
- Integrates with a Node.js + Express backend and MongoDB
- Fetches real-time weather from OpenWeatherMap via backend
- Suggests indoor or outdoor seating based on weather forecast
- Confirms booking details via voice and UI
- Stores bookings in MongoDB with weather info and status
- Manual overrides:
  - User can type instead of talking
  - User can edit booking fields in the side form

## Tech Stack

- Frontend:
  - HTML, CSS, Vanilla JavaScript
  - Web Speech API (SpeechRecognition + SpeechSynthesis)
- Backend:
  - Node.js, Express
  - MongoDB + Mongoose
  - Axios for HTTP calls
- Weather:
  - OpenWeatherMap 5-day forecast API

## Backend Setup

```bash
cd backend
npm install
