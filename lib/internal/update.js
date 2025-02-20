function arrayEquals(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export const reservedProps = {
  children: true,
  cls: true,
  options: true,
  ref: true, // TODO: deal with changing ref
};

export function prepareViewUpdate(view, type, oldProps, newProps) {
  if (view.getAnimating()) {
    return null;
  }
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

function prepareGenericUpdate(instance, type, oldProps, newProps) {
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
