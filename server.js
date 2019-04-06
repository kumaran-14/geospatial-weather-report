require('dotenv').config()
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const nearbyCities = require("nearby-cities");
const PORT = process.env.PORT || 5000;
const axios = require("axios");

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
      city.population > 50000 &&
      distance(city.lat, city.lon, query.latitude, query.longitude) < 100
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

app.get("/hello", (req, res) => {
  res.send({
    hello: "Hiya! We are from Heroku"
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${process.env.PORT}!!`);
});

//distance cal func

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

function expectRain(arr) {
  let rain = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].precipProbability > 0.1) {
      rain = true;
      break;
    }
  }
  return rain;
}

function tempChange(arr) {
  let tempChange = false;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (
        Math.abs(arr[i].temperatureHigh - arr[j].temperatureHigh) > 1 ||
        Math.abs(arr[i].temperatureLow - arr[j].temperatureLow) > 1
      ) {
        tempChange = true;
        break;
      }
    }
  }
  return tempChange;
}
