import Overlay from 'ol/Overlay.js';
import View from 'ol/View.js';
import Control from 'ol/control/Control.js';
import Interaction from 'ol/interaction/Interaction.js';
import BaseLayer from 'ol/layer/Base.js';
import GroupLayer from 'ol/layer/Group.js';
import Source from 'ol/source/Source.js';
import ReactReconciler from 'react-reconciler';
import {
  ConcurrentRoot,
  DefaultEventPriority,
  NoEventPriority,
} from 'react-reconciler/constants.js';
import {CONTROL, INTERACTION, LAYER, OVERLAY, SOURCE, VIEW} from './config.js';
import {
  prepareControlUpdate,
  prepareInteractionUpdate,
  prepareLayerUpdate,
  prepareOverlayUpdate,
  prepareSourceUpdate,
  prepareViewUpdate,
  reservedProps,
} from './update.js';

const listenerRegex = /^on([A-Z].*)/;
const listenerColonRegex = /^onChange-/;

function upperFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function setterName(str) {
  return 'set' + upperFirst(str);
}

const knownTypes = {
  [VIEW]: true,
  [OVERLAY]: true,
  [CONTROL]: true,
  [INTERACTION]: true,
  [LAYER]: true,
  [SOURCE]: true,
};

/**
 * @param {Array} a1 An array.
 * @param {Array} a2 An array.
 * @return {boolean} All elements in the array are the same;
 */
function arrayEquals(a1, a2) {
  if (!a1 || !a2) {
    return false;
  }
  const len1 = a1.length;
  const len2 = a2.length;
  if (len1 !== len2) {
    return false;
  }
  for (let i = 0; i < len1; i += 1) {
    const v1 = a1[i];
    const v2 = a2[i];
    if (v1 !== v2) {
      return false;
    }
  }
  return true;
}

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
      const eventType = key
        .replace(listenerColonRegex, 'onChange:')
        .replace(listenerRegex, '$1')
        .toLowerCase();
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

    if (key === 'features' && typeof instance.addFeatures === 'function') {
      // TODO: there is likely a smarter way to diff features
      instance.clear(true);
      instance.addFeatures(newValue);
      continue;
    }

    if (
      key === 'interactions' &&
      typeof instance.addInteraction === 'function'
    ) {
      instance.getInteractions().clear();
      newValue.forEach(interaction => instance.addInteraction(interaction));
      continue;
    }
    if (key === 'controls' && typeof instance.addControl === 'function') {
      instance.getControls().clear();
      newValue.forEach(control => instance.addControl(control));
      continue;
    }

    throw new Error(`Cannot update '${key}' property`);
  }
}

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

function appendChildToContainer(map, child) {
  if (child instanceof View) {
    map.setView(child);
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

function appendChild(parent, child) {
  if (child instanceof Source) {
    if (!(parent instanceof BaseLayer)) {
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

const updaters = {
  [VIEW]: prepareViewUpdate,
  [OVERLAY]: prepareOverlayUpdate,
  [CONTROL]: prepareControlUpdate,
  [INTERACTION]: prepareInteractionUpdate,
  [LAYER]: prepareLayerUpdate,
  [SOURCE]: prepareSourceUpdate,
};

function prepareUpdate(instance, type, oldProps, newProps) {
  const updater = updaters[type];
  if (!updater) {
    throw new Error(`Unsupported element type: ${type}`);
  }
  return updater(instance, type, oldProps, newProps);
}

function commitUpdate(instance, type, oldProps, newProps) {
  updateInstanceFromProps(instance, type, oldProps, newProps);
}

function removeChildFromContainer(map, child) {
  if (child instanceof View) {
    map.setView(child);
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

function removeChild(parent, child) {
  // this happens with group layers
  if (child instanceof BaseLayer && parent.getLayers) {
    parent.getLayers().remove(child);
    return;
  }
  throw new Error(`TODO: implement removeChild for ${parent} and ${child}`);
}

function clearContainer(map) {
  map.getLayers().clear();
  // Need to leave the default controls and interactions.
  // TODO: determine when this gets called.
}

function insertInCollection(collection, child, beforeChild) {
  const index = collection.getArray().indexOf(beforeChild);
  if (index < 0) {
    collection.push(child);
  } else {
    collection.insertAt(index, child);
  }
}

function insertInContainerBefore(map, child, beforeChild) {
  if (child instanceof View) {
    map.setView(child);
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
  isPrimaryRenderer: false,
  createInstance,
  createTextInstance,
  appendChildToContainer,
  appendChild,
  appendInitialChild: appendChild,
  prepareUpdate,
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

  getCurrentEventPriority() {
    return DefaultEventPriority;
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

const roots = new Map();

export function render(element, container) {
  let root = roots.get(container);
  if (!root) {
    const logRecoverableError =
      typeof reportError === 'function' ? reportError : console.error; // eslint-disable-line no-console

    root = reconciler.createContainer(
      container,
      ConcurrentRoot,
      null,
      false,
      null,
      '',
      logRecoverableError,
      null,
    );
    roots.set(container, root);
  }

  reconciler.updateContainer(element, root, null, null);
}
