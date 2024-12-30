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
import propTypes from 'prop-types';
import {MAP} from './internal/config.js';
import {createElement, useCallback, useEffect, useRef} from 'react';
import {render, updateInstanceFromProps} from './internal/render.js';

const defaultDivStyle = {
  height: '100%',
  width: '100%',
};

export default function Map({
  id,
  style = defaultDivStyle,
  className,
  children,
  ref,
  options,
  ...mapProps
}) {
  const targetRef = useRef();
  const mapRef = useRef();

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
    map.setTarget(targetRef.current);
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
    updateInstanceFromProps(map, MAP, {}, mapProps);
    render(children, map);
  }, [children, getMap, mapProps, ref]);

  return createElement('div', {ref: targetRef, id, style, className});
}

Map.propTypes = {
  className: propTypes.string,
  id: propTypes.string,
  style: propTypes.object,
  children: propTypes.node,
  options: propTypes.object,
  ref: propTypes.oneOfType([
    propTypes.func,
    propTypes.shape({current: propTypes.any}),
  ]),
};
