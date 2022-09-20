import Map from '../../../../lib/Map.js';
import React from 'react';
import View from '../../../../lib/View.js';
import WebGLTile from '../../../../lib/layer/WebGLTile.js';
import XYZ from '../../../../lib/source/XYZ.js';
import {createRoot} from 'react-dom/client';

function App() {
  return (
    <Map style={{width: '100%', height: '100%'}}>
      <View options={{center: [0, 0], zoom: 1, rotation: Math.PI / 8}} />
      <WebGLTile>
        <XYZ url="/data/tiles/osm/{z}/{x}/{y}.png" options={{maxZoom: 2}} />
      </WebGLTile>
    </Map>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
