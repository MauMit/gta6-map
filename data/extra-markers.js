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

  // New marker types, added to an existing group. Icons reuse the map's atlas.
  // Other Cards: the 15 sports/comic card sets the map data does not cover.
  var NEW_TYPES = [
    { slug: 'extra-cards', name: 'Other Cards', group: 'Collectible Cards', icon: 'm.collectible_cards.338c9a8c' }
  ];
  var OTHER_CARD = { t: 'extra-cards', i: 'm.collectible_cards.338c9a8c' };

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
      d: "**Location:** In the living room of Jason's waterfront house in northern Key Lento, beside the east window." },

    // Badger R&D Tower, central Key Lento (map data: 0.40997,-0.65372; the
    // Thelma dancer card sits at the top of the tower, just north-east of it).
    { id: 'extra:card:jude-flores', n: 'Jude Flores (Vice City Flamingos)', lat: 0.40975, lng: -0.65395, kind: OTHER_CARD,
      d: "**Location:** By the Badger R&D Tower in central Key Lento.\n\n**Set:** Vice City Flamingos." }
  ];

  var seen = Object.create(null);
  MARKERS.forEach(function (m) { seen[m.id] = 1; });
  var typeBySlug = Object.create(null), groupBySlug = Object.create(null);
  TAX.groups.forEach(function (g) { g.types.forEach(function (t) { typeBySlug[t.slug] = t; groupBySlug[t.slug] = g; }); });
  NEW_TYPES.forEach(function (nt) {
    if (typeBySlug[nt.slug]) return;
    var g = TAX.groups.filter(function (x) { return x.name === nt.group; })[0];
    if (!g) return;
    var t = { slug: nt.slug, name: nt.name, count: 0, icon: nt.icon };
    g.types.push(t);
    typeBySlug[t.slug] = t; groupBySlug[t.slug] = g;
  });

  EXTRA.forEach(function (e) {
    if (seen[e.id] || !typeBySlug[e.kind.t]) return;
    MARKERS.push({ id: e.id, n: e.n, lat: e.lat, lng: e.lng, t: e.kind.t, i: e.kind.i,
      d: e.d + '\n\n(Added to this map by hand; not in the original map data.)', p: [] });
    typeBySlug[e.kind.t].count = (typeBySlug[e.kind.t].count || 0) + 1;
    groupBySlug[e.kind.t].count = (groupBySlug[e.kind.t].count || 0) + 1;
  });
})();
