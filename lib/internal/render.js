import OLMap from 'ol/Map.js';
import {unByKey} from 'ol/Observable.js';
import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import Control from 'ol/control/Control.js';
import Interaction from 'ol/interaction/Interaction.js';
import BaseLayer from 'ol/layer/Base.js';
import GroupLayer from 'ol/layer/Group.js';
import Layer from 'ol/layer/Layer.js';
import Source from 'ol/source/Source.js';
import Vector from 'ol/source/Vector.js';
import ReactReconciler from 'react-reconciler';
import {
  ConcurrentRoot,
  DefaultEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import {CONTROL, INTERACTION, LAYER, OVERLAY, SOURCE, VIEW} from './config.js';
import {arrayEquals, reservedProps} from './update.js';

const listenerRegex = /^on([A-Z].*)/;
const listenerColonRegex = /^onChange-/;

/**
 * @param {string} str A string.
 */
function upperFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * @param {string} str A string.
 */
function setterName(str) {
  return 'set' + upperFirst(str);
}

/**
 * @type {Object<string, boolean>}
 */
const knownTypes = {
  [VIEW]: true,
  [OVERLAY]: true,
  [CONTROL]: true,
  [INTERACTION]: true,
  [LAYER]: true,
  [SOURCE]: true,
};

const customViewChangeEventType = 'custom-change';

/**
 * @type {import('./update.js').Updater}
 */
export function updateInstanceFromProps(instance, type, oldProps, newProps) {
  for (const key in newProps) {
    if (reservedProps[key]) {
      continue;
    }
    const newValue = newProps[key];
    const oldValue = oldProps[key];
    if (oldValue === newValue) {
      continue;
    }

    if (listenerRegex.test(key)) {
      const listener = newProps[key];
      let eventType = key
        .replace(listenerColonRegex, 'onChange:')
        .replace(listenerRegex, '$1')
        .toLowerCase();

      // special handling for view change
      if (instance instanceof View && eventType === 'change') {
        eventType = customViewChangeEventType;
      }
      instance.on(eventType, listener);

      const oldListener = oldProps[key];
      if (oldListener) {
        instance.un(eventType, oldListener);
        if (instance.changed) {
          instance.changed();
        }
      }
      continue;
    }

    if (key === 'center' && arrayEquals(newValue, oldValue)) {
      continue;
    }

    const setter = setterName(key);
    if (typeof instance[setter] === 'function') {
      instance[setter](newValue);
      continue;
    }

    if (instance instanceof Vector) {
      if (key === 'features') {
        // TODO: there is likely a smarter way to diff features
        instance.clear(true);
        instance.addFeatures(newValue);
        continue;
      }
    }

    if (instance instanceof OLMap) {
      if (key === 'interactions') {
        const interactions = /** @type {Array<Interaction>} */ (newValue);
        instance.getInteractions().clear();
        interactions.forEach(interaction =>
          instance.addInteraction(interaction),
        );
        continue;
      }
      if (key === 'controls') {
        const controls = /** @type {Array<Control>} */ (newValue);
        instance.getControls().clear();
        controls.forEach(control => instance.addControl(control));
        continue;
      }
    }

    throw new Error(`Cannot update '${key}' property`);
  }
}

/**
 * @typedef {Object} InstanceProps
 * @property {new(options: any) => any} cls A class.
 * @property {any} [options] The options.
 */

/**
 * @param {string} type The string type.
 * @param {InstanceProps} The instance props.
 */
function createInstance(type, {cls: Constructor, ...props}) {
  if (!knownTypes[type]) {
    throw new Error(`Unsupported element type: ${type}`);
  }
  if (!Constructor) {
    throw new Error(`No constructor for type: ${type}`);
  }

  const instance = new Constructor(props.options || {});
  updateInstanceFromProps(instance, type, {}, props);
  return instance;
}

function createTextInstance() {
  throw new Error('Cannot add text to the map');
}

/**
 * @param {OLMap} map The map.
 * @param {any} child The child.
 */
function appendChildToContainer(map, child) {
  if (child instanceof View) {
    const key = map.on('moveend', () => {
      child.dispatchEvent(customViewChangeEventType);
    });
    map.setView(child);
    map.on('change:view', () => {
      unByKey(key);
    });
    return;
  }
  if (child instanceof Overlay) {
    map.addOverlay(child);
    return;
  }
  if (child instanceof Control) {
    map.addControl(child);
    return;
  }
  if (child instanceof Interaction) {
    map.addInteraction(child);
    return;
  }
  if (child instanceof BaseLayer) {
    map.addLayer(child);
    return;
  }
  throw new Error(`Cannot add child to the map: ${child}`);
}

/**
 * @param {any} parent The parent.
 * @param {any} child The child.
 */
function appendChild(parent, child) {
  if (child instanceof Source) {
    if (!(parent instanceof Layer)) {
      throw new Error(`Cannot add source to ${parent}`);
    }
    parent.setSource(child);
    return;
  }
  // Layer groups are an instance of a layer
  if (child instanceof BaseLayer && parent instanceof GroupLayer) {
    parent.getLayers().push(child);
    return;
  }
  throw new Error(`Cannot add ${child} to ${parent}`);
}

/**
 * @type {import('./update.js').Updater}
 */
function commitUpdate(instance, type, oldProps, newProps) {
  updateInstanceFromProps(instance, type, oldProps, newProps);
}

/**
 * @param {OLMap} map The map.
 * @param {any} child The object to remove from the map.
 */
function removeChildFromContainer(map, child) {
  if (child instanceof View) {
    // @ts-ignore (remove when https://github.com/openlayers/openlayers/pull/16691 is released)
    map.setView(null);
    return;
  }
  if (child instanceof Overlay) {
    map.removeOverlay(child);
    return;
  }
  if (child instanceof Control) {
    map.removeControl(child);
    return;
  }
  if (child instanceof Interaction) {
    map.removeInteraction(child);
    return;
  }
  if (child instanceof BaseLayer) {
    map.removeLayer(child);
    return;
  }
  throw new Error(`Cannot remove child from the map: ${child}`);
}

/**
 * @param {any} parent The parent object.
 * @param {any} child The child object.
 */
function removeChild(parent, child) {
  // this happens with group layers
  if (child instanceof BaseLayer && parent.getLayers) {
    parent.getLayers().remove(child);
    return;
  }
  throw new Error(`TODO: implement removeChild for ${parent} and ${child}`);
}

/**
 * @param {OLMap} map The map.
 */
function clearContainer(map) {
  map.getLayers().clear();
  // Need to leave the default controls and interactions.
  // TODO: determine when this gets called.
}

/**
 * @template {any} T
 * @param {import("ol/Collection.js").default<T>} collection A collection.
 * @param {T} child The child to insert.
 * @param {T} beforeChild The insertion point.
 */
function insertInCollection(collection, child, beforeChild) {
  const index = collection.getArray().indexOf(beforeChild);
  if (index < 0) {
    collection.push(child);
  } else {
    collection.insertAt(index, child);
  }
}

/**
 * @param {OLMap} map The map.
 * @param {any} child The child to insert.
 * @param {any} beforeChild The insertion point.
 */
function insertInContainerBefore(map, child, beforeChild) {
  if (child instanceof View) {
    const key = map.on('moveend', () => {
      child.dispatchEvent(customViewChangeEventType);
    });
    map.setView(child);
    map.on('change:view', () => {
      unByKey(key);
    });
    return;
  }
  let collection;
  if (child instanceof Overlay) {
    collection = map.getOverlays();
  } else if (child instanceof Control) {
    collection = map.getControls();
  } else if (child instanceof Interaction) {
    collection = map.getInteractions();
  } else if (child instanceof BaseLayer) {
    collection = map.getLayers();
  }
  if (collection) {
    insertInCollection(collection, child, beforeChild);
  }
}

/**
 * @param {any} parent The parent.
 * @param {any} child The child to insert.
 * @param {any} beforeChild The insertion point.
 */
function insertBefore(parent, child, beforeChild) {
  if (child instanceof BaseLayer && parent instanceof GroupLayer) {
    insertInCollection(parent.getLayers(), child, beforeChild);
    return;
  }
  throw new Error(`Cannot insert child ${child} into parent ${parent}`);
}

const noContext = {};
let currentUpdatePriority = NoEventPriority;

const reconciler = ReactReconciler({
  supportsMutation: true,
  supportsPersistence: false,
  preparePortalMount() {},
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  prepareScopeUpdate() {},
  getInstanceFromScope() {
    throw new Error('getInstanceFromScope not implemented');
  },
  supportsHydration: false,
  resetFormInstance() {},
  trackSchedulerEvent() {},
  resolveEventType() {
    return null;
  },
  resolveEventTimeStamp() {
    return -1.1;
  },
  NotPendingTransition: null,
  HostTransitionContext: {
    $$typeof: Symbol.for('react.context'),
    Provider: /** @type {any} */ (null),
    Consumer: /** @type {any} */ (null),
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0,
  },
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  isPrimaryRenderer: false,
  createInstance,
  createTextInstance,
  appendChildToContainer,
  appendChild,
  appendInitialChild: appendChild,
  commitUpdate,
  clearContainer,
  removeChildFromContainer,
  removeChild,
  insertInContainerBefore,
  insertBefore,
  noTimeout: -1,

  getInstanceFromNode() {
    return null;
  },

  //@ts-ignore
  shouldAttemptEagerTransition() {
    return false;
  },

  requestPostPaintCallback() {},

  maySuspendCommit() {
    return false;
  },

  preloadInstance() {
    return true;
  },

  startSuspendingCommit() {},

  suspendInstance() {},

  waitForCommitToBeReady() {
    return null;
  },

  /**
   * @param {number} newPriority The new priority.
   */
  setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
  },

  getCurrentUpdatePriority() {
    return currentUpdatePriority;
  },

  resolveUpdatePriority() {
    if (currentUpdatePriority) {
      return currentUpdatePriority;
    }
    return DefaultEventPriority;
  },

  finalizeInitialChildren() {
    return false;
  },

  getChildHostContext() {
    return noContext;
  },

  getPublicInstance(instance) {
    return instance;
  },

  getRootHostContext() {
    return noContext;
  },

  prepareForCommit() {
    return null;
  },

  resetAfterCommit() {},

  shouldSetTextContent() {
    return false;
  },

  detachDeletedInstance() {},
});

