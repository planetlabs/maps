import Map from '../../../../lib/Map.js';
import React, {useCallback, useState} from 'react';
import View from '../../../../lib/View.js';
import WebGLTile from '../../../../lib/layer/WebGLTile.js';
import XYZ from '../../../../lib/source/XYZ.js';
import {createRoot} from 'react-dom/client';

function App() {
  const [viewState, setViewState] = useState({
    center: [0, 0],
    zoom: 0,
    rotation: 0,
  });

  const onViewChange = useCallback(event => {
    const view = event.target;
    setViewState({
      center: view.getCenter(),
      zoom: view.getZoom(),
      rotation: view.getRotation(),
    });
  }, []);

  return (
    <>
      <Map style={{width: '100%', height: '100%'}}>
        <View
          center={viewState.center}
          zoom={viewState.zoom}
          rotation={viewState.rotation}
          onChange={onViewChange}
        />
        <WebGLTile>
          <XYZ url="/data/tiles/osm/{z}/{x}/{y}.png" options={{maxZoom: 2}} />
        </WebGLTile>
      </Map>
      <button
        id="view-update-button"
        style={{position: 'absolute', top: 10, left: 10}}
        onClick={() =>
          setViewState({...viewState, zoom: 2, rotation: Math.PI / 4})
        }
      >
        update view
      </button>
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
