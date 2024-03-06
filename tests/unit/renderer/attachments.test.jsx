// @vitest-environment jsdom
import AttributionControl from '../../../lib/control/Attribution';
import DragPanInteraction from '../../../lib/interaction/DragPan';
import Feature from 'ol/Feature';
import ImageLayer from '../../../lib/layer/Image';
import ImageStatic from '../../../lib/source/ImageStatic';
import Map from '../../../lib/Map';
import MouseWheelZoomInteraction from '../../../lib/interaction/MouseWheelZoom';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import TileLayer from '../../../lib/layer/Tile';
import VectorLayer from '../../../lib/layer/Vector';
import VectorSource from '../../../lib/source/Vector';
import View from '../../../lib/View';
import ZoomControl from '../../../lib/control/Zoom';
import olAttributionControl from 'ol/control/Attribution';
import olDragPanInteraction from 'ol/interaction/DragPan';
import olImageLayer from 'ol/layer/Image';
import olMouseWheelZoomInteraction from 'ol/interaction/MouseWheelZoom';
import olStatic from 'ol/source/ImageStatic';
import olTileLayer from 'ol/layer/Tile';
import olVectorLayer from 'ol/layer/Vector';
import olVectorSource from 'ol/source/Vector';
import olZoomControl from 'ol/control/Zoom';
import {Point} from 'ol/geom';
import {act} from 'react-dom/test-utils';
import {describe, expect, test} from 'vitest';

global.IS_REACT_ACT_ENVIRONMENT = true;

async function miniRender(children, mapProps = {}) {
  let mapRef;
  await act(async () => {
    const container = document.createElement('div');
    ReactDOM.createRoot(container).render(
      <Map ref={r => (mapRef = r)} {...mapProps}>
        {children}
      </Map>,
    );
  });
  return mapRef;
}

describe('Static attachments', () => {
  test('correctly attaches a single layer to a map (implicit)', async () => {
    const map = await miniRender(<VectorLayer />);
    expect(map.getLayers().getLength()).toBe(1);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
  });

  test('correctly attaches a single layer to a map (explicit)', async () => {
    const map = await miniRender(<TileLayer />);
    expect(map.getLayers().getLength()).toBe(1);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olTileLayer);
  });

  test('correctly attaches a two layers to a map (explicit)', async () => {
    const map = await miniRender(
      <>
        <TileLayer properties={{name: 'first'}} />
        <TileLayer properties={{name: 'second'}} />
      </>,
    );
    expect(map.getLayers().getLength()).toBe(2);
    const firstLayer = map.getLayers().getArray()[0];
    expect(firstLayer).toBeInstanceOf(olTileLayer);
    expect(firstLayer.get('name')).toBe('first');
    expect(map.getLayers().getArray()[1].get('name')).toBe('second');
  });

  test('correctly attaches multiple layers to a map in order', async () => {
    const map = await miniRender(
      <>
        <VectorLayer />
        <TileLayer />
        <ImageLayer />
      </>,
    );
    expect(map.getLayers().getLength()).toBe(3);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olTileLayer);
    expect(map.getLayers().getArray()[2]).toBeInstanceOf(olImageLayer);
  });

  test('correctly attaches a layer and source with features', async () => {
    const features = [new Feature({geometry: new Point(0, 0)})];

    const map = await miniRender(
      <VectorLayer>
        <VectorSource features={features} />
      </VectorLayer>,
    );

    const src = map.getLayers().item(0).getSource();
    expect(src).toBeInstanceOf(olVectorSource);
    expect(src.getFeatures().length).toBe(1);
  });

  test('correctly attaches multiple layers to a map in order from a component', async () => {
    function MyLayers() {
      return (
        <>
          <VectorLayer />
          <TileLayer />
        </>
      );
    }

    const map = await miniRender(
      <>
        <MyLayers />
        <ImageLayer />
      </>,
    );
    expect(map.getLayers().getLength()).toBe(3);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olTileLayer);
    expect(map.getLayers().getArray()[2]).toBeInstanceOf(olImageLayer);
  });

  test('correctly attaches multiple interactions', async () => {
    const map = await miniRender(
      <>
        <DragPanInteraction />
        <MouseWheelZoomInteraction />
      </>,
      {interactions: []},
    );
    expect(map.getInteractions().getArray()).toHaveLength(2);
    expect(map.getInteractions().getArray()[0]).toBeInstanceOf(
      olDragPanInteraction,
    );
    expect(map.getInteractions().getArray()[1]).toBeInstanceOf(
      olMouseWheelZoomInteraction,
    );
  });

  test('correctly attaches multiple controls', async () => {
    const map = await miniRender(
      <>
        <ZoomControl />
        <AttributionControl />
      </>,
      {controls: []},
    );
    expect(map.getControls().getArray()).toHaveLength(2);
    expect(map.getControls().getArray()[0]).toBeInstanceOf(olZoomControl);
    expect(map.getControls().getArray()[1]).toBeInstanceOf(
      olAttributionControl,
    );
  });

  test('correctly attaches a view', async () => {
    const map = await miniRender(<View center={[3500, 3500]} />);
    expect(map.getView().getCenter()).toEqual([3500, 3500]);
  });

  test('ensure ImageStatic source works', async () => {
    const map = await miniRender(
      <ImageLayer>
        <ImageStatic
          options={{
            crossOrigin: 'anonymous',
            url: 'http://anon.xyz',
          }}
        />
      </ImageLayer>,
    );
    expect(map.getLayers().item(0).getSource()).toBeInstanceOf(olStatic);
    const src = map.getLayers().item(0).getSource();
    expect(src.getUrl()).toEqual('http://anon.xyz');
  });

  test('correctly attaches immutable components in order after reconstruction', async () => {
    let counter = 0;
    let externalEvent = () => {};

    // eslint-disable-next-line react/prop-types
    function OrthoImageSource({url}) {
      return (
        <ImageStatic
          options={{
            url,
          }}
          ref={e => {
            if (e && !e.test) {
              e.test = {};
            }
            if (e && e.test.skip === undefined) {
              e.test.skip = counter++;
            }
          }}
        />
      );
    }
    // eslint-disable-next-line react/prop-types
    function MyImageLayer({children, opacity = 1}) {
      return <ImageLayer opacity={opacity}>{children}</ImageLayer>;
    }
    function Inner() {
      const [state, setState] = useState(0.3);
      externalEvent = setState;
      return (
        <>
          <MyImageLayer opacity={0.2}>
            <OrthoImageSource url="http://aaa.com/{x}/{y}/{z}" />
          </MyImageLayer>
          <MyImageLayer opacity={state}>
            <ImageStatic
              options={{
                url: 'http://bbb.com/{x}/{y}/{z}',
              }}
              ref={e => {
                if (e && !e.test) {
                  e.test = {};
                }
                if (e && e.test.skip === undefined) {
                  e.test.skip = counter++;
                }
              }}
            />
          </MyImageLayer>
        </>
      );
    }

    const map = await miniRender(<Inner />);
    expect(map.getLayers().getArray()[0].getSource()).toBeInstanceOf(olStatic);
    expect(map.getLayers().getArray()[1].getSource()).toBeInstanceOf(olStatic);
    expect(map.getLayers().getArray()[0].getSource().test.skip).toBe(0);
    expect(map.getLayers().getArray()[1].getSource().test.skip).toBe(1);
    expect(map.getLayers().getArray()[0].getSource().getUrl()).toMatch(
      new RegExp('http://aaa.com?'),
    );
    expect(map.getLayers().getArray()[1].getSource().getUrl()).toMatch(
      new RegExp('http://bbb.com?'),
    );
    await act(async () => externalEvent(0.9));
    await act(async () => externalEvent(0.7));
    await act(async () => externalEvent(0.1));
    await act(async () => externalEvent(0.2));
    expect(map.getLayers().getArray()[0].getSource().test.skip).toBe(0);
    expect(map.getLayers().getArray()[1].getSource().test.skip).toBe(1);
    expect(map.getLayers().getArray()[0].getSource().getUrl()).toMatch(
      new RegExp('http://aaa.com?'),
    );
    expect(map.getLayers().getArray()[1].getSource().getUrl()).toMatch(
      new RegExp('http://bbb.com?'),
    );
  });
});

