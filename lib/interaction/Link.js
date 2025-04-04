// This file is generated by tools/generate.js. DO NOT EDIT.
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
import OLLink from 'ol/interaction/Link.js';
import {createElement} from 'react';

/**
 * @typedef {Object} LinkProps
 * @property {ConstructorParameters<typeof OLLink>[0]} [options] The interaction options.
 */

/**
 * @param {LinkProps | Object<string, any>} props The interaction props.
 */
export default function Link(props) {
  return createElement('interaction', {cls: OLLink, ...props});
}
