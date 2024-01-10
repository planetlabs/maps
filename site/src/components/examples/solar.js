/**
 * Includes functions derived from https://github.com/Viglino/ol-ext
 * Copyright (c) 2018 Jean-Marc VIGLINO,
 * released under the CeCILL-B license (French BSD license)
 * (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
 */
import Polygon from 'ol/geom/Polygon.js';

/**
 * Compute the position of the Sun in ecliptic coordinates at julianDay.
 * @see http://en.wikipedia.org/wiki/Position_of_the_Sun
 * @param {number} julianDay
 */
function sunEclipticPosition(julianDay) {
  const deg2rad = Math.PI / 180;
  // Days since start of J2000.0
  const n = julianDay - 2451545.0;
  // mean longitude of the Sun
  const L = (280.46 + 0.9856474 * n) % 360;
  // mean anomaly of the Sun
  const g = (357.528 + 0.9856003 * n) % 360;
  // ecliptic longitude of Sun
  const lambda =
    L + 1.915 * Math.sin(g * deg2rad) + 0.02 * Math.sin(2 * g * deg2rad);
  // distance from Sun in AU
  const R =
    1.00014 -
    0.01671 * Math.cos(g * deg2rad) -
    0.0014 * Math.cos(2 * g * deg2rad);
  return {lambda, R};
}

/**
 * @see http://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
 * @param {number} julianDay
 */
function eclipticObliquity(julianDay) {
  const n = julianDay - 2451545.0;
  // Julian centuries since J2000.0
  const T = n / 36525;
  const epsilon =
    23.43929111 -
    T *
      (46.836769 / 3600 -
        T *
          (0.0001831 / 3600 +
            T *
              (0.0020034 / 3600 -
                T * (0.576e-6 / 3600 - (T * 4.34e-8) / 3600))));
  return epsilon;
}

/**
 * Compute the Sun's equatorial position from its ecliptic position.
 * @param {number} sunEclLon Sun longitude in degrees.
 * @param {number} eclObliq Ecliptic position in degrees.
 * @return {number} Position in degrees.
 */
function sunEquatorialPosition(sunEclLon, eclObliq) {
  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  let alpha =
    Math.atan(Math.cos(eclObliq * deg2rad) * Math.tan(sunEclLon * deg2rad)) *
    rad2deg;
  const delta =
    Math.asin(Math.sin(eclObliq * deg2rad) * Math.sin(sunEclLon * deg2rad)) *
    rad2deg;

  const lQuadrant = Math.floor(sunEclLon / 90) * 90;
  const raQuadrant = Math.floor(alpha / 90) * 90;
  alpha = alpha + (lQuadrant - raQuadrant);

  return {alpha, delta};
}

/**
 * Get night-day terminator coordinates.
 * @param {string} time DateTime string (default now).
 * @param {string} projection The projection identifier.
 * @return {Polygon} A polygon representing the night.
 */
export function getNightGeometry(time, projection) {
  const step = 1;
  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  const date = time ? new Date(time) : new Date();

  // Calculate the present UTC Julian Date.
  // Function is valid after the beginning of the UNIX epoch 1970-01-01 and ignores leap seconds.
  const julianDay = date / 86400000 + 2440587.5;

  // Calculate Greenwich Mean Sidereal Time (low precision equation).
  // http://aa.usno.navy.mil/faq/docs/GAST.php
  const gst = (18.697374558 + 24.06570982441908 * (julianDay - 2451545.0)) % 24;
  const coordinates = [];

  const sunEclPos = sunEclipticPosition(julianDay);
  const eclObliq = eclipticObliquity(julianDay);
  const sunEqPos = sunEquatorialPosition(sunEclPos.lambda, eclObliq);

  for (let i = -180; i <= 180; i += step) {
    const lon = i;
    // Hour angle (indegrees) of the sun for a longitude on Earth.
    const ha = gst * 15 + lon - sunEqPos.alpha;
    // Latitude
    const lat =
      Math.atan(-Math.cos(ha * deg2rad) / Math.tan(sunEqPos.delta * deg2rad)) *
      rad2deg;
    coordinates.push([lon, lat]);
  }

  const lat = sunEqPos.delta < 0 ? 90 : -90;
  for (let tlon = 180; tlon >= -180; tlon -= step) {
    coordinates.push([tlon, lat]);
  }
  coordinates.push(coordinates[0]);

  const polygon = new Polygon([coordinates]);
  polygon.transform('EPSG:4326', projection);
  return polygon;
}
