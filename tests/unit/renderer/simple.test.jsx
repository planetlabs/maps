// @vitest-environment jsdom
import Map from '../../../lib/Map.js';
import OLMap from 'ol/Map.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import VectorLayer from '../../../lib/layer/Vector.js';
import {act} from 'react-dom/test-utils';
import {beforeEach, describe, expect, test} from 'vitest';

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
