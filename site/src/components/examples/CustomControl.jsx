import React, {useCallback, useState} from 'react';
import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import OSM from '../../../../lib/source/OSM.js';

/**
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props The button props.
 */
function MapButton(props) {
  return <button {...props}>⛶ reset view</button>;
}

const initialViewState = {center: [0, 0], zoom: 1};

function CustomControl() {
  const [viewState, setViewState] = useState(initialViewState);

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

  const onButtonClick = useCallback(() => {
    setViewState(initialViewState);
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
      <MapButton
        style={{position: 'absolute', top: '10px', right: '10px'}}
        onClick={onButtonClick}
      />
    </div>
  );
}

export default CustomControl;
