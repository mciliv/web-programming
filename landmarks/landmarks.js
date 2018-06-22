// landmarks.js
// By: Morgan Ciliv
// Landmarks: Finds the location of fellow students and landmarks nearest you
/*___________________________________________________________________________*/

// Global Variables
var xhr = new XMLHttpRequest();
var url = "http://vast-coast-60286.herokuapp.com/sendLocation";
var username = "MOLLIE_BLANKENSHIP";
var myLat = 42.4069; // just to set to some intial value
var myLng = -71.1198; // just to set to some intial value
var map;

var theData;
var thePeople = [];
var thePeople_1mi = [];
var theLandmarks = [];
var theLandmarks_1mi = [];
var closestLandmark;
var distClosestLandmark = Number.MAX_VALUE; // initial value

var myMarker;
var infoWindowContent = [];

/*___________________________________________________________________________*/

function initMap() {
	getMyLocation();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: myLat, lng: myLng},
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.TERRAIN
	});
}

function getMyLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosVars);
	}
}

function getPosVars(position) {
	myLat = position.coords.latitude;
	myLng = position.coords.longitude;
	parse();
}

function parse() {
	// Step 1: Make the request
	var params = "login=" + username + "&lat=" + myLat + "&lng=" + myLng;
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	
	// Step 2: Handle the request
	xhr.onreadystatechange = getUserData;

	// Step 3: Data is ready, so there's a response
	function getUserData() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			theData = JSON.parse(xhr.responseText);	
			thePeople = theData["people"];
			theLandmarks = theData["landmarks"];

			detPeopleWithin_1mi();
			detLandmarksWithin_1mi_andClosest();

			setPeopleMarkers();
			setLandmarksMarkers();
			setMeUp();

			setPolyLine();
		}
		else if (xhr.readyState == 4 && xhr.status != 200) {
			alert('Error! Status code: ' + xhr.status);
		}	
	}

	// Step 4: Send off the 
	xhr.send(params);
}

// Adds the appropriate people to the thePeople_1mi array
function detPeopleWithin_1mi() {
	for(i = 0; i < thePeople.length; i++) {
		var itLat = thePeople[i].lat;
		var itLng = thePeople[i].lng;
		var distance = dist(myLat, myLng, itLat, itLng);
		if (distance <= 1) {
			thePeople_1mi.push(thePeople[i]);
		}
	}
}

// Adds the appropriate landmarks to theLandmarks_1mi array
function detLandmarksWithin_1mi_andClosest() {
	for(i = 0; i < theLandmarks.length; i++) {
		var itLat = theLandmarks[i].geometry.coordinates[1];
		var itLng = theLandmarks[i].geometry.coordinates[0];
		var distance = dist(myLat, myLng, itLat, itLng);
		if (distance <= 1) {
			theLandmarks_1mi.push(theLandmarks[i]);
		}
		if (distance < distClosestLandmark) {
			closestLandmark = theLandmarks[i];
			distClosestLandmark = distance;
		}
	}
}

// converts degrees to Radians
function toRad(input) {
   return (input * Math.PI) / 180;
}

// The Haversine Formula modeled from Stack Overflow...
function dist(lat1, lon1, lat2, lon2) {

	var R = 6371; // km 
	var x1 = lat2-lat1;
		var dLat = toRad(x1);  
	var x2 = lon2-lon1;
	var dLon = toRad(x2);  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
	                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
	                Math.sin(dLon/2) * Math.sin(dLon/2);  
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return R * c; // the final distance
}

function setPeopleMarkers() {
	var image = "Tufts.jpg";
	for (i = 0; i < thePeople_1mi.length; i++) {
		if (thePeople_1mi[i].login != username) {
			var theLat = thePeople_1mi[i].lat;
			var theLng = thePeople_1mi[i].lng;
			var latlng = {lat: theLat, lng: theLng};

			var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				icon: image,
				title: thePeople_1mi[i].login
			});
			
			var contentString = '<div>' + thePeople_1mi[i].login +
			'</div> <div>' + dist(myLat,myLng,theLat,theLng) + '</div>'; 

			infoWindow(marker, contentString);
			marker.setMap(map);
		}
	}	
}

function infoWindow(marker, contentString) {

	var infowindow = new google.maps.InfoWindow();
	infowindow.close();
	google.maps.event.addListener(marker, 'click', function() {
	 	infowindow.setContent(contentString);
	 	infowindow.open(map, marker);
	});
}

function setLandmarksMarkers() {
	var image = 'pyramid.jpg';
	for (i = 0; i < theLandmarks_1mi.length; i++) {
		var theLat = theLandmarks_1mi[i].geometry.coordinates[1];
		var theLng = theLandmarks_1mi[i].geometry.coordinates[0];
		var latlng = {lat: theLat, lng: theLng};
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			icon: image
		});	

		var contentString = '<div>' +
		theLandmarks_1mi[i].properties.Details
		+ '</div>'; 

		infoWindow(marker, contentString);
		marker.setMap(map);
	}
}

function setMeUp() {
	var image = "yinyang.png";
	me = new google.maps.LatLng(myLat,myLng);

	myMarker = new google.maps.Marker({
		position: me,
		title: username,
		icon: image
	});
	myMarker.setMap(map);

	var contentString = '<div> Your location</div><div>Lat:' + myLat +
						', Lng: ' + myLng + '</div>' +
						'<div>Closest landmark to you is ' +
						closestLandmark.properties.Location_Name +
						' which is ' + distClosestLandmark +
						' miles away.'; 

	var infowindow = new google.maps.InfoWindow();

	google.maps.event.addListener(myMarker, 'click', function() {
	 	infowindow.setContent(contentString);
	 	infowindow.open(map, myMarker);
	});
}

function setPolyLine() {
	var closeLMLat = closestLandmark.geometry.coordinates[1];
	var closeLMLng = closestLandmark.geometry.coordinates[0];
	var pathLM = [
		{lat: myLat, lng: myLng},
		{lat: closeLMLat, lng: closeLMLng}
	];

	var landPoly = new google.maps.Polyline({
		path: pathLM,
		strokeColor: '#FF0000',
		strokeWeight: 2
	});

	landPoly.setMap(map);
}
