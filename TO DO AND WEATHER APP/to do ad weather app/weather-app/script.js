
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");
const statusMessage = document.getElementById("status-message");

const cityResults = document.getElementById("city-results");
const cityList = document.getElementById("city-list");
const resultCount = document.getElementById("result-count");

const weatherDashboard = document.getElementById("weather-dashboard");

let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// =====================================
// LIVE DATE AND TIME
// =====================================

function updateClock() {
    const now = new Date();

    document.getElementById("current-time").textContent =
        new Intl.DateTimeFormat("en-US", {
            timeZone: selectedTimezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }).format(now);

    document.getElementById("current-date").textContent =
        new Intl.DateTimeFormat("en-US", {
            timeZone: selectedTimezone,
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }).format(now);
}

updateClock();
setInterval(updateClock, 1000);


// =====================================
// WEATHER CODE INTERPRETATION
// =====================================

function weatherInfo(code) {
    const weatherMap = {
        0: ["☀️", "Clear sky"],
        1: ["🌤️", "Mainly clear"],
        2: ["⛅", "Partly cloudy"],
        3: ["☁️", "Overcast"],
        45: ["🌫️", "Fog"],
        48: ["🌫️", "Rime fog"],
        51: ["🌦️", "Light drizzle"],
        53: ["🌦️", "Moderate drizzle"],
        55: ["🌧️", "Dense drizzle"],
        56: ["🌧️", "Freezing drizzle"],
        57: ["🌧️", "Dense freezing drizzle"],
        61: ["🌧️", "Slight rain"],
        63: ["🌧️", "Moderate rain"],
        65: ["🌧️", "Heavy rain"],
        66: ["🌧️", "Freezing rain"],
        67: ["🌧️", "Heavy freezing rain"],
        71: ["🌨️", "Slight snow"],
        73: ["🌨️", "Moderate snow"],
        75: ["❄️", "Heavy snow"],
        77: ["🌨️", "Snow grains"],
        80: ["🌦️", "Rain showers"],
        81: ["🌧️", "Moderate showers"],
        82: ["⛈️", "Violent showers"],
        85: ["🌨️", "Snow showers"],
        86: ["❄️", "Heavy snow showers"],
        95: ["⛈️", "Thunderstorm"],
        96: ["⛈️", "Thunderstorm with hail"],
        99: ["⛈️", "Heavy thunderstorm with hail"]
    };

    return weatherMap[code] || ["🌡️", "Weather conditions"];
}


// =====================================
// STATUS MESSAGE
// =====================================

function setStatus(message, error = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", error);
}


// =====================================
// SAFE HTML TEXT
// =====================================

function safeText(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));
}


// =====================================
// CITY SEARCH
// =====================================

async function searchCity(cityName) {

    if (!cityName.trim()) {
        setStatus("Please enter a city name.", true);
        return;
    }

    searchButton.disabled = true;
    cityResults.hidden = true;
    weatherDashboard.hidden = true;

    setStatus("Searching for locations...");

    try {
        const params = new URLSearchParams({
            name: cityName.trim(),
            count: "10",
            language: "en",
            format: "json"
        });

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?${params}`
        );

        if (!response.ok) {
            throw new Error("Geocoding request failed.");
        }

        const result = await response.json();

        if (!result.results || result.results.length === 0) {
            setStatus("No city found. Please try another search.", true);
            return;
        }

        if (result.results.length === 1) {
            await fetchWeather(result.results[0]);
        } else {
            showCityOptions(result.results);
            setStatus("Select the correct location below.");
        }

    } catch (error) {
        console.error(error);
        setStatus(
            "Search failed. Check your internet connection and try again.",
            true
        );
    } finally {
        searchButton.disabled = false;
    }
}


// =====================================
// DISPLAY CITY OPTIONS
// =====================================

function showCityOptions(results) {

    cityList.innerHTML = "";

    resultCount.textContent = `${results.length} locations`;

    results.forEach((place) => {

        const button = document.createElement("button");

        button.className = "city-option";
        button.type = "button";

        button.innerHTML = `
            <span>
                <strong>${safeText(place.name)}</strong>
                <small>${safeText(
                    [place.admin1, place.country]
                        .filter(Boolean)
                        .join(", ")
                )}</small>
            </span>
            <span class="arrow">→</span>
        `;

        button.addEventListener("click", () => {
            fetchWeather(place);
        });

        cityList.appendChild(button);
    });

    cityResults.hidden = false;
}


// =====================================
// FETCH WEATHER DATA
// =====================================

async function fetchWeather(place) {

    cityResults.hidden = true;
    weatherDashboard.hidden = true;

    setStatus(`Loading weather for ${place.name}...`);

    try {

        const params = new URLSearchParams({
            latitude: place.latitude,
            longitude: place.longitude,

            current:
                "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",

            daily:
                "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",

            timezone: "auto",
            forecast_days: "7"
        });

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`
        );

        if (!response.ok) {
            throw new Error("Forecast request failed.");
        }

        const data = await response.json();

        // Set the timezone based on the searched city
        selectedTimezone = data.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        renderWeather(place, data);

        weatherDashboard.hidden = false;

        updateClock();

        setStatus("");

    } catch (error) {
        console.error(error);

        setStatus(
            "Could not load weather. Please try again.",
            true
        );
    }
}


// =====================================
// DISPLAY CURRENT WEATHER
// =====================================

function renderWeather(place, data) {

    const current = data.current;

    const [emoji, description] =
        weatherInfo(current.weather_code);

    document.getElementById("city-name").textContent =
        place.name;

    document.getElementById("location-details").textContent =
        [
            place.admin1,
            place.country,
            data.timezone
        ]
        .filter(Boolean)
        .join(" · ");

    document.getElementById("weather-icon").textContent =
        emoji;

    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m);

    document.getElementById("weather-description").textContent =
        description;

    document.getElementById("feels-like").textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind-speed").textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById("precipitation").textContent =
        `${current.precipitation} mm`;

    const observationTime = new Date(current.time);

    document.getElementById("updated-time").textContent =
        `Weather data time: ${
            observationTime.toLocaleString("en-US", {
                timeZone: selectedTimezone
            })
        } · Source: Open-Meteo`;

    renderForecast(data.daily);
}


// =====================================
// SEVEN-DAY FORECAST
// =====================================

function renderForecast(daily) {

    const forecastList =
        document.getElementById("forecast-list");

    forecastList.innerHTML = "";

    daily.time.forEach((day, index) => {

        const date = new Date(`${day}T12:00:00`);

        const [icon, description] =
            weatherInfo(daily.weather_code[index]);

        const high =
            Math.round(daily.temperature_2m_max[index]);

        const low =
            Math.round(daily.temperature_2m_min[index]);

        const rain =
            daily.precipitation_probability_max?.[index];

        const card = document.createElement("div");

        card.className = "forecast-day";

        card.innerHTML = `
            <div class="day">
                ${
                    index === 0
                    ? "Today"
                    : date.toLocaleDateString("en-US", {
                        weekday: "short"
                    })
                }
            </div>

            <span class="icon" title="${safeText(description)}">
                ${icon}
            </span>

            <div class="temps">
                <span>${high}°</span>
                <span class="low">${low}°</span>
            </div>

            <div class="rain-chance">
                ${rain == null ? "" : `💧 ${rain}%`}
            </div>
        `;

        forecastList.appendChild(card);
    });
}


// =====================================
// SEARCH BUTTON EVENT
// =====================================

searchForm.addEventListener("submit", (event) => {

    event.preventDefault();

    searchCity(cityInput.value);
});
