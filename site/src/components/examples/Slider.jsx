import React, {useState} from 'react';
import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import TileLayer from '../../../../lib/layer/Tile.js';
import XYZ from '../../../../lib/source/XYZ.js';

function Slider() {
  const [percent, updatePercent] = useState(50);

  function onPrerender(event) {
    const ctx = event.context;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, (ctx.canvas.width * percent) / 100, ctx.canvas.height);
    ctx.clip();
  }

  function onPostrender(event) {
    event.context.restore();
  }

  return (
    <>
      <Map>
        <View options={{center: [0, 0], zoom: 1}} />
        <TileLayer>
          <XYZ
            options={{
              url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
              attributions:
                'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
            }}
          />
        </TileLayer>
        <TileLayer onPrerender={onPrerender} onPostrender={onPostrender}>
          <XYZ
            options={{
              url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              attributions:
                'Imagery © <a href="https://services.arcgisonline.com/ArcGIS/' +
                'rest/services/World_Imagery/MapServer">ArcGIS</a>',
            }}
          />
        </TileLayer>
      </Map>
      <input
        type="range"
        min={0}
        max={100}
        step={0.25}
        style={{width: '100%'}}
        value={percent}
        onChange={event => updatePercent(parseInt(event.target.value))}
      />
    </>
  );
}

export default Slider;
