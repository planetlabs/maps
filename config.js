/**
 * The constants below represent the primitive element types handled by the renderer.
 */
export const VIEW = 'view';
export const OVERLAY = 'overlay';
export const CONTROL = 'control';
export const INTERACTION = 'interaction';
export const LAYER = 'layer';
export const SOURCE = 'source';

/**
 * A lookup of source directory names.  Modules in the OpenLayers source directories
 * will result in generated components in the lib directory of this project.
 */
export const directories = {
  [CONTROL]: 'control',
  [INTERACTION]: 'interaction',
  [LAYER]: 'layer',
  [SOURCE]: 'source',
};

// Modules in this list will be ignored when generating components.
export const ignore = [
  'layer/Property.js',
  'layer/TileProperty.js',
  'layer/VectorTileRenderType.js',
  'source/State.js',
  'source/TileEventType.js',
  'source/VectorEventType.js',
  'source/WMSServerType.js',
  'source/WMTSRequestEncoding.js',
];
