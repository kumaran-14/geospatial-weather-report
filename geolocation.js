// console.log('Ahoy, matey') testing!


// Constants
let locateMe = document.querySelector('.locate-me')
let mapText = document.querySelector('.map-text')
let myLatLng, mapOptions, map, marker, request;
const forecast_io_api_key = '34edaac730378588f1452d2d43dc0488'

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
  request = {
    location: myLatLng,
    radius: '500000'
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
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


const req = new Request('http://api.v3.factual.com/t/places?geo={"$within":{"$rect":[[34.06110,-118.42283],[34.05771,-118.41399]]}}')
fetch(req)
  .then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      console.log(response)
      throw new Error('Something went wrong on api server!');
    }
  })
  .then(response => {
    console.debug(response);
    // ...
  }).catch(error => {
    console.error(error);
  });