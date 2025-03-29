/**
 * Copyright Planet Labs PBC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import OLMap from 'ol/Map.js';
import {createElement, useCallback, useEffect, useRef} from 'react';
import {MAP} from './internal/config.js';
import {render, updateInstanceFromProps} from './internal/render.js';

const defaultDivStyle = {
  height: '100%',
  width: '100%',
};

/**
 * @typedef {Object} MapProps
 * @property {ConstructorParameters<typeof OLMap>[0]} [options] Map constructor options.
 * @property {React.ReactNode} children The map children.
 * @property {React.Ref<OLMap> | (function(OLMap):void)} [ref] The map ref.
 * @property {string} [id] The element id.
 * @property {React.CSSProperties} [style] The element style.
 * @property {string} [className] The element class name.
 */

/**
 * @param {MapProps | Object<string, any>} props Map props.
 */
export default function Map({
  id,
  style = defaultDivStyle,
  className,
  children,
  ref,
  options,
  ...mapProps
}) {
  const targetRef = useRef(/** @type {HTMLElement?} */ (null));
  const mapRef = useRef(/** @type {OLMap?} */ (null));
  const oldMapPropsRef = useRef({});

  const getMap = useCallback(() => {
    // avoid creating new map when options object is different
    if (mapRef.current) {
      return mapRef.current;
    }

    const map = new OLMap(options);
    mapRef.current = map;
    return map;
  }, [options]);

  useEffect(() => {
    const map = getMap();
    map.setTarget(targetRef.current ?? undefined);
  }, [getMap]);

  useEffect(() => {
    const map = getMap();
    if (ref) {
      if (typeof ref === 'function') {
        ref(map);
      } else {
        ref.current = map;
      }
    }
    if (!mapRef.current) {
      return;
    }
    const oldMapProps = oldMapPropsRef.current;
    oldMapPropsRef.current = mapProps;
    updateInstanceFromProps(map, MAP, oldMapProps, mapProps);
    render(children, map);
  }, [children, getMap, mapProps, ref]);

  return createElement('div', {ref: targetRef, id, style, className});
}
