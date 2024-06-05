import Map from '../../lib/Map.js';
import OLView from 'ol/View.js';
import React from 'react';
import View from '../../lib/View.js';
import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';

// shared style for map target
const style = {width: 512, height: 256};

describe('<View>', () => {
  it('adds a view to a map', async () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)}>
          <View options={{center: [1, 2], zoom: 3}} />
        </Map>
      </div>,
    );

    const view = map.getView();
    expect(view).toBeInstanceOf(OLView);
    expect(view.getCenter()).toEqual([1, 2]);
    expect(view.getZoom()).toEqual(3);
  });

  it('accepts center, zoom, and rotation props', async () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)}>
          <View center={[1, 2]} zoom={3} rotation={4} />
        </Map>
      </div>,
    );

    const view = map.getView();
    expect(view).toBeInstanceOf(OLView);
    expect(view.getCenter()).toEqual([1, 2]);
    expect(view.getZoom()).toEqual(3);
    expect(view.getRotation()).toEqual(4);
  });
});
