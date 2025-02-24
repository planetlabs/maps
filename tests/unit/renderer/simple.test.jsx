import OLMap from 'ol/Map.js';
import React, {act} from 'react';
import ReactDOM from 'react-dom/client';
import {beforeEach, describe, expect, test} from 'vitest';
import Map from '../../../lib/Map.js';
import VectorLayer from '../../../lib/layer/Vector.js';

global.IS_REACT_ACT_ENVIRONMENT = true;

describe('Simple smoke tests', () => {
  let root;
  beforeEach(() => {
    root = ReactDOM.createRoot(document.createElement('div'));
  });

  test('Renders a map and returns an OL Map as a Ref', () => {
    let mapRef;
    act(() => {
      root.render(<Map ref={r => (mapRef = r)} />);
    });
    expect(mapRef).toBeInstanceOf(OLMap);
  });

  test('Render a map with a layer', () => {
    let mapRef;
    act(() => {
      root.render(
        <Map ref={r => (mapRef = r)}>
          <VectorLayer />
        </Map>,
      );
    });
    expect(mapRef.getLayers().getLength()).toBe(1);
  });
});
