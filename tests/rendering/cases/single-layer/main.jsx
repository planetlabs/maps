import React from 'react';
import {createRoot} from 'react-dom/client';
import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import WebGLTile from '../../../../lib/layer/WebGLTile.js';
import XYZ from '../../../../lib/source/XYZ.js';

function App() {
  return (
    <Map style={{width: '100%', height: '100%'}}>
      <View center={[0, 0]} zoom={1} />
      <WebGLTile>
        <XYZ url="/data/tiles/osm/{z}/{x}/{y}.png" options={{maxZoom: 2}} />
      </WebGLTile>
    </Map>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
