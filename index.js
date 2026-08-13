const API_KEY = "76b51dc015315e87195d85cc5369d01b"

const search = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");
// const container = document.getElementsByClassName("container")
// const weathercard = document.getElementById("weatherCard")
const cityName = document.querySelector("#weatherCard h2");
const temperature = document.querySelector(".temperature");
const state = document.querySelector(".state")
const feelsLike = document.querySelector(".feels")
const humidity = document.querySelector(".humidity .gap")
const wind = document.querySelector(".wind .gap")
const forecastCard = document.querySelectorAll(".forecast-card")
const favourite = document.getElementById("favBtn")
const favoriteSection = document.getElementById("favoriteSection")
const errorPopup = document.getElementById("errorPopup");
async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Weather request failed");
    }

    const data = await response.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json();
      throw new Error(errorData.message || "Forecast request failed");
    }

    const forecastData = await forecastResponse.json();

    return {
      city: data.name,
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      forecast: forecastData.list
    };

  } catch (error) {
    console.error("Weather Error:", error);
    return null;
  }
}


async function call(city) {
  const result = await getWeather(city)
  console.log(result)
}


searchBtn.addEventListener("click", searchWeather)
function showError(message) {
    errorPopup.textContent = message;
    errorPopup.style.display = "block";

    setTimeout(() => {
        errorPopup.style.display = "none";
    }, 3000);
}

let debounceTimer;

search.addEventListener("input", function () {

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        searchWeather();
    }, 500);

});

async function searchWeather() {
  
  const value = search.value.trim();
if (!value) {
    showError("Please enter a city");
    return;
}

const searchResult = await getWeather(value);
  console.log(searchResult);
  if (!searchResult) {
    showError("City not found");
    return;
}

  const dates = [];
  searchResult.forecast.forEach(item => {

    const date = item.dt_txt.split(" ")[0];
    if (!dates.includes(date)) {
      dates.push(date)
    }

  });

const dailyForecast = dates.slice(1, 6).map(date => {

    const dayForecasts = searchResult.forecast.filter(item =>
        item.dt_txt.startsWith(date)
    );

    return dayForecasts.find(item =>
        item.dt_txt.includes("12:00:00")
    ) || dayForecasts[0];

}).filter(Boolean);
  console.log(dailyForecast)
  console.log("DATES:", dates);
  console.log("DAILY:", dailyForecast);

forecastCard.forEach((card, index) => {

    const forecast = dailyForecast[index];

    if (!forecast) {
        card.style.display = "none";
        return;
    }

    card.style.display = "block";

    const day = card.querySelector(".text");
    const icon = card.querySelector(".forecastIcon");
    const forecastTemperature =
        card.querySelector(".forecastTemperature");

    const forecastDate = new Date(forecast.dt_txt);

    const dayName = forecastDate.toLocaleDateString("en-US", {
        weekday: "long"
    });

    day.textContent = dayName;

    icon.innerHTML = `
        <img
            src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png"
            alt="${forecast.weather[0].description}"
        >
    `;

    forecastTemperature.textContent =
        `${Math.round(forecast.main.temp)}°C`;
});
  console.log(dates)

  cityName.textContent = `${searchResult.city}`
  temperature.textContent = `${searchResult.temp}°C`
  state.textContent = searchResult.description
  feelsLike.textContent = `Feels like ${searchResult.feelsLike}°C`
  humidity.textContent = `${searchResult.humidity}%`
  wind.textContent = `${searchResult.windSpeed} m/s`



}

favourite.addEventListener("click", addFavourite);
const favorites = [];

function addFavourite() {
  const favCity = cityName.textContent;
  const exsistingFavorites = favoriteSection.querySelectorAll("p");
  for (let item of exsistingFavorites) {
    if (item.textContent == favCity) {
      return;
    }
  }

  const favSection = document.createElement("div");
  const removeBtn = document.createElement("button");
  const favText = document.createElement("p");
  favText.textContent = favCity;

  const favTemperature = temperature.textContent;
  const favDescription = state.textContent;

  const favTemp = document.createElement("p");
  const favDesc = document.createElement("p");

  favTemp.textContent = favTemperature;
  favDesc.textContent = favDescription;

  removeBtn.classList.add("removeBtn")
  removeBtn.textContent = "remove"
  favSection.appendChild(removeBtn)
  favSection.appendChild(favText);
  favSection.appendChild(favTemp);
  favSection.appendChild(favDesc);

  favoriteSection.appendChild(favSection)

  removeBtn.addEventListener("click", function () {
    const index = favorites.findIndex(item => item.city === favCity);
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favSection.remove();
  })
  const favouriteData = {
    city: favCity,
    temp: favTemperature,
    description: favDescription
  }
  favorites.push(favouriteData

  );

  localStorage.setItem("favorites", JSON.stringify(favorites));

  console.log("Array:", favorites);
  console.log("Storage:", localStorage.getItem("favorites"));


}

console.log(localStorage.getItem("favorites"));
const savedData = localStorage.getItem("favorites");

const savedFavorites = JSON.parse(savedData);

if (savedFavorites) {
  for (let city of savedFavorites) {
    favorites.push(city);
    const favSection = document.createElement("div");
    const favText = document.createElement("p");
    const favDesc = document.createElement("p");
    const favTemp = document.createElement("p")
    const removeBtn = document.createElement("button");
    favText.textContent = city.city;
    favTemp.textContent = city.temp;
    favDesc.textContent = city.description

    favSection.appendChild(favText);
    favSection.appendChild(favTemp);
    favSection.appendChild(favDesc)

    removeBtn.textContent = "remove";
    removeBtn.classList.add("removeBtn");

    favSection.appendChild(removeBtn);
    favoriteSection.appendChild(favSection);
    removeBtn.addEventListener("click", function () {
      const index = favorites.findIndex(item => item.city === city.city);

      favorites.splice(index, 1);

      localStorage.setItem("favorites", JSON.stringify(favorites));

      favSection.remove();
    });
  }
}

const theme = document.getElementById("theme");
theme.addEventListener("click", function () {
    document.body.classList.toggle("dark-theme");
});