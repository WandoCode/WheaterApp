let UNIT_CHOICE = "metric"; // Can be 'metric' or 'imperial'

// Nodes
// Form
const formLocation = document.forms[1];
const btnMetric = document.querySelector("#metric");
const btnImperial = document.querySelector("#imperial");

// location
const locationDiv = document.querySelector("#location-display");

// Temperature
const realFeelTemp = document.querySelector("#real-feel");
const currentTemp = document.querySelector("#current-temp");
const minTemp = document.querySelector("#min-temp");
const maxTemp = document.querySelector("#max-temp");
const tempUnits = document.querySelectorAll(".units-temp");

// Wind
const wind = document.querySelector("#wind");
const windUnit = document.querySelector("#wind-unit");

// Image
const imgWeather = document.querySelector("#img-wrapper");

// Overall
const description = document.querySelector("#description");

const msToKmH = (ms) => {
  /* Convert a m/s value to a km/h value, with 1 decimal */
  return Math.round(ms * 3.6 * 10) / 10;
};

const changeUnits = (e) => {
  /* Get info from form and change units accordingly */
  e.preventDefault();

  const unitChoice = e.target.value;
  if (unitChoice === "°F") {
    UNIT_CHOICE = "imperial";
    btnMetric.classList.remove("unit-selected");
    btnImperial.classList.add("unit-selected");
  } else {
    UNIT_CHOICE = "metric";
    btnImperial.classList.remove("unit-selected");
    btnMetric.classList.add("unit-selected");
  }

  cbSearch(e);
};

const handleError = (err) => {
  console.log("ERROR " + err);
  locationDiv.innerText = "Location not found";
  // Temperatures
  realFeelTemp.innerText = "";
  currentTemp.innerText = "";
  minTemp.innerText = "";
  maxTemp.innerText = "";

  // Wind
  wind.innerText = "";

  // Overall info
  description.innerText = "";
};

const displayLocation = async (location) => {
  /* Get and display information asked by the user*/

  // Retreive informations
  const datas = await getWeather(
    "067fb7d97ded2b189be6c5639754f51d",
    location
  ).catch(handleError);

  // Display informations
  locationDiv.innerText = datas.location.name;
  displayInfos(datas);

  // Add units
  displayUnits();

  // Add img
  displayWeatherIcon(datas.icon);
};

const cbSearch = async (e) => {
  e.preventDefault();

  // Check if the user wrote a location name
  if (formLocation.location.value === "") return;

  const location = formLocation.location.value;

  await displayLocation(location);
};

const getWeather = async (apiKey, location) => {
  /* Retrieve the whether infos of a specified location from an API.
   *
   * @param1 apiKey {string}: the key to access the API
   * @param2 location {string}: the location
   *
   *  @return {JSON}: object with infos
   */

  const reponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${UNIT_CHOICE}`
  ).catch(handleError);

  const data = await reponse.json().catch(handleError);
  const usefullDatas = extractUsefullDatas(data);

  return usefullDatas;
};

const extractUsefullDatas = (dataObject) => {
  /* Extract datas comming from the API */
  let weatherDatas = {};

  // Location name
  weatherDatas.location = { name: dataObject.name };

  // Temperature
  weatherDatas.temperature = {
    temp: dataObject.main.temp,
    min: dataObject.main.temp_min,
    max: dataObject.main.temp_max,
    feels_like: dataObject.main.feels_like,
  };

  // Wind
  weatherDatas.wind = {
    speed: dataObject.wind.speed,
  };

  // General infos
  weatherDatas.description = {
    description: dataObject.weather[0].description,
  };

  // Icon id
  weatherDatas.icon = dataObject.weather[0].icon;

  return weatherDatas;
};

const displayInfos = (datas) => {
  /* Insert informations in the HTML */

  // Temperatures
  realFeelTemp.innerText = datas.temperature.feels_like;
  currentTemp.innerText = datas.temperature.temp;
  minTemp.innerText = datas.temperature.min;
  maxTemp.innerText = datas.temperature.max;

  // Wind
  wind.innerText = msToKmH(datas.wind.speed);

  // Overall info
  description.innerText = datas.description.description;
};

const displayUnits = () => {
  /* Display units for all quantitative info following UNIT_CHOICE */

  /* Temperature unit */
  let unitText = UNIT_CHOICE === "metric" ? "°C" : "°F";

  for (let i = 0; i < tempUnits.length; i++) {
    const tempNode = tempUnits[i];
    tempNode.innerText = unitText;
  }

  /* Wind unit */
  windUnit.innerText = UNIT_CHOICE === "metric" ? "km/h" : "miles/h";
};

const displayWeatherIcon = (iconID) => {
  imgWeather.innerHTML = "";
  const img = document.createElement("img");
  imgWeather.appendChild(img);

  img.src = `http://openweathermap.org/img/wn/${iconID}@2x.png`;
  img.id = "weather-icon";
};

displayLocation("tournai");
formLocation.onsubmit = cbSearch;
btnMetric.onclick = changeUnits;
btnImperial.onclick = changeUnits;
