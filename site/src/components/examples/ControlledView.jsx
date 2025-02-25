import {useGeographic as geographic} from 'ol/proj.js';
import React, {useCallback, useState} from 'react';
import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import OSM from '../../../../lib/source/OSM.js';

geographic();

/**
 * @param {number} num A number.
 * @param {number} digits The number of decimal places to retain.
 */
function round(num, digits) {
  const factor = Math.pow(10, digits);
  return Math.round(num * factor) / factor;
}

/**
 * @typedef {Object} ViewState
 * @property {Array<number>} center The view center.
 * @property {number} zoom The zoom level.
 */

/**
 * @param {ViewState} viewState The view State.
 */
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

  const onViewChange = useCallback(
    /**
     * @param {import("ol/events/Event.js").default} event The view change event.
     */
    event => {
      const view = event.target;
      setViewState({
        center: view.getCenter(),
        zoom: view.getZoom(),
      });
    },
    [],
  );

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
