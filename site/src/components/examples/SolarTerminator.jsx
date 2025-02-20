import Feature from 'ol/Feature.js';
import React, {useEffect, useState} from 'react';
import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import Layer from '../../../../lib/layer/Vector.js';
import TileLayer from '../../../../lib/layer/WebGLTile.js';
import OSM from '../../../../lib/source/OSM.js';
import Source from '../../../../lib/source/Vector.js';
import {getNightGeometry} from './solar.js';

const now = new Date();

// reuse a single feature, update the geometry as needed
const feature = new Feature();

/**
 * @param {Date} date Input date.
 * @return {number} The day number (starting with 1).
 */
function getDayOfYear(date) {
  return (
    1 +
    Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear())) / 86400000)
  );
}

/**
 * @param {number} UTC year.
 * @param {number} UTC day number (starting with 1).
 * @param {number} UTC hour.
 * @return {Date} The date.
 */
function getDate(year, day, hour) {
  const date = new Date(Date.UTC(year));
  date.setUTCDate(day);
  date.setUTCHours(hour, 60 * (hour % 1));
  return date;
}

function SolarTerminator() {
  const [day, updateDay] = useState(getDayOfYear(now));
  const [hour, updateHour] = useState(
    now.getUTCHours() + now.getUTCMinutes() / 60,
  );

  useEffect(() => {
    const date = getDate(now.getUTCFullYear(), day, hour);
    const polygon = getNightGeometry(date, 'EPSG:3857');
    feature.setGeometry(polygon);
  }, [day, hour]);

  return (
    <>
      <Map>
        <View options={{center: [0, 0], zoom: 1}} />
        <TileLayer>
          <OSM />
        </TileLayer>
        <Layer style={{'fill-color': '#00000033'}}>
          <Source options={{features: [feature]}} />
        </Layer>
      </Map>
      <div style={{width: 150, position: 'absolute', top: 10, right: 10}}>
        <b>{getDate(now.getUTCFullYear(), day, hour).toUTCString()}</b>
        <hr />
        <label>
          Day of the year
          <input
            type="range"
            min={0}
            max={366}
            style={{width: '100%'}}
            value={day}
            onChange={event => updateDay(parseInt(event.target.value))}
          />
        </label>
        <label>
          Hour of the Day
          <input
            type="range"
            min={0}
            max={24}
            step={1 / 60}
            style={{width: '100%'}}
            value={hour}
            onChange={event => updateHour(parseFloat(event.target.value))}
          />
        </label>
      </div>
    </>
  );
}

export default SolarTerminator;
