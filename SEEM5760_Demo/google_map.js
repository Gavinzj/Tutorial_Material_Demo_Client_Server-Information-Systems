var map;
var querymarker;
var querymarker_latLng;
var hasMarker = false;

var infoWindow;
var mymapcenter = { lat: 22.30372493034696, lng: 114.17537212371826 };
var hotelarr  = [];
var missinghotels;
var hotelmark = [];
var geocoder;
var s = [];
var triangleCoords = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
             center: mymapcenter,
             zoom: 15,
             disableDefaultUI: false,
         
             panControl: true,
             scaleControl: false,
             mapTypeControl: false,
             zoomControl: true,
    	     streetViewControl: true,
    	     
             zoomControlOptions: {
      	        style: google.maps.ZoomControlStyle.LARGE,
     	        position: google.maps.ControlPosition.LEFT_TOP,
     	     },
    	     streetViewControlOptions: {
    	         position: google.maps.ControlPosition.LEFT_TOP
    	     },
    	     
             mapTypeId: google.maps.MapTypeId.ROADMAP,
          });
	hotelarr  = [];
	hotelmark = [];
	s = [];
	triangleCoords = [];

	geocoder= new google.maps.Geocoder;

	map.addListener('click', function(e) {addMarker(e.latLng); });
  
	map.addListener('dbclick', function(e) {geoToName(e.latLng);});

	document.getElementById("get-info").addEventListener("click", getInformation);

	document.getElementById("get-places").addEventListener("click", searchPlaces);
  
	infoWindow = new google.maps.InfoWindow();
  //loadHotels();
}

// Adds a marker to the map
function addMarker(latLng) {

	if (querymarker){
		querymarker.setMap(null);
		querymarker=null;
	}

	querymarker = new google.maps.Marker({
		position: latLng,
	  	map,
	});
	querymarker_latLng = latLng;
	document.getElementById("h_info1").setAttribute("value", latLng);
}

function getInformation(){
	latLng = querymarker_latLng;

	geocoder.geocode({'location': latLng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				document.getElementById("h_info2").setAttribute("value", results[1].place_id);
				document.getElementById("h_info3").setAttribute("value", results[1].formatted_address);
				getInfoHelper(results[1].place_id, latLng, "yellow");
			}
		}
	});

	document.getElementById("h_info1").setAttribute("value", latLng);
}

function getInfoHelper(placeID, latLng, markerColor){
	
	const request = {
	    placeId: placeID,
	    fields: ["name", "formatted_address", "place_id", "geometry", "photo", "rating", "formatted_phone_number", "opening_hours", "website"],
	};
  
  const infowindow = new google.maps.InfoWindow();
  const service = new google.maps.places.PlacesService(map);

  service.getDetails(request, (place, status) => {
    if (
      status === google.maps.places.PlacesServiceStatus.OK &&
      place &&
      place.geometry &&
      place.geometry.location
    ) {
      const marker = new google.maps.Marker({
        map,
        position: latLng,
		icon: {
			url: "http://maps.google.com/mapfiles/ms/icons/" + markerColor + "-dot.png"
		  }
      });

	google.maps.event.addListener(marker, "click", () => {
		const content = document.createElement("div");

		const nameElement = document.createElement("h2");

		nameElement.textContent = place.name;
		content.appendChild(nameElement);

		const placeAddressElement = document.createElement("p");
		placeAddressElement.textContent = "Address: " + place.formatted_address;
		content.appendChild(placeAddressElement);

		const opening_hourElement = document.createElement("p");
		opening_hourElement.textContent = "Opening Hours: " + place.opening_hours;
		content.appendChild(opening_hourElement);

		const phone_numberElement = document.createElement("p");
		phone_numberElement.textContent = "Phone Number: " + place.formatted_phone_number;
		content.appendChild(phone_numberElement);

		const websiteElement = document.createElement("p");
		websiteElement.textContent = "Website: " + place.website;
		content.appendChild(websiteElement);

		infowindow.setContent(content);
		infowindow.open(map, marker);
      });
    }
  });
}


function searchPlaces(latLng){
	
	latLng = querymarker_latLng;

	radius = document.getElementById("h_info4").value;
	//alert(radius)

	keywords = []
	keywords = document.getElementById("h_info5").value.split(",");
	//alert(keywords)

	const request = {
		location: latLng,
		radius: radius,
		type: keywords
	};
	
	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		//alert(results.length);
		for (var i = 0; i < results.length; i++) {
			// create markers
			var place = results[i];

			if (!place.geometry || !place.geometry.location) return;
  
			getInfoHelper(place.place_id, place.geometry.location, "green");
		}
	}
}
  