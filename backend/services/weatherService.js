import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function getWeatherForDate(date, location = "Delhi,IN") {
  if (!OPENWEATHER_API_KEY) {
    return {
      success: false,
      suggestion:
        "Weather service is not configured, so I cannot tailor seating based on forecast.",
      description: "No weather data"
    };
  }

  try {
    // For simplicity, use current forecast (or daily) instead of precise date-time
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      location
    )}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const { data } = await axios.get(url);

    if (!data.list || !data.list.length) {
      return {
        success: false,
        suggestion: "I could not find a valid forecast.",
        description: "No forecast list"
      };
    }

    // Just take the first forecast block as simple forecast
    const forecast = data.list[0];
    const condition = forecast.weather[0].main.toLowerCase();
    const temp = forecast.main.temp;

    let suggestion;
    if (condition.includes("rain") || condition.includes("storm")) {
      suggestion =
        "It might rain on that day. I would recommend our cozy indoor seating.";
    } else if (condition.includes("clear") || condition.includes("sun")) {
      suggestion =
        "The weather looks great. Outdoor seating would be perfect if you like fresh air.";
    } else if (temp >= 35) {
      suggestion =
        "It may be quite hot. I suggest comfortable indoor seating with air conditioning.";
    } else {
      suggestion =
        "The weather seems moderate, you can choose either indoor or outdoor seating.";
    }

    return {
      success: true,
      suggestion,
      description: `${forecast.weather[0].description}, around ${Math.round(
        temp
      )}°C`
    };
  } catch (err) {
    console.error("Weather API error:", err.message);
    return {
      success: false,
      suggestion:
        "I could not reach the weather service. You can still choose your seating preference.",
      description: "Weather service error"
    };
  }
}
