/*
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-undef, @typescript-eslint/no-unused-vars, no-unused-vars */
import "./style.css";
const layers = require("json-loader!./commaps.geojson");

async function initMap() {
  const myLatlng = { lat: 41.8348769, lng: -87.7881208 };

  const map = new google.maps.Map(document.getElementById("map")!, {
    zoom: 11.5,
    center: myLatlng,
  });
  map.data.addGeoJson(layers);
  map.data.setStyle({ clickable: false });
  map.data.setStyle(function (feature) {
    var color = "gray";
    if (feature.getProperty("isColorful")) {
      color = "red";
    }
    return /** @type {!google.maps.Data.StyleOptions} */ {
      fillColor: color,
      strokeColor: color,
      strokeWeight: 2,
      clickable: false,
    };
  });
  map.data.addListener("click", function (event) {
    // event.feature.setProperty('isColorful', true);
  });
  // Create the initial InfoWindow.
  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });
  infoWindow.open(map);

  // Configure the click listener.
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    const output:Array<string> = [];

    map.data.forEach((x) => {
      const g = x.getGeometry();
      if (g instanceof google.maps.Data.MultiPolygon) {
        const polys = g.getArray();
        const latLons = polys[0].getAt(0).getArray();
        const testPoly = new google.maps.Polygon({ paths: latLons });
        if (
          google.maps.geometry.poly.containsLocation(
            mapsMouseEvent.latLng,
            testPoly
          )
        ) {
          // console.log(testPoly);

          output.push(`${x.getProperty('file').split('/')[1]}`)
          x.forEachProperty((x,y) => console.log(`x:${x}\ny:${y}`))
          x.setProperty("isColorful", true);
        } else x.setProperty("isColorful", false);
        // console.log(x.getGeometry()?.getType());
      }
      // google.maps.geometry.poly.containsLocation(mapsMouseEvent.latLng,x.getGeometry() as google.maps.Data.Polygon)
    });
    infoWindow.close();

    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(output.join("<br/>")
      // JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);
  });
}

export { initMap };
