require('dotenv').config()
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nearbyCities = require("nearby-cities");
const PORT = process.env.PORT || 5000;
const axios = require("axios");
const weatherConfig = {
  maxCityPopulation: 50000,    // fifty thousand
  maxRadialDist: 100,        // 100km
  precipProbability: 0.1,   // 10% rain probability 
  temperatureChange: 1      // 1 degree temperature change
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

//route handlers
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/nearby-cities", async function(req, res) {
  let cityList = [];
  const query = { latitude: req.query.lat, longitude: req.query.lon };
  const cities = nearbyCities(query).filter(
    city =>
      city.population > weatherConfig.maxCityPopulation &&
      distance(city.lat, city.lon, query.latitude, query.longitude) < weatherConfig.maxRadialDist
  );

  for (let i = 0; i < cities.length; ++i) {
    let resp = await axios(
      `https://api.darksky.net/forecast/${process.env.DARK_SKY_API_KEY}/${
        cities[i].lat
      },${cities[i].lon}`
    );
    if (expectRain(resp.data.daily.data) || tempChange(resp.data.daily.data)) {
      cityList.push(cities[i]);
    }
  }
  console.log(
    "USERS LOCATION, Populated Cities, Weather:",
    query,
    cities.length,
    cityList.length
  );
  res.send({
    cities: cityList
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}!!`);
});

//distance calculation func
function distance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km (change this constant to get miles)
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLon = ((lon2 - lon1) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return Math.round(d);
}

// cities which have precipation probability higher than threshold
function expectRain(arr) {
  let rain = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].precipProbability > weatherConfig.precipProbability) {
      rain = true;
      break;
    }
  }
  return rain;
}

// cities which have temperature change higher than threshold
function tempChange(arr) {
  let tempChange = false;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (
        Math.abs(arr[i].temperatureHigh - arr[j].temperatureHigh) > weatherConfig.temperatureChange ||
        Math.abs(arr[i].temperatureLow - arr[j].temperatureLow) > weatherConfig.temperatureChange
      ) {
        tempChange = true;
        break;
      }
    }
  }
  return tempChange;
}
