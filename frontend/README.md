# 🎨 Frontend – Vaiu Restaurant Booking Voice Agent

This directory contains the voice-enabled frontend UI for booking restaurant tables using natural conversation.

---

## 🎙 Voice Agent

The frontend uses the Web Speech API to provide:

- Speech-to-Text for capturing user input
- Text-to-Speech for agent responses
- Auto-continuation of conversation
- Ability to repeat the last agent response
- Error handling with retry prompts (e.g., “Say that again…”)

---

## 🧠 Intelligent UX

- Automatically fills booking form fields from voice input
- Allows users to manually correct any field
- Chat-style UI showing both user and agent messages
- Booking confirmation displayed as a card
- Clean white UI with fully responsive design

---

## 📁 File Structure

frontend/
│
├── index.html    # Main voice-enabled booking UI
├── app.js        # Voice logic and conversation engine
├── admin.html    # Admin dashboard UI
└── style.css     # UI styling (if used)

---

## ▶️ Running the Frontend

No installation or build steps required.

Open directly in the browser:
frontend/index.html

For best speech recognition performance, use **Google Chrome**.
