import Map from '../../../../lib/Map.js';
import React, {useCallback, useState} from 'react';
import SentinelHub from '../../../../lib/source/SentinelHub.js';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import View from '../../../../lib/View.js';
import {useGeographic as geographic} from 'ol/proj.js';

geographic();

const data = [
  {
    type: 'sentinel-2-l2a',
    dataFilter: {
      timeRange: {
        from: '2024-05-30T00:00:00Z',
        to: '2024-06-01T00:00:00Z',
      },
    },
  },
];

const evalscript = {
  setup: () => ({
    input: ['B12', 'B08', 'B04'],
    output: {bands: 3},
  }),
  evaluatePixel: sample => [2.5 * sample.B12, 2 * sample.B08, 2 * sample.B04],
};

function SentinelHubExample() {
  const [auth, setAuth] = useState(null);

  const onSubmit = useCallback(event => {
    const clientId = event.target.elements.id.value;
    const clientSecret = event.target.elements.secret.value;
    setAuth({clientId, clientSecret});
  }, []);

  if (!auth) {
    return (
      <dialog id="auth-dialog" open>
        <form
          method="dialog"
          id="auth-form"
          onSubmit={onSubmit}
          style={{display: 'flex', flexDirection: 'column'}}
        >
          <label>
            Client id
            <br />
            <input type="text" name="id" autoFocus />
          </label>
          <label>
            Client secret
            <br />
            <input type="password" name="secret" />
          </label>
          <input type="submit" value="show map" style={{marginTop: '1rem'}} />
        </form>
      </dialog>
    );
  }

  return (
    <Map>
      <View
        options={{center: [-121.75, 46.85], zoom: 10, minZoom: 7, maxZoom: 13}}
      />
      <TileLayer>
        <SentinelHub auth={auth} data={data} evalscript={evalscript} />
      </TileLayer>
    </Map>
  );
}

export default SentinelHubExample;
