import {cleanup, render, screen} from '@testing-library/react';
import OLMap from 'ol/Map.js';
import React from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import Map from '../../lib/Map.js';
import Zoom from '../../lib/control/Zoom.js';

afterEach(() => {
  cleanup();
});

// shared style for map target
const style = {width: 512, height: 256};

describe('<Map>', () => {
  it('renders a map', () => {
    render(
      <div data-testid="test" style={style}>
        <Map />
      </div>,
    );

    expect(screen.getByTestId('test').childNodes.length).toBe(1);
  });

  it('accepts a ref for accessing the map', () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)} />
      </div>,
    );

    expect(map).toBeInstanceOf(OLMap);
  });

  it('creates a map with the default controls', () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)} />
      </div>,
    );

    expect(map).toBeInstanceOf(OLMap);
    const controls = map.getControls();
    expect(controls.getLength()).toBe(3);
  });

  it('allows custom controls to be passed', () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)} controls={[]}>
          <Zoom options={{className: 'custom'}} />
        </Map>
      </div>,
    );

    expect(map).toBeInstanceOf(OLMap);
    const controls = map.getControls();
    expect(controls.getLength()).toBe(1);
  });

  it('allows options to be passed', () => {
    let map;
    render(
      <div style={style}>
        <Map ref={r => (map = r)} options={{controls: []}} />
      </div>,
    );

    expect(map).toBeInstanceOf(OLMap);
    const controls = map.getControls();
    expect(controls.getLength()).toBe(0);
  });
});
