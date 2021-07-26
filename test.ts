import Minimap from "./UI/Base/Minimap";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {UIEventSource} from "./Logic/UIEventSource";
import ShowDataLayer from "./UI/ShowDataLayer";
import 'leaflet-polylineoffset';

// Way for testing purposes
const way = {
    "type": "Feature",
    "properties": {
        "highway": "residential",
        "maxweight": "3.5",
        "maxweight:conditional": "none @ delivery",
        "name": "Silsstraat",
        "cyclestreet": "yes",
        "_last_edit:contributor": "Jorisbo",
        "_last_edit:contributor:uid": 1983103,
        "_last_edit:changeset": 70963524,
        "_last_edit:timestamp": "2019-06-05T18:20:44Z",
        "_version_number": 9,
        "id": "way/23583625"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                4.4889691,
                51.2049831
            ],
            [
                4.4895496,
                51.2047718
            ],
            [
                4.48966,
                51.2047147
            ],
            [
                4.4897439,
                51.2046548
            ],
            [
                4.4898162,
                51.2045921
            ],
            [
                4.4902997,
                51.2038418
            ]
        ]
    }
}

// Initialize the state
State.state = new State(AllKnownLayouts.allKnownLayouts.get("fietsstraten"));
State.state.allElements.addOrGetElement(way);

// Initialize minimap
const miniMap = new Minimap({background: State.state.backgroundLayer, allowMoving: true});
miniMap.SetStyle("width: 100%; height: 24rem;");

miniMap.leafletMap.addCallbackAndRunD((leafletMap) => {
    console.log("Coordinates: ", way.geometry.coordinates)
    const newCoords = L.GeoJSON.coordsToLatLngs(way.geometry.coordinates)
    const pl1 = L.polyline(newCoords, {
        color: '#f00',
        opacity: 0.3,
        weight: 10;
        offset: -10});
    const pl2 = L.polyline(newCoords, {
        color: '#0f0',
        opacity: 0.3,
        weight: 10,
        offset: 10});
    pl1.addTo(leafletMap);
    pl2.addTo(leafletMap);
    console.log("Added to map")
})

// Show the road on the minimap
const roadElement = State.state.allElements.ContainingFeatures.get("way/23583625");
console.log(roadElement)
const roadEventSource = new UIEventSource([{feature: roadElement, freshness: new Date()}]);
new ShowDataLayer(roadEventSource, miniMap.leafletMap, State.state.layoutToUse, false, true);

// const roadVector = getRoadDirectionVector(roadElement); // Get the direction vector of the road
// const normalRoadVector = getNorm(roadVector); // Returns the perpendicular vector
// const rightWay = way; // TODO: deepcopy

miniMap.AttachTo("maindiv")