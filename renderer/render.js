import BaseLayer from 'ol/layer/Base.js';
import Control from 'ol/control/Control.js';
import GroupLayer from 'ol/layer/Group.js';
import Interaction from 'ol/interaction/Interaction.js';
import Overlay from 'ol/Overlay.js';
import ReactReconciler from 'react-reconciler';
import Source from 'ol/source/Source.js';
import View from 'ol/View.js';
import {CONTROL, INTERACTION, LAYER, OVERLAY, SOURCE, VIEW} from '../config.js';
import {
  ConcurrentRoot,
  DefaultEventPriority,
} from 'react-reconciler/constants.js';
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

export function updateInstanceFromProps(instance, props, oldProps = {}) {
  for (const key in props) {
    if (reservedProps[key]) {
      continue;
    }
    if (listenerRegex.test(key)) {
      const listener = props[key];
      const type = key.replace(listenerRegex, '$1').toLowerCase();
      instance.on(type, listener);
      if (oldProps[key]) {
        instance.un(type, oldProps[key]);
      }
      continue;
    }

    const setter = setterName(key);
    if (typeof instance[setter] === 'function') {
      instance[setter](props[key]);
      continue;
    }

    if (key === 'features' && typeof instance.addFeatures === 'function') {
      // TODO: there is likely a smarter way to diff features
      instance.clear(true);
      instance.addFeatures(props[key]);
      continue;
    }

    if (
      key === 'interactions' &&
      typeof instance.addInteraction === 'function'
    ) {
      instance.getInteractions().clear();
      props[key].forEach(interaction => instance.addInteraction(interaction));
      continue;
    }
    if (key === 'controls' && typeof instance.addControl === 'function') {
      instance.getControls().clear();
      props[key].forEach(control => instance.addControl(control));
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
  updateInstanceFromProps(instance, props);
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

function commitUpdate(instance, updatePayload, type, oldProps) {
  updateInstanceFromProps(instance, updatePayload, oldProps);
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
    collection = map.getInetracations();
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

  removeChild() {
    throw new Error('TODO: implement removeChild');
  },

  insertInContainerBefore,
  insertBefore,

  finalizeInitialChildren() {
    return false;
  },

  getChildHostContext() {},

  getPublicInstance(instance) {
    return instance;
  },

  getRootHostContext() {},

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
      typeof reportError === 'function'
        ? reportError // eslint-disable-line no-undef
        : console.error; // eslint-disable-line no-console

    root = reconciler.createContainer(
      container,
      ConcurrentRoot,
      null,
      false,
      null,
      '',
      logRecoverableError,
      null
    );
    roots.set(container, root);
  }

  reconciler.updateContainer(element, root, null, null);
}
