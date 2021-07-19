// THIS NEEDS TO GO INSIDE: var vectorTileStyling = {};
// 			water: {
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#06cccc',
// 				color: '#06cccc',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// 			},
// 			admin: {
// 				weight: 1,
// 				fillColor: 'pink',
// 				color: 'pink',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			waterway: {
// 				weight: 1,
// 				fillColor: '#2375e0',
// 				color: '#2375e0',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			landcover: {
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#53e033',
// 				color: '#53e033',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// 			},
// 			landuse: {
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#e5b404',
// 				color: '#e5b404',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			park: {
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#84ea5b',
// 				color: '#84ea5b',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			boundary: {
// 				weight: 1,
// 				fillColor: '#c545d3',
// 				color: '#c545d3',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			aeroway: {
// 				weight: 1,
// 				fillColor: '#51aeb5',
// 				color: '#51aeb5',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			road: {	// mapbox & nextzen only
// 				weight: 1,
// 				fillColor: '#f2b648',
// 				color: '#f2b648',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			tunnel: {	// mapbox only
// 				weight: 0.5,
// 				fillColor: '#f2b648',
// 				color: '#f2b648',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// // 					dashArray: [4, 4]
// 			},
// 			bridge: {	// mapbox only
// 				weight: 0.5,
// 				fillColor: '#f2b648',
// 				color: '#f2b648',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// // 					dashArray: [4, 4]
// 			},
// 			transportation: {	// openmaptiles only
// 				weight: 0.5,
// 				fillColor: '#f2b648',
// 				color: '#f2b648',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// // 					dashArray: [4, 4]
// 			},
// 			transit: {	// nextzen only
// 				weight: 0.5,
// 				fillColor: '#f2b648',
// 				color: '#f2b648',
// 				fillOpacity: 0.2,
// 				opacity: 0.4,
// // 					dashArray: [4, 4]
// 			},
// 			building: {
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#2b2b2b',
// 				color: '#2b2b2b',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			water_name: {
// 				weight: 1,
// 				fillColor: '#022c5b',
// 				color: '#022c5b',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			transportation_name: {
// 				weight: 1,
// 				fillColor: '#bc6b38',
// 				color: '#bc6b38',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			place: {
// 				weight: 1,
// 				fillColor: '#f20e93',
// 				color: '#f20e93',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			housenumber: {
// 				weight: 1,
// 				fillColor: '#ef4c8b',
// 				color: '#ef4c8b',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			poi: {
// 				weight: 1,
// 				fillColor: '#3bb50a',
// 				color: '#3bb50a',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},
// 			earth: {	// nextzen only
// 				fill: true,
// 				weight: 1,
// 				fillColor: '#c0c0c0',
// 				color: '#c0c0c0',
// 				fillOpacity: 0.2,
// 				opacity: 0.4
// 			},


// 			// Do not symbolize some stuff for mapbox
// 			country_label: [],
// 			marine_label: [],
// 			state_label: [],
// 			place_label: [],
// 			waterway_label: [],
// 			poi_label: [],
// 			road_label: [],
// 			housenum_label: [],


// 			// Do not symbolize some stuff for openmaptiles
// 			country_name: [],
// 			marine_name: [],
// 			state_name: [],
// 			place_name: [],
// 			waterway_name: [],
// 			poi_name: [],
// 			road_name: [],
// 			housenum_name: [],


//------------------------------------------------------ PREVIOUS TRYOUTS --------------------------------------------------------------------------------------------------------//

// import { UIEventSource } from "./Logic/UIEventSource";
// import { FixedUiElement } from "./UI/Base/FixedUiElement";
// import Minimap from "./UI/Base/Minimap";
//import * as L from "";


// var debug = {
//   mvtSource
// };

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


//MINIMAP TRYOUT
//`{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`
// const loc = new UIEventSource<Loc>(1, "Belgium");
// const mymap = new Minimap()
// mymap.SetStyle("h-1/3")
// mymap.AttachTo("map")


// //VECTOR TILES
// var map = L.map('mapid').setView([-5, 27.4], 5); // africa

// L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//   maxZoom: 18,
//   id: 'examples.map-i86knfo3'
// }).addTo(map);

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
//     var style = {
//       color: undefined,
//       radius: undefined,
//       selected: undefined,
//       size: undefined,
//       outline: undefined
//     };

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