describe('Dynamic attachments', () => {
  test('correctly attaches and removes a new layer in the middle after a while', async () => {
    let externalEvent = () => {};
    function Component() {
      const [state, setState] = useState(false);
      externalEvent = setState;
      return (
        <>
          <VectorLayer />
          {state && <TileLayer />}
          <ImageLayer />
        </>
      );
    }
    const map = await miniRender(<Component />);
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(true));
    expect(map.getLayers().getLength()).toBe(3);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olTileLayer);
    expect(map.getLayers().getArray()[2]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(false));
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
  });

  test('correctly attaches and removes a new layer in the beginning after a while', async () => {
    let externalEvent = () => {};
    function Component() {
      const [state, setState] = useState(false);
      externalEvent = setState;
      return (
        <>
          {state && <TileLayer />}
          <VectorLayer />
          <ImageLayer />
        </>
      );
    }

    const map = await miniRender(<Component />);
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(true));
    expect(map.getLayers().getLength()).toBe(3);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olTileLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[2]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(false));
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
  });

  test('correctly attaches and removes a new layer in the end after a while', async () => {
    let externalEvent = () => {};
    function Component() {
      const [state, setState] = useState(false);
      externalEvent = setState;
      return (
        <>
          <VectorLayer />
          <ImageLayer />
          {state && <TileLayer />}
        </>
      );
    }
    const map = await miniRender(<Component />);
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(true));
    expect(map.getLayers().getLength()).toBe(3);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
    await act(async () => externalEvent(false));
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0]).toBeInstanceOf(olVectorLayer);
    expect(map.getLayers().getArray()[1]).toBeInstanceOf(olImageLayer);
  });

  test('correctly attaches layers when the last element is an interaction', async () => {
    let externalEvent;
    function Component() {
      const [state, setState] = useState(false);
      externalEvent = setState;
      return (
        <>
          <TileLayer properties={{name: 'first'}} />
          {state && <ImageLayer properties={{name: 'second'}} />}
          <DragPanInteraction />
        </>
      );
    }
    const map = await miniRender(<Component />);
    expect(map.getLayers().getLength()).toBe(1);
    expect(map.getLayers().getArray()[0].get('name')).toBe('first');
    await act(async () => externalEvent(true));
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0].get('name')).toBe('first');
    expect(map.getLayers().getArray()[1].get('name')).toBe('second');
    await act(async () => externalEvent(false));
    expect(map.getLayers().getLength()).toBe(1);
    expect(map.getLayers().getArray()[0].get('name')).toBe('first');
    await act(async () => externalEvent(true));
    expect(map.getLayers().getLength()).toBe(2);
    expect(map.getLayers().getArray()[0].get('name')).toBe('first');
    expect(map.getLayers().getArray()[1].get('name')).toBe('second');
  });
});
