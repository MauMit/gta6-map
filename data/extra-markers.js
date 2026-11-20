/* Markers added by hand on top of the generated map data (markers.js).
 * Loaded after markers.js and taxonomy.js, before app.js.
 *
 * To add one: copy an entry, give it a unique id (keep the "extra:" prefix),
 * set t to the marker type's slug (see data/taxonomy.js) and place lat/lng
 * using a nearby existing marker as reference.
 */
(function () {
  'use strict';
  var MARKERS = window.GTA6_MARKERS, TAX = window.GTA6_TAXONOMY;
  if (!MARKERS || !TAX) return;

  var MAGAZINE = { t: '29120', i: 'm.magazine.4e2d3dbf' };

  // Jason's waterfront house, northern Key Lento. Reference points from the map
  // data: Hoop 96 (side of the house) 0.43162,-0.64074; Off the Hook 1 (shed
  // below the house) 0.43181,-0.64082; Body Copy 1 (upper back patio) 0.43197,-0.64107.
  // The house is only ~30 px wide at max zoom, so these sit just around it,
  // spaced so every icon stays clickable.
  var EXTRA = [
    { id: 'extra:magazine:ashes-of-glory', n: 'Ashes of Glory', lat: 0.432014, lng: -0.640554, kind: MAGAZINE,
      d: "**Location:** In the bedroom of Jason's waterfront house in northern Key Lento, beside the bed." },
    { id: 'extra:magazine:lethal-by-design', n: 'Lethal By Design', lat: 0.431671, lng: -0.641091, kind: MAGAZINE,
      d: "**Location:** On the living-room table inside Jason's waterfront house in northern Key Lento." },
    { id: 'extra:magazine:orca', n: 'Orca: A Whole Different Animal', lat: 0.431735, lng: -0.640469, kind: MAGAZINE,
      d: "**Location:** In the living room of Jason's waterfront house in northern Key Lento, beside the east window." }
  ];

  var seen = Object.create(null);
  MARKERS.forEach(function (m) { seen[m.id] = 1; });
  var typeBySlug = Object.create(null), groupBySlug = Object.create(null);
  TAX.groups.forEach(function (g) { g.types.forEach(function (t) { typeBySlug[t.slug] = t; groupBySlug[t.slug] = g; }); });

  EXTRA.forEach(function (e) {
    if (seen[e.id] || !typeBySlug[e.kind.t]) return;
    MARKERS.push({ id: e.id, n: e.n, lat: e.lat, lng: e.lng, t: e.kind.t, i: e.kind.i,
      d: e.d + '\n\n_Added to this map by hand; not in the original map data._', p: [] });
    typeBySlug[e.kind.t].count = (typeBySlug[e.kind.t].count || 0) + 1;
    groupBySlug[e.kind.t].count = (groupBySlug[e.kind.t].count || 0) + 1;
  });
})();
