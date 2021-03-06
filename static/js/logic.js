// URLs for earthquakes and lines
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var lineUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// Reading data and consoling
d3.json(lineUrl, function(platesdata){
  console.log(platesdata.features) 
  d3.json(queryUrl, function(earthquakedata) {
    console.log(earthquakedata.features)
    createFeatures(platesdata,earthquakedata) 
  
  })
  })

//Function to create circle markers of the earthquakes and lines on the map
function createFeatures(platesdata,earthquakedata) {

    // Define function to set the circle color based on the magnitude
    function circleColor(depth) {
    if (depth < 10) {
    return '#ffffcc'
    }
    else if (depth < 30) {
    return '#addd8e'
    }
    else if (depth < 50) {
    return '#9ebcda'
    }
    else if (depth < 70) {
    return '#41b6c4'
    }
    else if (depth < 90) {
    return '#253494'
    }
    else {
    return '#bd0026'
    }
   }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakedata, {
        onEachFeature: onEachFeature,
        pointToLayer: function (earthquakeData, latlng) {
            return L.circleMarker(latlng, {
                radius: earthquakeData.properties.mag * 6,
                color: circleColor(earthquakeData.geometry.coordinates[2]),
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
      });
    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    
    // For lines
    var lines = L.geoJSON(platesdata, {
      onEachFeature: function (feature, layer) {
        L.polyline(feature.geometry.coordinates);
      },
      style: function(feature) {
        return {
          color: "#2a52be",
          weight: 3,
          fillOpacity: 0
        };
      }
    });

    // Sending our earthquakes and lines layer to the createMap function
    createMap(earthquakes,lines);
}



// Function to create a map
function createMap(earthquakes, lines) {

  // Define Map layers
  //  Greyscale
   var greyscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
    });
      
   // satellite
   var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  // outdoors
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "?? <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> ?? <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });
      
   // Define a baseMaps object to hold our base layers
   var baseMaps = {
    "Satellite": satellite,
    "Grayscale": greyscale,
    "Outdoors": outdoors
  };
      
  // Create overlay object to hold our overlay layer
   var overlayMaps = {
   "Earthquakes": earthquakes,
   "Fault Lines": lines
  };

  // create map object
   var myMap = L.map('map', {
   center: [37.09, -95.71],
   zoom: 3,
   layers: [satellite, earthquakes, lines]
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
  }).addTo(myMap);

  // Create a legend to display information about our map
  var legend = L.control({position: 'bottomright'});
  
  // When the layer control is added, insert a div with the class of "info legend"
  legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      levels = ['-10-10','10-30','30-50','50-70','70-90','90+'],
      colors = ['#ffffcc','#addd8e','#9ebcda','#41b6c4','#253494','#bd0026'];

  // loop through our levels and colors declared above
  for (var i = 0; i < levels.length; i++) {
      div.innerHTML += '<i style="background:' + colors[i] + '"></i>' + levels[i] + '<br>';
  }
   return div;
  };
 
  // Add the legend to the map
  legend.addTo(myMap);

}