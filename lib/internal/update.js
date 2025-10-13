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
