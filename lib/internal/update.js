/**
 * @typedef {function(any, string, Object<string, any>, Object<string, any>): any} Updater
 */

/**
 * @param {Array<any>} [a1] An array.
 * @param {Array<any>} [a2] An array.
 * @return {boolean} All elements in the array are the same;
 */
export function arrayEquals(a1, a2) {
  if (!a1 || !a2) {
    return false;
  }
  const len = a1.length;
  if (len !== a2.length) {
    return false;
  }
  for (let i = 0; i < len; i += 1) {
    const v1 = a1[i];
    const v2 = a2[i];
    if (v1 !== v2) {
      return false;
    }
  }
  return true;
}

/**
 * @type {Object<string, boolean>}
 */
export const reservedProps = {
  children: true,
  cls: true,
  options: true,
  ref: true, // TODO: deal with changing ref
};

/**
 * @param {import("ol/View.js").default} view The view.
 * @param {string} type The string type.
 * @param {Object<string, any>} oldProps The old props.
 * @param {Object<string, any>} newProps The new props.
 */
export function prepareViewUpdate(view, type, oldProps, newProps) {
  if (view.getAnimating()) {
    return null;
  }
  /**
   * @type {Object<string, any>}
   */
  const payload = {};
  let needsUpdate = false;
  for (const key in newProps) {
    if (reservedProps[key]) {
      continue;
    }
    if (key === 'center') {
      if (
        !(
          arrayEquals(oldProps.center, newProps.center) ||
          arrayEquals(view.getCenter(), newProps.center)
        )
      ) {
        payload.center = newProps.center;
        needsUpdate = true;
      }
      continue;
    }
    if (key === 'zoom') {
      if (
        !(oldProps.zoom === newProps.zoom || view.getZoom() === newProps.zoom)
      ) {
        payload.zoom = newProps.zoom;
        needsUpdate = true;
      }
      continue;
    }
    if (key === 'rotation') {
      if (
        !(
          oldProps.rotation === newProps.rotation ||
          view.getRotation() === newProps.rotation
        )
      ) {
        payload.rotation = newProps.rotation;
        needsUpdate = true;
      }
      continue;
    }
    if (newProps[key] !== oldProps[key]) {
      payload[key] = newProps[key];
      needsUpdate = true;
    }
  }
  if (!needsUpdate) {
    return null;
  }
  return payload;
}

/**
 * @type {Updater}
 */
function prepareGenericUpdate(instance, type, oldProps, newProps) {
  /**
   * @type {Object<string, any>}
   */
  const payload = {};
  let needsUpdate = false;
  for (const key in newProps) {
    if (reservedProps[key]) {
      continue;
    }

    if (newProps[key] !== oldProps[key]) {
      payload[key] = newProps[key];
      needsUpdate = true;
    }
  }
  if (!needsUpdate) {
    return null;
  }
  return payload;
}

export {
  prepareGenericUpdate as prepareControlUpdate,
  prepareGenericUpdate as prepareInteractionUpdate,
  prepareGenericUpdate as prepareLayerUpdate,
  prepareGenericUpdate as prepareOverlayUpdate,
  prepareGenericUpdate as prepareSourceUpdate,
};
