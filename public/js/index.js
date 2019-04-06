// Constants
const locateMe = document.querySelector('.locate-me')
const mapText = document.querySelector('.map-text')
const weatherText = document.querySelector('.list-container')
const conditon = document.querySelector('.req')

// Map variables
let myLatLng, mapOptions, map, marker, request;

locateMe.addEventListener('click', showPosition)

function showPosition(e) {
  navigator.geolocation.getCurrentPosition(function(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    mapText.innerHTML = `<br/>
    <h4 class="card-title">Found You!</h4>
    <p class="card-text">Latitude: ${lat}</p>
    <p class="card-text">Longitude: ${lon}</p>
    </br>`
    showMap(lat, lon);
    getCities(lat, lon)
  });
}

function showMap(lat, lon) {
  myLatLng = new google.maps.LatLng(lat, lon);
  mapOptions = {
    zoom: 14,
    center: myLatLng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Found you!'
  });
}

function getCities(lat, lon) {
  fetch(`https://geospatial-weather-report.herokuapp.com/nearby-cities?&lat=${lat}&lon=${lon}`)
    .then( res => res.json())
    .then(data => {
      console.log(data)
      weatherText.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)'
      weatherText.innerHTML = `<h2>List of cities.</h2> <p>List of cities with population over 50 thousand and less than 50km from you which has over 50% probability of precipitaion or temperature change over 5 degrees.</p>`
      weatherText.innerHTML += `<ul class="list">`
      data.cities.forEach( city => {
        weatherText.innerHTML += generateText(city.name, city.population, city.lat, city.lon)
      })
      weatherText.innerHTML += `</ul>`
    } )
    .catch(error => {
      weatherText.innerHTML = `Try again later for weather data.`
    })
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log('Results', results)
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


function generateText(cityName, population, lat, lon) {
  return `<li><span class="circle"></span> Name : <strong>${cityName}</strong> , Population : <strong>${population}</strong><br>  Latitude : <strong>${lat}</strong> , Longitude : <strong>${lon}</strong><br>  </li>`
}
