import Map from '../../../../lib/Map.js';
import OSM from '../../../../lib/source/OSM.js';
import React from 'react';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import View from '../../../../lib/View.js';

function Basic() {
  return (
    <Map>
      <View options={{center: [0, 0], zoom: 1}} />
      <TileLayer>
        <OSM />
      </TileLayer>
    </Map>
  );
}

export default Basic;
