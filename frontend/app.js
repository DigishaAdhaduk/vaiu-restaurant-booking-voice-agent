function parseSpokenDate(text) {
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12
  };
  if (!text) return null;
  const clean = text
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/(\d+)(st|nd|rd|th)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const parts = clean.split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const monthName = parts[1];
  const year = parseInt(parts[2]);
  const month = months[monthName];
  if (!day || !month || !year) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function formatPrettyDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";
  return `${day}${suffix} ${month} ${year}`;
}

function parseSpokenTime(text) {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/\s+/g, "");
  const match = clean.match(/(\d{1,2}):(\d{2})(am|pm)?/);
  if (!match) return null;
  let [, h, m, ap] = match;
  let hour = parseInt(h);
  const min = parseInt(m);
  if (min < 0 || min > 59 || hour < 0 || hour > 23) return null;
  if (ap === "pm" && hour !== 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formatPrettyTime(time) {
  if (!time || !time.includes(":")) return time || "";
  const [h, m] = time.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

function inferGuestsFromText(input) {
  const text = input.toLowerCase();
  const match = text.match(/(\d+)\s*(people|persons|guests|log|logo)/);
  if (match) return parseInt(match[1]);
  const any = text.match(/(\d+)/);
  return any ? parseInt(any[1]) : null;
}

function inferRelativeDate(input) {
  const text = input.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const addDays = (d) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    return dt;
  };
  let target = null;
  if (text.includes("today")) target = addDays(0);
  else if (text.includes("kal") || text.includes("tomorrow")) target = addDays(1);
  else if (text.includes("day after") || text.includes("parso")) target = addDays(2);
  if (!target) return null;
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function inferTimeFromWords(input) {
  const text = input.toLowerCase();
  if (text.includes("morning")) return "10:00";
  if (text.includes("afternoon")) return "14:00";
  if (text.includes("evening") || text.includes("shaam")) return "19:00";
  if (text.includes("night") || text.includes("raat")) return "20:00";
  return null;
}

function applySentimentTone(reply, input) {
  const text = input.toLowerCase();
  if (text.includes("birthday")) {
    return "That sounds like a lovely birthday celebration. " + reply;
  }
  if (text.includes("anniversary")) {
    return "Happy anniversary in advance. " + reply;
  }
  if (
    text.includes("stressed") ||
    text.includes("tension") ||
    text.includes("nervous") ||
    text.includes("worried")
  ) {
    return "I understand this is important for you. I will make it easy. " + reply;
  }
  if (text.includes("first time")) {
    return "I am glad you are trying this. " + reply;
  }
  return reply;
}

class VoiceHandler {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = SR ? new SR() : null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.transcript = "";
    this.onFinalCallback = null;
    if (!this.recognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    this.recognition.lang = "en-US";
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.onstart = () => {
      this.isListening = true;
      this.transcript = "";
      const s = document.getElementById("voiceStatus");
      if (s) s.textContent = "Listening...";
      const btn = document.getElementById("voiceBtn");
      if (btn) btn.classList.add("listening");
    };
    this.recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) this.transcript += t + " ";
        else interim += t;
      }
      const el = document.getElementById("transcriptText");
      if (el) el.textContent = this.transcript + interim;
    };
    this.recognition.onerror = () => {
      this.isListening = false;
      const s = document.getElementById("voiceStatus");
      if (s) s.textContent = "Click Listen to start speaking";
      const btn = document.getElementById("voiceBtn");
      if (btn) btn.classList.remove("listening");
    };
    this.recognition.onend = () => {
      this.isListening = false;
      const s = document.getElementById("voiceStatus");
      if (s) s.textContent = "Click Listen to start speaking";
      const btn = document.getElementById("voiceBtn");
      if (btn) btn.classList.remove("listening");
      const finalText = this.transcript.trim();
      if (finalText && this.onFinalCallback) {
        this.onFinalCallback(finalText);
      }
    };
  }

  startListening() {
    if (!this.recognition || this.isListening) return;
    this.transcript = "";
    const t = document.getElementById("transcriptText");
    if (t) t.textContent = "";
    this.recognition.start();
  }

  speak(text) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) return reject("Speech synthesis not available");
      this.synthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.onend = resolve;
      u.onerror = reject;
      this.synthesis.speak(u);
    });
  }

  onFinal(callback) {
    this.onFinalCallback = callback;
  }

  clearTranscript() {
    this.transcript = "";
    const t = document.getElementById("transcriptText");
    if (t) t.textContent = "";
  }

  isSupported() {
    return !!this.recognition;
  }
}

