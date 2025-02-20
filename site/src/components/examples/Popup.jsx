import React, {useCallback, useState} from 'react';
import Map from '../../../../lib/Map.js';
import Overlay from '../../../../lib/Overlay.js';
import View from '../../../../lib/View.js';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import OSM from '../../../../lib/source/OSM.js';

function Popup() {
  const [popupElement, setPopupElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const onMapSingleClick = useCallback(event => {
    setPopupPosition(event.coordinate);
  }, []);

  return (
    <>
      <Map onSingleClick={onMapSingleClick}>
        <View options={{center: [0, 0], zoom: 1}} />
        <TileLayer>
          <OSM />
        </TileLayer>

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
        popup content (click to close)
      </div>
    </>
  );
}

export default Popup;
