/* GTA 6 — "A Long Road" 100% completion checklist.
 *
 * Every requirement is a counter saved in the map's progress document
 * (state.hundred), so it syncs to the signed-in Google account like
 * everything else. Items whose markers exist on the map count themselves
 * from the markers you mark as found.
 *
 * Requirements: community guides from launch week (Nov 2026), cross-checked
 * between PowerPyx/GamerFuzion, Push Square and GTABase. Check the in-game
 * Stats > 100% Completion page if a number looks off.
 */
(function () {
  'use strict';
  var app = window.__gta6;
  var TAX = window.GTA6_TAXONOMY;
  var MARKERS = window.GTA6_MARKERS;
  if (!app || !TAX || !MARKERS) return;

  /* ------------------------------------------------------------------ data */
  // kind: 'count' (default) | 'money' | 'bool'
  // map: marker type names on this map. auto: count = found markers of those types.
  // list: id of a named tracker (animals / vehicles)
  var GROUPS = [
    {
      id: 'story', name: 'Story & Tasks', weight: '77% of the in-game total',
      items: [
        { id: 'story', name: 'Story completed', kind: 'bool', req: 1, note: "Finish Jason & Lucia's story (prologue + all chapters)" },
        { id: 'optional_tasks', name: 'Optional tasks completed', req: 100, note: 'Side tasks and optional mission beats; well over 100 exist' },
        { id: 'gang_ops', q: 'Illegal Operations', name: 'Gang operations cleared', req: 39, total: 39, map: ['Kingfishers', 'Kolt & Associates', 'M7', 'La Polilla Negra', 'Final Chapter', 'San4San', 'PTT Youngin$', 'The Guardia Brothers', 'Criminals'] },
        { id: 'bank_jobs', q: 'Bank', name: 'Bank jobs fully completed', req: 22, total: 22, map: ['Bank', 'Big Bank'] },
        { id: 'payday', name: 'Payday loan jobs fully completed', req: 7, total: 7, map: ['Payday Loans'] },
        { id: 'vaults', name: 'Vaults hit', req: 8, total: 8, map: ['Big Bank'], note: 'One guide says 5; most say 8' },
        { id: 'smash', q: 'Jewelry', name: "Smash 'N' Grabs fully completed", req: 34, total: 35, map: ['Low-End Jewelry Store', 'High-End Jewelry Store', 'Pawn Shop'] },
        { id: 'stickups', name: 'Stick ups fully completed', req: 50, total: 91, map: ['Convenience Store', 'Fast Food', 'Liquor Store'] },
        { id: 'fence_narcotics', name: 'Narcotics fenced', kind: 'money', req: 100000 },
        { id: 'fence_jewelry', name: 'Jewelry fenced', kind: 'money', req: 100000 },
        { id: 'fence_bills', name: 'Marked bills fenced', kind: 'money', req: 250000 },
        { id: 'fence_vehicles', name: 'Vehicles fenced', kind: 'money', req: 200000 }
      ]
    },
    {
      id: 'explore', name: 'Exploration & Activities', weight: '20% of the in-game total',
      items: [
        { id: 'stunts', name: 'Stunts completed', req: 300, total: 397, auto: true, q: 'Stunts', map: ['Stunt Jump', 'Base Jump', 'Knife Flight', 'Under the Bridge'], note: '130 stunt jumps, 202 under the bridges, 40 knife flights, 25 base jumps. Some guides say 250' },
        { id: 'challenges', name: 'Challenges completed', req: 70, total: 80, note: '8 categories of 10, under Progress > Challenges' },
        { id: 'hoops', name: 'Basketball hoops', req: 90, total: 100, auto: true, map: ['Basketball Hoop'] },
        { id: 'drones', name: 'Drone time trials completed', req: 42, total: 42, auto: true, map: ['Top Fun Drones'] },
        { id: 'shooting', name: 'Shooting range gold medals', req: 42, total: 42, map: ['Shooting Range'] },
        { id: 'unique_races', q: 'Racing', name: 'Unique races won', req: 30, total: 40, map: ['Thrillbilly Mud Club', 'Animal Crackers', "Hit 'n' Run VC", 'Hamlet Boone Speedway', 'Ambrosia Raceway', 'Gellhorn Raceway'] },
        { id: 'race_golds', name: 'Race challenge gold medals', req: 10, total: 13, map: ['Racing Challenge'] },
        { id: 'wainK', q: 'WAiNK', name: 'WAiNK locations scanned', req: 100, map: ['Landmark', 'Curiosity', 'Sculpture'] },
        { id: 'cards', q: 'Collectible Cards', name: 'Collectible card sets completed', req: 15, total: 18, derive: 'cardSets', map: ['Jack of Hearts', 'Delights', 'Nine1Nine'], note: '480 cards in 18 sets. Track each set in the card collection below' },
        { id: 'kenton', name: 'Kenton sets completed', req: 5, total: 7 },
        { id: 'underwater', name: 'Underwater discoveries found', req: 33, total: 33 },
        { id: 'reading', name: 'Magazines, books & comics found', req: 30, total: 34, map: ['Magazine', 'Book Swap'] },
        { id: 'meditation', name: 'Meditation spots completed', req: 15, total: 18, note: 'The trophy needs all 18' },
        { id: 'flamingos', name: 'Cocaine flamingos destroyed', req: 100, total: 125 },
        { id: 'playlists', name: 'Unique playlists completed', req: 2, total: 2, map: ['Unique Playlist'] },
        { id: 'styles', name: 'Discovered styles', req: 70, total: 79 },
        { id: 'video_games', name: 'Video games played', req: 4, total: 4, map: ['Arcade Machine'] },
        { id: 'pool', name: 'Pool opponents defeated', req: 5, total: 7, map: ['Pool Table'] },
        { id: 'minigolf', name: 'Mini golf locations played', req: 2, total: 3, auto: true, map: ['Mini-Golf Course'] },
        { id: 'target_decks', name: "Bret's target decks", req: 15, total: 15 }
      ]
    },
    {
      id: 'discovery', name: 'Discovery', weight: '3% of the in-game total',
      items: [
        { id: 'vehicles', name: 'Base model vehicles discovered', req: 200, total: 277, list: 'vehicles', note: 'Scan or drive them. Standout vehicles do not count' },
        { id: 'animals', name: 'Animals studied', req: 100, total: 255, list: 'animals', note: 'Every dog and cat breed, bird and fish counts separately' },
        { id: 'weapons', name: 'Standard issue weapons found', req: 50, total: 66, map: ['Ammu-Nation'], note: '53 guns, 9 melee, 4 explosives' }
      ]
    }
  ];

  // Named trackers. Launch-week lists are partial: names come from GTABase's
  // confirmed lists, and anyone can add more as they find them.
  var LISTS = {
    animals: {
      title: 'Animal tracker',
      hint: 'Partial list (launch week). Tick what you have studied; add any missing ones below.',
      groups: [
        ['Land', ['Armadillo', 'Beaver', 'Black Bear', 'Boar', 'Bobcat', 'Cane Toad', 'Cougar / Florida Panther', 'Cow', 'Deer', 'Fox', 'Frog', 'Green Iguana', 'Land Turtle', 'Otter', 'Possum', 'Raccoon', 'Rat', 'Rhesus Macaque', 'Skunk', 'Snake', 'Squirrel']],
        ['Cats & Dogs', ['Cat', 'Australian Shepherd', 'Chihuahua', 'Doberman', 'German Shepherd', 'Labrador', 'Rottweiler']],
        ['Birds', ['Duck', 'Flamingo', 'Heron', 'Pelican', 'Pigeon', 'Seagull', 'Spoonbill', 'Whooping Crane', 'Woodpecker']],
        ['Sea & Fish', ['American Alligator', 'Crayfish', 'Dolphin', 'Eel', 'Hammerhead Shark', 'Jellyfish', 'Manatee', 'Manta Ray', 'Sea Turtle', 'Shark', 'Whale']]
      ]
    },
    vehicles: {
      title: 'Vehicle tracker',
      hint: 'Partial list (launch week). Tick what you have discovered; add any missing ones below.',
      groups: [
        ['Sports', ['Albany Alpha', 'Annis Elegy \'90', 'Ascot Paragon', 'Bravado Banshee', 'Bravado Buffalo \'07', 'Coil Raiden', 'Dinka Blista \'85', 'Dinka Sugoi', 'Emperor Sultan', 'Emperor Vectre', 'Grotti Carbonizzare', 'Invetero Coquette', 'Invetero Coquette D10', 'Karin Futo \'85', 'Lampadati Komoda', 'Maibatsu Penumbra', 'Maibatsu Penumbra FF \'97', 'Obey 8F Drafter', 'Obey Omnis e-GT', 'Ocelot Jugular', 'Ocelot Locust', 'Pfister Comet \'88', 'Pfister Comet S2 Cabrio', 'Pfister Growler', 'Pfister Neon', 'Übermacht Cypher']],
        ['Super', ['Albany V-STR', 'Grotti Bestia GTS', 'Grotti Itali GTO', 'Grotti Itali RSX', 'Vysser Neo']],
        ['Sedans & Coupes', ['Vapid Stanier G2', 'Benefactor Schutzen']],
        ['Off-Road & Utility', ['Vapid Marshall', 'Brute Ripley', 'Stanley Furrow TC 2350']],
        ['Motorcycles & Cycles', ['Principe Esskey', 'Del Perro Erode']],
        ['Service & Emergency', ['Karin Vivanite Taxi', 'VCIA Metromule', 'Dinka Verus Lifeguard']],
        ['Industrial & Commercial', ['JoBuilt MB2-10', 'MTL CR5013', 'MTL Dump', 'HVY TH42 Telehandler', 'Vapid Guardian TX2']],
        ['Military', ['Hauners Brigade']],
        ['Boats', ['Hulls Pontoon', 'Rugger Hemming', 'Lure Predator L20S']],
        ['Planes', ['Hauners P-996 Lazer', 'Buckingham DH-7 Iron Mule', 'Lapwing 300-H']],
        ['Helicopters', ['Buckingham Maverick', 'Buckingham News Maverick', 'Decker Crake']]
      ]
    }
  };

  // The map ships spawn heatmaps for every animal and vehicle. Use their names as
  // the full tracker lists (falls back to the short lists above if missing).
  var HEATIDX = (window.GTA6_HEATMAPS && window.GTA6_HEATMAPS.index) || [];
  var heatIdByName = Object.create(null);
  function heatGroups(keep) {
    var order = [], by = Object.create(null), seen = Object.create(null);
    HEATIDX.forEach(function (h) {
      if (!h || !h.title || !keep(h.label || '') || seen[h.title]) return;
      seen[h.title] = 1;
      heatIdByName[h.title] = h.id;
      if (!by[h.label]) { by[h.label] = []; order.push(h.label); }
      by[h.label].push(h.title);
    });
    return order.map(function (l) { return [l.replace(/^Animals - /, ''), by[l].sort()]; });
  }
  if (HEATIDX.length) {
    var aGroups = heatGroups(function (l) { return /^Animals - /.test(l); });
    var vGroups = heatGroups(function (l) { return !/^Animals - /.test(l) && l !== 'Trailers' && l !== 'Drones'; });
    var count = function (gs) { return gs.reduce(function (n, g) { return n + g[1].length; }, 0); };
    if (aGroups.length) {
      LISTS.animals.groups = aGroups;
      LISTS.animals.hint = count(aGroups) + ' animals from the map spawn data. Tick what you have studied; ⌖ shows where it spawns.';
    }
    if (vGroups.length) {
      LISTS.vehicles.groups = vGroups;
      LISTS.vehicles.hint = count(vGroups) + ' vehicles from the map spawn data (trailers left out). Tick what you have discovered; ⌖ shows where it spawns.';
    }
  }

  // show one animal/vehicle's spawn heatmap on the map
  function showSpawns(nm) {
    var id = heatIdByName[nm];
    if (!id || !app.heat) return;
    app.heat.open(true);
    app.heat.enable(app.heat.enabled(), false);
    app.heat.enable([id], true);
    close();
  }

  // Collectible cards: 18 sets, 480 cards (launch-week guides). The three dancer
  // sets are fully on the map, so they count from found markers. For the rest,
  // count cards by hand or log card names (ticking a name adds to the count).
  var CARD_SETS = [
    ['vc_flamingos', 'Vice City Flamingos', 24],
    ['vc_narcos', 'Vice City Narcos', 24],
    ['vc_manatees', 'Vice City Manatees', 24],
    ['vc_futbol', 'Club De Fútbol', 30],
    ['lc_swingers', 'Liberty City Swingers', 24],
    ['lc_penetrators', 'Liberty City Penetrators', 24],
    ['lc_wrath', 'Liberty City Wrath', 24],
    ['ls_corkers', 'Los Santos Corkers', 24],
    ['ls_panic', 'Los Santos Panic', 24, ['Marquise Bernard']],
    ['ls_pounders', 'Los Santos Pounders', 24],
    ['wrestling', 'Backyard Wrestling', 12],
    ['top_hooker', "America's Next Top Hooker", 24],
    ['delights', 'Delights Dancers', 18, null, 'Delights'],
    ['jack_hearts', 'Jack of Hearts Dancers', 36, null, 'Jack of Hearts'],
    ['nine1nine', 'Nine1Nine Dancers', 36, null, 'Nine1Nine'],
    ['ratface', 'The Legends of Ratface', 36],
    ['right_wing', "Right Wing: America's Hero", 36],
    ['ed_comics', 'Ed Comics Universe', 36]
  ];
  var CARD_ITEMS = CARD_SETS.map(function (c) {
    var it = { id: 'card_' + c[0], name: c[1], req: c[2], total: c[2], sub: true };
    if (c[4]) { it.auto = true; it.map = [c[4]]; it.note = 'Every card is on the map: tick them found there'; }
    else {
      it.list = 'card_' + c[0];
      LISTS[it.list] = {
        title: 'Card names',
        hint: 'Optional: log cards by name. Ticking or adding a name adds 1 to this set.',
        groups: c[3] ? [['Known cards', c[3]]] : []
      };
    }
    return it;
  });

  /* ------------------------------------------------------------- helpers */
  var typeSlugByName = Object.create(null);
  TAX.groups.forEach(function (g) { g.types.forEach(function (t) { typeSlugByName[t.name] = t.slug; }); });

  function H() {
    var st = app.state;
    if (!st.hundred || typeof st.hundred !== 'object') st.hundred = { c: {}, n: {} };
    if (!st.hundred.c) st.hundred.c = {};
    if (!st.hundred.n) st.hundred.n = {};
    return st.hundred;
  }

  function mapCount(item) {
    var slugs = Object.create(null);
    (item.map || []).forEach(function (n) { if (typeSlugByName[n]) slugs[typeSlugByName[n]] = 1; });
    var found = app.state.found, n = 0;
    for (var i = 0; i < MARKERS.length; i++) if (slugs[MARKERS[i].t] && found.has(MARKERS[i].id)) n++;
    return n;
  }

  function valueOf(item) {
    if (item.derive === 'cardSets') {
      return CARD_ITEMS.filter(function (s) { return valueOf(s) >= s.req; }).length;
    }
    return item.auto ? mapCount(item) : (H().c[item.id] || 0);
  }

  function setValue(item, v) {
    v = Math.max(0, Math.floor(Number(v) || 0));
    if (item.total && item.kind !== 'money') v = Math.min(v, item.total);
    if (item.kind === 'bool') v = v ? 1 : 0;
    if (v) H().c[item.id] = v; else delete H().c[item.id];
    app.save();
  }

  var fmtN = function (n) { return n.toLocaleString('en-US'); };
  var fmtV = function (item, v) { return item.kind === 'money' ? '$' + fmtN(v) : fmtN(v); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var ALL = [];
  var cardTotalsEl = null;
  GROUPS.forEach(function (g) { g.items.forEach(function (it) { it.group = g; ALL.push(it); }); });

  function summary() {
    var met = 0, frac = 0;
    ALL.forEach(function (it) {
      var v = valueOf(it), r = it.req || 1;
      if (v >= r) met++;
      frac += Math.min(1, v / r);
    });
    return { met: met, total: ALL.length, pct: Math.floor((frac / ALL.length) * 1000) / 10 };
  }

  /* ---------------------------------------------------------- sidebar card */
  var hero = document.querySelector('.progress-hero');
  var card = el('button', 'hd-card');
  card.type = 'button';
  card.setAttribute('aria-haspopup', 'dialog');
  card.innerHTML = '<span class="hd-card-top"><b>100% Completion</b><span class="hd-card-pct"></span></span>' +
    '<span class="bar"><i></i></span><span class="hd-card-sub"></span>';
  if (hero && hero.parentNode) hero.parentNode.insertBefore(card, hero.nextSibling);

  /* ---------------------------------------------------------------- modal */
  var modal = el('div', 'hd-modal');
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', '100% completion checklist');
  var panel = el('div', 'hd-panel');
  modal.appendChild(panel);
  document.body.appendChild(modal);

  var head = el('div', 'hd-head');
  var titleRow = el('div', 'hd-title-row');
  titleRow.appendChild(el('h2', null, 'A Long Road: 100% Completion'));
  var closeBtn = el('button', 'icon-btn hd-close', '✕');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close checklist');
  titleRow.appendChild(closeBtn);
  head.appendChild(titleRow);
  var headStats = el('div', 'hd-head-stats');
  var headBar = el('div', 'bar big'); var headBarI = el('i'); headBar.appendChild(headBarI);
  head.appendChild(headStats);
  head.appendChild(headBar);
  var tools = el('div', 'hd-tools');
  var hideDoneLbl = el('label', 'chip-btn');
  var hideDone = el('input'); hideDone.type = 'checkbox';
  hideDoneLbl.appendChild(hideDone); hideDoneLbl.appendChild(el('span', null, 'Hide completed'));
  tools.appendChild(hideDoneLbl);
  tools.appendChild(el('span', 'hd-src', 'Targets from launch-week guides. Check Stats > 100% Completion in-game.'));
  head.appendChild(tools);
  panel.appendChild(head);

  var body = el('div', 'hd-body');
  panel.appendChild(body);

  var rows = [];      // {item, row, bar, val, input, check}
  var groupEls = [];  // {g, el, stat}
  var listUIs = [];   // {id, boxes: {name: input}, extra container}

  function buildItem(item) {
    var row = el('div', 'hd-item');
    var top = el('div', 'hd-item-top');
    var name = el('div', 'hd-name');
    name.appendChild(el('b', null, item.name));
    if (item.auto) name.appendChild(el('span', 'hd-tag', 'auto from map'));
    if (item.derive) name.appendChild(el('span', 'hd-tag', 'auto from card sets'));
    if (item.sub) row.classList.add('hd-sub');
    top.appendChild(name);
    var val = el('span', 'hd-val');
    top.appendChild(val);
    row.appendChild(top);
    if (item.note) row.appendChild(el('div', 'hd-note', item.note));
    var bar = el('div', 'bar'); var bi = el('i'); bar.appendChild(bi);
    row.appendChild(bar);

    var ctl = el('div', 'hd-ctl');
    var r = { item: item, row: row, bar: bi, val: val };
    if (item.kind === 'bool') {
      var lbl = el('label', 'hd-bool');
      var cb = el('input'); cb.type = 'checkbox';
      cb.addEventListener('change', function () { setValue(item, cb.checked ? 1 : 0); });
      lbl.appendChild(cb); lbl.appendChild(el('span', null, 'Done'));
      ctl.appendChild(lbl);
      r.check = cb;
    } else if (!item.auto && !item.derive) {
      var step = item.kind === 'money' ? 10000 : 1;
      var minus = el('button', 'mini', '−'); minus.type = 'button';
      minus.setAttribute('aria-label', 'Decrease ' + item.name);
      var input = el('input', 'hd-num');
      input.type = 'number'; input.min = '0'; input.inputMode = 'numeric';
      if (item.total && item.kind !== 'money') input.max = String(item.total);
      input.step = String(item.kind === 'money' ? 1000 : 1);
      input.setAttribute('aria-label', item.name);
      var plus = el('button', 'mini', '+'); plus.type = 'button';
      plus.setAttribute('aria-label', 'Increase ' + item.name);
      minus.addEventListener('click', function () { setValue(item, valueOf(item) - step); });
      plus.addEventListener('click', function () { setValue(item, valueOf(item) + step); });
      input.addEventListener('change', function () { setValue(item, input.value); });
      ctl.appendChild(minus); ctl.appendChild(input); ctl.appendChild(plus);
      if (item.kind === 'money') ctl.appendChild(el('span', 'hd-unit', '±$10k'));
      r.input = input;
    }
    if (item.map && item.map.some(function (n) { return typeSlugByName[n]; })) {
      var show = el('button', 'mini hd-show', 'Show on map'); show.type = 'button';
      show.addEventListener('click', function () {
        close();
        app.search(item.q || item.map[0]);   // results list lives in the sidebar, where the card is
      });
      ctl.appendChild(show);
      if (item.auto) {
        ctl.appendChild(el('span', 'hd-unit', 'Mark them found on the map'));
      }
    }
    row.appendChild(ctl);
    if (item.list) row.appendChild(buildList(item));
    if (item.derive === 'cardSets') {
      var coll = el('details', 'hd-list hd-cards');
      coll.appendChild(el('summary', null, 'Card collection (18 sets, 480 cards)'));
      var cardsHead = el('div', 'hd-note');
      coll.appendChild(cardsHead);
      CARD_ITEMS.forEach(function (ci) { coll.appendChild(buildItem(ci)); });
      row.appendChild(coll);
      cardTotalsEl = cardsHead;
    }
    rows.push(r);
    return row;
  }

  function buildList(item) {
    var def = LISTS[item.list];
    var wrap = el('details', 'hd-list');
    wrap.appendChild(el('summary', null, def.title));
    wrap.appendChild(el('div', 'hd-note', def.hint));
    var filter = el('input', 'hd-filter');
    filter.type = 'search'; filter.placeholder = 'Filter names…';
    filter.setAttribute('aria-label', 'Filter ' + def.title);
    wrap.appendChild(filter);
    var ui = { id: item.list, item: item, boxes: Object.create(null), labels: [], extraWrap: null };

    function addBox(container, nm, removable) {
      var lbl = el('label', 'hd-chk');
      var cb = el('input'); cb.type = 'checkbox';
      cb.addEventListener('change', function () { toggleName(item, nm, cb.checked); });
      lbl.appendChild(cb);
      lbl.appendChild(el('span', null, nm));
      if (heatIdByName[nm]) {
        var pin = el('button', 'hd-pin', '⌖'); pin.type = 'button';
        pin.title = 'Show where ' + nm + ' spawns';
        pin.setAttribute('aria-label', pin.title);
        pin.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); showSpawns(nm); });
        lbl.appendChild(pin);
      }
      if (removable) {
        var x = el('button', 'hd-x', '✕'); x.type = 'button';
        x.setAttribute('aria-label', 'Remove ' + nm);
        x.addEventListener('click', function (e) { e.preventDefault(); removeName(item, nm); });
        lbl.appendChild(x);
      }
      container.appendChild(lbl);
      ui.boxes[nm] = cb;
      ui.labels.push({ el: lbl, q: nm.toLowerCase() });
    }

    def.groups.forEach(function (g) {
      var sec = el('div', 'hd-lgroup');
      sec.appendChild(el('div', 'hd-lgroup-h', g[0]));
      var grid = el('div', 'hd-grid');
      g[1].forEach(function (nm) { addBox(grid, nm, false); });
      sec.appendChild(grid);
      wrap.appendChild(sec);
    });
    var extra = el('div', 'hd-lgroup');
    extra.appendChild(el('div', 'hd-lgroup-h', 'Added by you'));
    var extraGrid = el('div', 'hd-grid');
    extra.appendChild(extraGrid);
    wrap.appendChild(extra);
    var add = el('div', 'inline-add');
    var addIn = el('input'); addIn.type = 'text'; addIn.maxLength = 60;
    addIn.placeholder = 'Add a name (adds 1 to the count)';
    addIn.setAttribute('aria-label', 'Add to ' + def.title);
    var addBtn = el('button', 'mini', 'Add'); addBtn.type = 'button';
    function doAdd() {
      var nm = addIn.value.trim().slice(0, 60);
      if (!nm) return;
      addIn.value = '';
      var l = listState(item.list);
      if (ui.boxes[nm]) { if (!ui.boxes[nm].checked) toggleName(item, nm, true); return; }
      l.x.push(nm);
      toggleName(item, nm, true);
    }
    addBtn.addEventListener('click', doAdd);
    addIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') doAdd(); });
    add.appendChild(addIn); add.appendChild(addBtn);
    wrap.appendChild(add);

    filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase();
      ui.labels.forEach(function (l) { l.el.hidden = q && l.q.indexOf(q) < 0; });
    });

    ui.extraGrid = extraGrid;
    ui.addBox = addBox;
    ui.extraEl = extra;
    listUIs.push(ui);
    return wrap;
  }

  function listState(id) {
    var n = H().n;
    if (!n[id]) n[id] = { k: [], x: [] };
    if (!n[id].k) n[id].k = [];
    if (!n[id].x) n[id].x = [];
    return n[id];
  }

  // ticking a name moves the counter with it; the counter can still be set by hand
  function toggleName(item, nm, on) {
    var l = listState(item.list);
    var i = l.k.indexOf(nm);
    var cur = H().c[item.id] || 0;
    if (on && i < 0) { l.k.push(nm); cur++; }
    if (!on && i >= 0) { l.k.splice(i, 1); cur = Math.max(0, cur - 1); }
    setValue(item, cur);
  }

  function removeName(item, nm) {
    var l = listState(item.list);
    var xi = l.x.indexOf(nm);
    if (xi >= 0) l.x.splice(xi, 1);
    if (l.k.indexOf(nm) >= 0) toggleName(item, nm, false); else app.save();
  }

  GROUPS.forEach(function (g) {
    var sec = el('section', 'hd-group');
    var h = el('div', 'hd-group-h');
    h.appendChild(el('h3', null, g.name));
    var stat = el('span', 'hd-group-stat');
    h.appendChild(stat);
    sec.appendChild(h);
    sec.appendChild(el('div', 'hd-note', 'Worth ' + g.weight));
    g.items.forEach(function (it) { sec.appendChild(buildItem(it)); });
    body.appendChild(sec);
    groupEls.push({ g: g, stat: stat });
  });

  /* -------------------------------------------------------------- refresh */
  function refresh() {
    var s = summary();
    if (cardTotalsEl) {
      var have = 0, setsDone = 0;
      CARD_ITEMS.forEach(function (ci) { var v = Math.min(valueOf(ci), ci.req); have += v; if (v >= ci.req) setsDone++; });
      cardTotalsEl.textContent = have + ' / 480 cards · ' + setsDone + ' / 18 sets complete. Sets and sizes from launch-week guides.';
    }
    card.querySelector('.hd-card-pct').textContent = s.pct + '%';
    card.querySelector('.bar i').style.width = s.pct + '%';
    card.querySelector('.hd-card-sub').textContent = s.met + ' / ' + s.total + ' requirements met';
    if (modal.hidden) return;
    headStats.textContent = s.met + ' of ' + s.total + ' requirements met · ' + s.pct + '% overall';
    headBarI.style.width = s.pct + '%';
    rows.forEach(function (r) {
      var it = r.item, v = valueOf(it), req = it.req || 1;
      var done = v >= req;
      r.row.classList.toggle('done', done);
      r.row.hidden = hideDone.checked && done;
      r.bar.style.width = Math.min(100, (v / req) * 100) + '%';
      r.val.textContent = it.kind === 'bool' ? (done ? 'Done' : 'Not yet')
        : fmtV(it, v) + ' / ' + fmtV(it, req) + (it.total && it.total !== req ? ' (of ' + fmtN(it.total) + ')' : '');
      if (r.input && document.activeElement !== r.input) r.input.value = String(v);
      if (r.check) r.check.checked = done;
    });
    groupEls.forEach(function (ge) {
      var n = 0;
      ge.g.items.forEach(function (it) { if (valueOf(it) >= (it.req || 1)) n++; });
      ge.stat.textContent = n + ' / ' + ge.g.items.length;
    });
    listUIs.forEach(function (ui) {
      var l = H().n[ui.id] || { k: [], x: [] };   // read-only: viewing never writes
      l = { k: l.k || [], x: l.x || [] };
      l.x.concat(l.k).forEach(function (nm) { if (!ui.boxes[nm]) ui.addBox(ui.extraGrid, nm, true); });
      Object.keys(ui.boxes).forEach(function (nm) {
        var box = ui.boxes[nm];
        if (ui.extraGrid.contains(box) && l.x.indexOf(nm) < 0 && l.k.indexOf(nm) < 0) {   // removed (here or on another device)
          box.parentNode.remove();
          ui.labels = ui.labels.filter(function (x) { return x.q !== nm.toLowerCase(); });
          delete ui.boxes[nm];
          return;
        }
        box.checked = l.k.indexOf(nm) >= 0;
      });
      ui.extraEl.hidden = !ui.extraGrid.children.length;
    });
  }

  /* ------------------------------------------------------------ open/close */
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    refresh();
    closeBtn.focus();
  }
  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  card.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) { e.preventDefault(); close(); } });
  hideDone.addEventListener('change', refresh);

  window.__hundredRefresh = refresh;
  window.__hundred = { groups: GROUPS, open: open, close: close, summary: summary, value: valueOf };
  refresh();
})();