class BookingManager {
  constructor(apiBaseUrl = "http://localhost:5001/api") {
    this.apiBaseUrl = apiBaseUrl;
    this.steps = [
      "name",
      "phone",
      "email",
      "guests",
      "date",
      "time",
      "seating",
      "cuisine",
      "specialRequests",
      "confirmation"
    ];
    this.bookingData = {};
    this.conversationStep = 0;
    this.lastResponse = "";
  }

  addChatMessage(text, isAgent = true) {
    const log = document.getElementById("chatLog");
    if (!log) return;
    const div = document.createElement("div");
    div.className = `message ${isAgent ? "agent-message" : "user-message"}`;
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    if (isAgent) this.lastResponse = text;
  }

  syncFromForm() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || "";
    const name = getVal("customerName");
    const phone = getVal("phoneNumber");
    const email = getVal("email");
    const guests = getVal("numberOfGuests");
    const date = getVal("bookingDate");
    const time = getVal("bookingTime");
    const cuisine = getVal("cuisinePreference");
    const seating = getVal("seatingPreference");
    const special = getVal("specialRequests");
    if (name) this.bookingData.customerName = name;
    if (phone) this.bookingData.phoneNumber = phone;
    if (email) this.bookingData.email = email;
    if (guests) this.bookingData.numberOfGuests = parseInt(guests, 10);
    if (date) this.bookingData.bookingDate = date;
    if (time) this.bookingData.bookingTime = time;
    if (cuisine) this.bookingData.cuisinePreference = cuisine;
    if (seating) this.bookingData.seatingPreference = seating;
    this.bookingData.specialRequests = special;
  }

  async getAgentResponse(input) {
    const originalInput = input;
    const step = this.steps[this.conversationStep];
    let reply = "";
    let ok = false;

    if (step === "name") {
      if (input.length > 2) {
        this.bookingData.customerName = input;
        const f = document.getElementById("customerName");
        if (f) f.value = input;
        reply = `Nice to meet you, ${input}. What is your phone number?`;
        ok = true;
      } else {
        reply = "Please tell me your name again.";
      }
    } else if (step === "phone") {
      if (/^\d{10,}/.test(input.replace(/\D/g, ""))) {
        this.bookingData.phoneNumber = input;
        const f = document.getElementById("phoneNumber");
        if (f) f.value = input;
        reply = "Great. What is your email address?";
        ok = true;
      } else {
        reply = "That does not look like a valid phone number. Please repeat it.";
      }
    } else if (step === "email") {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        this.bookingData.email = input;
        const f = document.getElementById("email");
        if (f) f.value = input;
        reply = "Thanks. How many guests are coming?";
        ok = true;
      } else {
        reply = "Please say a valid email address.";
      }
    } else if (step === "guests") {
      let g = parseInt(input, 10);
      if (!g || g <= 0) {
        g = inferGuestsFromText(input);
      }
      if (g && g > 0 && g <= 20) {
        this.bookingData.numberOfGuests = g;
        const f = document.getElementById("numberOfGuests");
        if (f) f.value = g;
        reply =
          "Perfect. On which date would you like to book? For example: 12th December 2025, or you can say tomorrow.";
        ok = true;
      } else {
        reply =
          "Please tell me how many guests are coming, for example table for 4 people.";
      }
    } else if (step === "date") {
      let iso = parseSpokenDate(input);
      if (!iso) iso = inferRelativeDate(input);
      if (iso) {
        this.bookingData.bookingDate = iso;
        const d = document.getElementById("bookingDate");
        if (d) d.value = iso;
        reply =
          "Great. What time would you prefer? For example 7:30 PM, or you can say evening or night.";
        ok = true;
      } else {
        reply =
          "Please say the date like 12th December 2025 or say tomorrow or day after tomorrow.";
      }
    } else if (step === "time") {
      let isoTime = parseSpokenTime(input);
      if (!isoTime) isoTime = inferTimeFromWords(input);
      if (isoTime) {
        this.bookingData.bookingTime = isoTime;
        const t = document.getElementById("bookingTime");
        if (t) t.value = isoTime;

        let suggestionText = "";
        try {
          const resp = await fetch(
            `${this.apiBaseUrl}/bookings/weather?date=${this.bookingData.bookingDate}&location=Delhi`
          );
          const data = await resp.json();
          if (data.success) {
            const prettyDate = formatPrettyDate(this.bookingData.bookingDate);
            const base =
              data.suggestion || "I have checked the weather for that day.";
            suggestionText =
              base +
              ` On ${prettyDate}, the forecast is ${data.description} around your booking time.`;
          } else {
            suggestionText =
              "I could not fetch the weather right now, but you can still choose your seating preference.";
          }
        } catch {
          suggestionText =
            "I could not fetch the weather right now, but you can still choose your seating preference.";
        }

        reply =
          suggestionText +
          "\n\nBased on this, I suggest one option, but what would you prefer: indoor or outdoor seating?";
        ok = true;
      } else {
        reply =
          "Please say the time in 12-hour format like 7:30 PM, or say morning, afternoon, evening or night.";
      }
    } else if (step === "seating") {
      const s = input.toLowerCase().trim();
      if (s === "indoor" || s === "outdoor") {
        this.bookingData.seatingPreference = s;
        const f = document.getElementById("seatingPreference");
        if (f) f.value = s;
        reply =
          "Got it. Which cuisine would you prefer? You can choose from Italian, Chinese, Indian, Mexican, Japanese, American, Thai or Mediterranean.";
        ok = true;
      } else {
        reply = "Please say indoor or outdoor.";
      }
    } else if (step === "cuisine") {
      const valid = [
        "italian",
        "chinese",
        "indian",
        "mexican",
        "japanese",
        "american",
        "thai",
        "mediterranean"
      ];
      const c = input.toLowerCase().trim();
      if (valid.includes(c)) {
        this.bookingData.cuisinePreference =
          input.charAt(0).toUpperCase() + input.slice(1);
        const f = document.getElementById("cuisinePreference");
        if (f) f.value = this.bookingData.cuisinePreference;
        reply =
          "Great choice. Do you have any special requests, like birthday, anniversary or dietary needs? Say none if there are no special requests.";
        ok = true;
      } else {
        reply =
          "Please choose a cuisine from Italian, Chinese, Indian, Mexican, Japanese, American, Thai or Mediterranean.";
      }
    } else if (step === "specialRequests") {
      if (input.toLowerCase().trim() === "none") {
        this.bookingData.specialRequests = "";
      } else {
        this.bookingData.specialRequests = input;
      }
      const f = document.getElementById("specialRequests");
      if (f) f.value = this.bookingData.specialRequests;
      reply =
        "Let me confirm your booking:\n\n" +
        `Name: ${this.bookingData.customerName}\n` +
        `Phone: ${this.bookingData.phoneNumber}\n` +
        `Email: ${this.bookingData.email}\n` +
        `Guests: ${this.bookingData.numberOfGuests}\n` +
        `Date: ${formatPrettyDate(this.bookingData.bookingDate)}\n` +
        `Time: ${formatPrettyTime(this.bookingData.bookingTime)}\n` +
        `Cuisine: ${this.bookingData.cuisinePreference}\n` +
        `Seating: ${this.bookingData.seatingPreference}\n` +
        `Special Requests: ${
          this.bookingData.specialRequests || "None"
        }\n\nSay confirm to complete your booking or cancel to start over.`;
      ok = true;
    } else if (step === "confirmation") {
      const c = input.toLowerCase().trim();
      if (c === "confirm" || c === "yes") {
        reply = "Great. I am confirming your booking now.";
        this.conversationStep = this.steps.length;
        ok = true;
      } else if (c === "cancel" || c === "no") {
        this.reset();
        return "Okay, your booking has been cancelled. Let us start again. What is your name?";
      } else {
        reply = "Please say confirm or cancel.";
      }
    }

    if (ok && step !== "confirmation") {
      this.conversationStep += 1;
    }

    reply = applySentimentTone(reply, originalInput);
    return reply;
  }

  async saveBooking() {
    this.syncFromForm();
    try {
      const resp = await fetch(`${this.apiBaseUrl}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.bookingData)
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        return {
          success: true,
          bookingId: data.booking.bookingId || data.booking._id
        };
      }

      return {
        success: false,
        error: data.message || "Unknown error",
        code: data.code,
        suggestions: data.suggestions || []
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  isBookingComplete() {
    return this.conversationStep >= this.steps.length;
  }

  showBookingStatus(id, status) {
    const sec = document.getElementById("statusSection");
    const card = document.getElementById("statusCard");
    if (!sec || !card) return;
    if (status === "success") {
      card.className = "status-card";
      card.innerHTML =
        `<h4>✓ Booking Confirmed!</h4>` +
        `<p><strong>Booking ID:</strong> ${id}</p>` +
        `<p><strong>Name:</strong> ${this.bookingData.customerName}</p>` +
        `<p><strong>Date:</strong> ${formatPrettyDate(
          this.bookingData.bookingDate
        )}</p>` +
        `<p><strong>Time:</strong> ${formatPrettyTime(
          this.bookingData.bookingTime
        )}</p>` +
        `<p><strong>Guests:</strong> ${this.bookingData.numberOfGuests}</p>`;
    } else {
      card.className = "status-card error";
      card.innerHTML = `<h4>✗ Booking Failed</h4><p>${status}</p>`;
    }
    sec.style.display = "block";
  }

  reset() {
    this.bookingData = {};
    this.conversationStep = 0;
    [
      "customerName",
      "phoneNumber",
      "email",
      "numberOfGuests",
      "bookingDate",
      "bookingTime",
      "cuisinePreference",
      "seatingPreference",
      "specialRequests"
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const sec = document.getElementById("statusSection");
    if (sec) sec.style.display = "none";
  }
}

const voiceHandler = new VoiceHandler();
const bookingManager = new BookingManager();

async function handleUserMessage(text, fromTyping = false) {
  const stripped = text.replace(/\s+/g, "");
  if (!fromTyping && stripped.length < 3) {
    const msg =
      "I could not hear you properly. Could you please say that again?";
    bookingManager.addChatMessage("🔁 Did not catch that", true);
    try {
      await voiceHandler.speak(msg);
    } catch {}
    voiceHandler.startListening();
    return;
  }

  bookingManager.addChatMessage(text, false);
  const reply = await bookingManager.getAgentResponse(text);
  bookingManager.addChatMessage(reply, true);
  try {
    await voiceHandler.speak(reply);
  } catch {}

  if (bookingManager.isBookingComplete()) {
    const result = await bookingManager.saveBooking();
    if (result.success) {
      bookingManager.showBookingStatus(result.bookingId, "success");
      try {
        await voiceHandler.speak(
          `Your booking is confirmed. Your booking ID is ${result.bookingId}. A confirmation email has been sent to you.`
        );
      } catch {}
    } else if (result.code === "FULLY_BOOKED") {
      let msg =
        result.error ||
        "All tables are booked for this date and time. Please choose another time.";
      if (result.suggestions && result.suggestions.length) {
        msg +=
          " The next available times are: " +
          result.suggestions.join(", ") +
          ". Please tell me which time you prefer.";
      } else {
        msg += " Please tell me another time for your booking.";
      }

      bookingManager.addChatMessage(msg, true);
      try {
        await voiceHandler.speak(msg);
      } catch {}

      const timeIndex = bookingManager.steps.indexOf("time");
      if (timeIndex !== -1) {
        bookingManager.conversationStep = timeIndex;
      }
    } else {
      bookingManager.showBookingStatus("", result.error);
      try {
        await voiceHandler.speak(
          "Sorry, something went wrong while saving your booking. Please try again."
        );
      } catch {}
    }
  } else {
    voiceHandler.startListening();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const voiceBtn = document.getElementById("voiceBtn");
  const speakerBtn = document.getElementById("speakerBtn");
  const resetBtn = document.getElementById("resetBtn");
  const chatInput = document.getElementById("chatInput");
  const chatSendBtn = document.getElementById("chatSendBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  const welcomeText =
    "👋 Welcome to Vaiu services. I am your restaurant booking assistant. What is your name?";
  bookingManager.addChatMessage(welcomeText, true);
  if (voiceHandler.isSupported()) {
    try {
      await voiceHandler.speak(
        "Welcome to Vaiu services. I am your restaurant booking assistant. What is your name?"
      );
    } catch {}
  }

  voiceHandler.onFinal((text) => handleUserMessage(text, false));

  voiceBtn.addEventListener("click", () => {
    if (!voiceHandler.isListening) voiceHandler.startListening();
  });

  speakerBtn.addEventListener("click", async () => {
    if (bookingManager.lastResponse) {
      try {
        await voiceHandler.speak(bookingManager.lastResponse);
      } catch {}
      voiceHandler.startListening();
    }
  });

  resetBtn.addEventListener("click", async () => {
    bookingManager.reset();
    voiceHandler.clearTranscript();
    const log = document.getElementById("chatLog");
    if (log) log.innerHTML = "";
    const msg = "Let us start again. What is your name?";
    bookingManager.addChatMessage("👋 " + msg, true);
    try {
      await voiceHandler.speak(msg);
    } catch {}
    voiceHandler.startListening();
  });

  const sendChat = () => {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";
    handleUserMessage(text, true);
  };

  chatSendBtn.addEventListener("click", sendChat);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendChat();
  });

  confirmBtn.addEventListener("click", async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing...";
    const result = await bookingManager.saveBooking();

    if (result.success) {
      bookingManager.showBookingStatus(result.bookingId, "success");
      try {
        await voiceHandler.speak(
          `Your booking is confirmed. Your booking ID is ${result.bookingId}. A confirmation email has been sent to you.`
        );
      } catch {}
    } else if (result.code === "FULLY_BOOKED") {
      let msg =
        result.error ||
        "All tables are booked for this date and time. Please choose another time.";
      if (result.suggestions && result.suggestions.length) {
        msg +=
          " The next available times are: " +
          result.suggestions.join(", ") +
          ". Please tell me which time you prefer.";
      } else {
        msg += " Please tell me another time for your booking.";
      }

      bookingManager.addChatMessage(msg, true);
      try {
        await voiceHandler.speak(msg);
      } catch {}

      const timeIndex = bookingManager.steps.indexOf("time");
      if (timeIndex !== -1) {
        bookingManager.conversationStep = timeIndex;
      }
    } else {
      bookingManager.showBookingStatus("", result.error);
      try {
        await voiceHandler.speak(
          "Sorry, something went wrong while saving your booking. Please try again."
        );
      } catch {}
    }

    confirmBtn.disabled = false;
    confirmBtn.textContent = "✓ Confirm Booking";
  });

  [
    "customerName",
    "phoneNumber",
    "email",
    "numberOfGuests",
    "bookingDate",
    "bookingTime",
    "cuisinePreference",
    "seatingPreference",
    "specialRequests"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => bookingManager.syncFromForm());
    }
  });
});
