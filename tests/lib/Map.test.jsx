import Map from '../../lib/Map.js';
import OLMap from 'ol/Map.js';
import React from 'react';
import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';

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
    let mapRef;
    render(
      <div style={style}>
        <Map ref={r => (mapRef = r)} />
      </div>,
    );

    expect(mapRef).toBeInstanceOf(OLMap);
  });
});
