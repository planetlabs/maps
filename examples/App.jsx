import Map from '../lib/Map.js';
import OSM from '../lib/source/OSM.js';
import React, {useCallback, useRef, useState} from 'react';
import ScaleLine from '../lib/control/ScaleLine.js';
import VectorLayer from '../lib/layer/Vector';
import VectorSource from '../lib/source/Vector';
import View from '../lib/View.js';
import WebGLTile from '../lib/layer/WebGLTile.js';

import Feature from 'ol/Feature';
import Overlay from '../lib/Overlay.js';
import Polygon from 'ol/geom/Polygon';
import {fromLonLat} from 'ol/proj';

function makeABox(lon, lat) {
  return new Feature({
    geometry: new Polygon([
      [
        [lon, lat],
        [lon - 1, lat],
        [lon - 1, lat - 1],
        [lon, lat - 1],
        [lon, lat],
      ].map(c => fromLonLat(c)),
    ]),
  });
}

function App() {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({center: [0, 0], zoom: 1});
  const [visible, setVisible] = useState(true);
  const [showVector, setShowVector] = useState(true);
  const [features, setFeatures] = useState([makeABox(-93, 44)]);

  const [popupElement, setPopupElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const onViewChange = useCallback(event => {
    const view = event.target;
    const newCenter = view.getCenter();
    const newZoom = view.getZoom();
    setViewState({
      center: newCenter,
      zoom: newZoom,
    });
  }, []);

  const onMapSingleClick = useCallback(event => {
    setPopupPosition(event.coordinate);
  }, []);

  return (
    <>
      <Map ref={mapRef} onSingleClick={onMapSingleClick}>
        <View
          center={viewState.center}
          zoom={viewState.zoom}
          onChange={onViewChange}
        />

        <WebGLTile visible={visible}>
          <OSM />
        </WebGLTile>
        {showVector && (
          <VectorLayer>
            <VectorSource features={features}></VectorSource>
          </VectorLayer>
        )}

        <ScaleLine />
        <Overlay
          element={popupElement}
          position={popupPosition}
          positioning="bottom-center"
        />
      </Map>

      <div
        ref={setPopupElement}
        onClick={() => setPopupPosition(null)}
        style={{
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        popup (click to close)
      </div>

      <div
        className="toolbar"
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          padding: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        <button onClick={() => setVisible(!visible)}>Toggle visibility</button>

        <button
          onClick={() => {
            const view = mapRef.current.getView();
            view.animate({duration: 250, zoom: view.getZoom() + 1});
          }}
        >
          Zoom In
        </button>

        <button
          onClick={() => {
            setShowVector(!showVector);
          }}
        >
          Toggle layer
        </button>
        <button
          onClick={() => {
            setFeatures([
              makeABox(Math.random() * 340 - 170, Math.random() * 180 - 92),
            ]);
          }}
        >
          move box feature
        </button>
      </div>
    </>
  );
}

export default App;
