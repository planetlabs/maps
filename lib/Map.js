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
import {Component, createElement, createRef, forwardRef} from 'react';
import {render, updateInstanceFromProps} from './internal/render.js';

const defaultDivStyle = {
  height: '100%',
  width: '100%',
};

class Map extends Component {
  constructor(props) {
    super(props);

    this.targetRef = createRef();

    const {id, style, className, innerRef, options, ...mapProps} = props;
    this.map = new OLMap({...options});
    if (innerRef) {
      if (typeof innerRef === 'function') {
        innerRef(this.map);
      } else {
        innerRef.current = this.map;
      }
    }
    updateInstanceFromProps(this.map, mapProps);
  }

  componentDidMount() {
    this.map.setTarget(this.targetRef.current);
    render(this.props.children, this.map);
  }

  componentDidUpdate() {
    // TODO: apply map prop changes
    render(this.props.children, this.map);
  }

  render() {
    const {id, style = defaultDivStyle, className} = this.props;
    return createElement('div', {ref: this.targetRef, id, style, className});
  }
}

Map.propTypes = {
  className: propTypes.string,
  id: propTypes.string,
  style: propTypes.object,
  children: propTypes.node,
  innerRef: propTypes.oneOfType([
    propTypes.func,
    propTypes.shape({current: propTypes.any}),
  ]),
};

export default forwardRef((props, ref) =>
  createElement(Map, {innerRef: ref, ...props}),
);
