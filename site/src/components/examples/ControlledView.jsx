import Map from '../../../../lib/Map.js';
import OSM from '../../../../lib/source/OSM.js';
import React, {useCallback, useState} from 'react';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import View from '../../../../lib/View.js';
import {useGeographic as geographic} from 'ol/proj.js';

geographic();

function round(num, digits) {
  const factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;
}

function formatViewState(viewState) {
  const lon = round(viewState.center[0], 2);
  const lat = round(viewState.center[1], 2);
  const NS = lat >= 0 ? 'N' : 'S';
  const EW = lon >= 0 ? 'E' : 'W';
  const zoom = round(viewState.zoom, 1);
  return `zoom: ${zoom}; lon: ${Math.abs(lon)}° ${EW}; lat: ${Math.abs(
    lat,
  )}° ${NS}`;
}

function ControlledView() {
  const [viewState, setViewState] = useState({center: [0, 0], zoom: 1});

  const onViewChange = useCallback(event => {
    const view = event.target;
    setViewState({
      center: view.getCenter(),
      zoom: view.getZoom(),
    });
  }, []);

  return (
    <div style={{position: 'relative', height: '100%'}}>
      <Map>
        <View
          center={viewState.center}
          zoom={viewState.zoom}
          onChange={onViewChange}
        />
        <TileLayer>
          <OSM />
        </TileLayer>
      </Map>
      <div style={{position: 'absolute', bottom: '10px', left: '10px'}}>
        {formatViewState(viewState)}
      </div>
    </div>
  );
}

export default ControlledView;
