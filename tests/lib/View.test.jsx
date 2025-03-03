import {cleanup, render} from '@testing-library/react';
import OLView from 'ol/View.js';
import React from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import Map from '../../lib/Map.js';
import View from '../../lib/View.js';
import TileLayer from '../../lib/layer/Tile.js';
import OSM from '../../lib/source/OSM.js';
import {callback} from './util.js';

afterEach(() => {
  cleanup();
});

// shared style for map target
const style = {width: 512, height: 256};

describe('<View>', () => {
  it('adds a view to a map', () => {
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

  it('accepts center, zoom, and rotation props', () => {
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

  it('accepts an onChange listener', async () => {
    const onChange = callback(event => {
      const view = event.target;
      return view.getCenter();
    });

    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)}>
          <View
            center={[1, 2]}
            zoom={3}
            rotation={4}
            onChange={onChange.handler}
          />
          <TileLayer>
            <OSM />
          </TileLayer>
        </Map>
      </div>,
    );

    const view = map.getView();
    view.setCenter([10, 20]);

    const center = await onChange.called;
    expect(center).toEqual([10, 20]);
  });

  it('accepts an onChange:center listener', async () => {
    const onChangeCenter = callback(event => {
      const view = event.target;
      return view.getCenter();
    });

    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)}>
          <View
            center={[1, 2]}
            zoom={3}
            rotation={4}
            onChange:center={onChangeCenter.handler}
          />
        </Map>
      </div>,
    );

    const view = map.getView();
    view.setCenter([10, 20]);

    const center = await onChangeCenter.called;
    expect(center).toEqual([10, 20]);
  });

  it('accepts an onChange-center listener', async () => {
    const onChangeCenter = callback(event => {
      const view = event.target;
      return view.getCenter();
    });

    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)}>
          <View
            center={[1, 2]}
            zoom={3}
            rotation={4}
            onChange-center={onChangeCenter.handler}
          />
        </Map>
      </div>,
    );

    const view = map.getView();
    view.setCenter([10, 20]);

    const center = await onChangeCenter.called;
    expect(center).toEqual([10, 20]);
  });
});
