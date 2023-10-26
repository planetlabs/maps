import GeoJSON from 'ol/format/GeoJSON.js';
import Layer from '../../../../lib/layer/Vector.js';
import Map from '../../../../lib/Map.js';
import React, {useState} from 'react';
import Source from '../../../../lib/source/Vector.js';
import View from '../../../../lib/View.js';

const format = new GeoJSON();

function Vector() {
  const [urbanColor, setUrbanColor] = useState('gray');

  return (
    <>
      <Map>
        <View options={{center: [0, 0], zoom: 1}} />
        <Layer
          style={{
            'fill-color': 'lightgray',
          }}
        >
          <Source
            options={{
              url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_ocean.geojson',
              format,
            }}
          />
        </Layer>
        <Layer
          style={{
            'fill-color': urbanColor,
          }}
        >
          <Source
            options={{
              url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson',
              format,
            }}
          />
        </Layer>
      </Map>
      <div style={{position: 'absolute', top: '1rem', right: '1rem'}}>
        <button onClick={() => setUrbanColor('gray')}>gray</button>
        <button onClick={() => setUrbanColor('red')}>red</button>
      </div>
    </>
  );
}

export default Vector;
