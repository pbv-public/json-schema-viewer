// Returns a string of the keys whose values are truthy. Useful for css classes.
/**
 * Returns a CSS classes string.
 * @param {string|Array<string>|Map<string,boolean>} classesOrMap can either be
 *   the map argument, or can be the default (always included) CSS classes
 *   specified as either a string (e.g., "some-cls another-one") or an array of
 *   strings (e.g., ['some-cls', 'another-one']).
 * @param {Map<string,boolean>} [map] a map of string CSS class names to truthy
 *   values indicating whether the CSS class should be used or not
 * @returns {string} the CSS string of class name(s)
 */
export function clsMap(classesOrMap, map = {}) {
  const hasDefaultClasses = typeof classesOrMap !== "object"
  let defaultClasses = []
  if (hasDefaultClasses) {
    defaultClasses =
      typeof classesOrMap === "string" ? [classesOrMap] : classesOrMap
  } else {
    map = classesOrMap
  }
  // compute which classes are enabled
  const enabledClasses = Object.entries(map)
    .map(([k, v]) => (v ? k : null))
    .filter((x) => x)
  return defaultClasses.concat(enabledClasses).join(" ")
}
