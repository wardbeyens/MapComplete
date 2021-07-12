import { UIEventSource } from "./Logic/UIEventSource";
import { FixedUiElement } from "./UI/Base/FixedUiElement";
import Minimap from "./UI/Base/Minimap";

var debug = {};

//LEAFLET TRYOUT
//var mymap = L.map('mapid').setView([51.505, -0.09], 13);

// L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken: 'your.mapbox.access.token'
// }).addTo(mymap);

//`{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`

const mymap = new Minimap
mymap.SetStyle("h-1/3")
mymap.AttachTo("maindiv")


//VECTOR TILES
var map = L.map('mapid').setView([-5, 27.4], 5); // africa

L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 18,
  id: 'examples.map-i86knfo3'
}).addTo(map);

// var mvtSource = new L.TileLayer.MVTSource({
//   url: "http://spatialserver.spatialdev.com/services/vector-tiles/GAUL_FSP/{z}/{x}/{y}.pbf",
//   debug: true,
//   clickableLayers: ["GAUL0"],
//   getIDForLayerFeature: function(feature) {
//     return feature.properties.id;
//   },

//   /**
//    * The filter function gets called when iterating though each vector tile feature (vtf). You have access
//    * to every property associated with a given feature (the feature, and the layer). You can also filter
//    * based of the context (each tile that the feature is drawn onto).
//    *
//    * Returning false skips over the feature and it is not drawn.
//    *
//    * @param feature
//    * @returns {boolean}
//    */
//   filter: function(feature, context) {
//     if (feature.layer.name === 'GAUL0') {
//       return true;
//     }
//     return false;
//   },

//   style: function (feature) {
//     var style = {};

//     var type = feature.type;
//     switch (type) {
//       case 1: //'Point'
//         style.color = 'rgba(49,79,79,1)';
//         style.radius = 5;
//         style.selected = {
//           color: 'rgba(255,255,0,0.5)',
//           radius: 6
//         };
//         break;
//       case 2: //'LineString'
//         style.color = 'rgba(161,217,155,0.8)';
//         style.size = 3;
//         style.selected = {
//           color: 'rgba(255,25,0,0.5)',
//           size: 4
//         };
//         break;
//       case 3: //'Polygon'
//         style.color = fillColor;
//         style.outline = {
//           color: strokeColor,
//           size: 1
//         };
//         style.selected = {
//           color: 'rgba(255,140,0,0.3)',
//           outline: {
//             color: 'rgba(255,140,0,1)',
//             size: 2
//           }
//         };
//         break;
//     }
//     return style;
//   }

// });
// debug.mvtSource = mvtSource;

// //Globals that we can change later.
// var fillColor = 'rgba(149,139,255,0.4)';
// var strokeColor = 'rgb(20,20,20)';

// //Add layer
// map.addLayer(mvtSource);