/**
 * @type {Map<any, ReactReconciler.OpaqueRoot>}
 */
const roots = new Map();

const logError =
  typeof reportError === 'function' ? reportError : console.error; // eslint-disable-line no-console

/**
 * @param {React.ReactNode} element The element to render.
 * @param {any} containerInfo The container.
 */
export function render(element, containerInfo) {
  let root = roots.get(containerInfo);
  if (!root) {
    // naming arguments as they are in rect-reconciler
    const tag = ConcurrentRoot;
    const hydrationCallbacks = null;
    const isStrictMode = false;
    const concurrentUpdatesByDefaultOverride = false;
    const identifierPrefix = '';
    const onUncaughtError = logError;
    const onCaughtError = logError;
    const onRecoverableError = logError;
    const onDefaultTransitionIndicator = function () {};

    // present in react-reconciler@0.33.0 but missing from @types/react-reconciler@0.33.0
    // const transitionCallbacks = null;

    root = reconciler.createContainer(
      containerInfo,
      tag,
      hydrationCallbacks,
      isStrictMode,
      concurrentUpdatesByDefaultOverride,
      identifierPrefix,
      onUncaughtError,
      onCaughtError,
      onRecoverableError,
      onDefaultTransitionIndicator,
      // transitionCallbacks
    );
    roots.set(containerInfo, root);
  }

  reconciler.updateContainer(element, root, null, null);
}
