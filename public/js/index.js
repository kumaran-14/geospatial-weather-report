// importing npm modules
// const nearbyCities = require("nearby-cities")

// Constants
let locateMe = document.querySelector('.locate-me')
let mapText = document.querySelector('.map-text')
let weatherText = document.querySelector('.weather')
let conditon = document.querySelector('.req')

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
    console.debug(position)
    showMap(lat, lon);
    getCities(lat, lon)
  });
}

function showMap(lat, lon) {
  myLatLng = new google.maps.LatLng(lat, lon);
  mapOptions = {
    zoom: 8,
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
      conditon.innerHTML = `List of cities with population over 50 thousand and less than 50km from you which has over 50% probability of precipitaion or temperature change over 5 degrees`
      weatherText.innerHTML = `<ul class="list-group list-group-flush">`
      data.cities.forEach( city => {
        weatherText.innerHTML += `<li class="list-group-item">Name : <strong>${city.name}</strong> , Population : <strong>${city.population}</strong><br>  Latitude : <strong>${city.lat}</strong> , Longitude : <strong>${city.lon}</strong><br>  </li>`
      })
      weatherText.innerHTML += `</ul>`

    } )
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


