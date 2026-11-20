/* Google sign-in + cloud progress for the Leonida map.
 *
 * The map keeps its whole state in one localStorage document. This module
 * mirrors that document to Firestore at users/{uid}/progress/main and keeps
 * devices in step:
 *   - app.js calls window.__cloudSave(payload) after every local save;
 *     we debounce and upload it.
 *   - on sign-in and on remote changes we reconcile cloud vs local by comparing
 *     content with what was in sync last time, merging only when
 *     both sides changed.
 */
const SDK = window.FIREBASE_SDK_BASE || 'https://www.gstatic.com/firebasejs/10.14.1/';
const STORE_KEY = 'gta6-leonida-offline-v1';
const SYNC_KEY = 'gta6-leonida-cloud-sync';   // {uid, local, cloud}
const CLIENT_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
const WRITE_DELAY = 1200;

const $ = (id) => document.getElementById(id);
const ui = {
  box: $('account'),
  signIn: $('btnSignIn'),
  user: $('acctUser'),
  avatar: $('acctAvatar'),
  name: $('acctName'),
  status: $('acctStatus'),
  signOut: $('btnSignOut'),
  note: $('acctNote'),
  pill: $('syncPill')
};

function setStatus(text, kind) {
  if (ui.status) ui.status.textContent = text;
  if (ui.pill) {
    ui.pill.textContent = kind === 'cloud' ? 'cloud' : kind === 'error' ? 'sync error' : kind === 'busy' ? 'syncing' : 'local';
    ui.pill.dataset.kind = kind || 'local';
  }
}

function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.hidden = true; }, 3200);
}

function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
}
function writeJSON(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage blocked */ }
}

function isEmpty(d) {
  return !d || (!(d.found || []).length && !Object.keys(d.notes || {}).length &&
    !(d.custom || []).length && !(d.lists || []).length);
}

/* Content fingerprint: what the document holds, ignoring when it was saved.
 * The app re-saves on some UI events without changing anything, so change
 * detection compares content, never timestamps. */
const FP_KEYS = ['found', 'notes', 'custom', 'lists', 'hidden', 'hideFound', 'theme',
  'completion', 'onlyNotes', 'onlyList', 'heat', 'heatOn', 'hundred'];
function stable(v) {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function fingerprint(d) {
  if (!d) return '';
  const o = {};
  FP_KEYS.forEach((k) => { o[k] = d[k]; });
  return stable(o);
}

/* Both sides changed since the last sync: keep everything from both.
 * On a conflict for the same note / marker / setting, the newer document wins. */
function merge(a, b) {
  const [older, newer] = String(a.updated || '') > String(b.updated || '') ? [b, a] : [a, b];
  const found = new Set([...(older.found || []), ...(newer.found || [])]);
  const notes = Object.assign({}, older.notes || {}, newer.notes || {});
  const byId = (arrA, arrB) => {
    const m = new Map();
    (arrA || []).forEach((x) => x && m.set(x.id, x));
    (arrB || []).forEach((x) => x && m.set(x.id, x));
    return m;
  };
  const custom = [...byId(older.custom, newer.custom).values()];
  const listMap = byId(older.lists, newer.lists);
  (older.lists || []).forEach((l) => {
    const cur = listMap.get(l.id);
    if (cur && cur !== l) cur.markerIds = [...new Set([...(cur.markerIds || []), ...(l.markerIds || [])])];
  });
  // 100% checklist: in-game progress only goes up, so counters keep the higher value
  const ha = older.hundred || { c: {}, n: {} }, hb = newer.hundred || { c: {}, n: {} };
  const hundred = { c: Object.assign({}, ha.c || {}), n: {} };
  Object.keys(hb.c || {}).forEach((k) => { hundred.c[k] = Math.max(hundred.c[k] || 0, hb.c[k] || 0); });
  new Set([...Object.keys(ha.n || {}), ...Object.keys(hb.n || {})]).forEach((k) => {
    const a = (ha.n || {})[k] || {}, b = (hb.n || {})[k] || {};
    hundred.n[k] = { k: [...new Set([...(a.k || []), ...(b.k || [])])], x: [...new Set([...(a.x || []), ...(b.x || [])])] };
  });
  return Object.assign({}, older, newer, {
    found: [...found].sort(), notes, custom, lists: [...listMap.values()], hundred
  });
}

(async function main() {
  const cfg = window.FIREBASE_CONFIG;
  if (!ui.box) return;
  if (!cfg || !cfg.apiKey) {
    ui.signIn.hidden = false;
    ui.signIn.disabled = true;
    ui.note.textContent = 'Cloud save is not set up yet (see SETUP.md). Progress is saved in this browser.';
    setStatus('', 'local');
    return;
  }

  const app0 = window.__gta6;
  if (!app0 || !app0.importData) return;   // map failed to load; app.js shows the error

  let fb;
  try {
    const [appMod, authMod, fsMod] = await Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js'),
      import(SDK + 'firebase-firestore.js')
    ]);
    fb = { ...appMod, ...authMod, ...fsMod };
  } catch (e) {
    ui.signIn.hidden = false;
    ui.signIn.disabled = true;
    ui.note.textContent = 'Could not reach Google sign-in. Progress is saved in this browser.';
    setStatus('', 'error');
    return;
  }

  const app = fb.initializeApp(cfg);
  const auth = fb.getAuth(app);
  const db = fb.initializeFirestore(app, {
    localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() })
  });
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user = null;
  let ref = null;
  let unsub = null;
  let applying = false;
  let ready = false;          // initial reconcile done for the current user
  let timer = null;
  let pending = null;

  const localDoc = () => readJSON(STORE_KEY);
  const syncInfo = () => readJSON(SYNC_KEY) || {};

  // remembers what was in sync last time: content fingerprint + cloud stamp
  function markSynced(fp, cloudUpdated) {
    writeJSON(SYNC_KEY, { uid: user.uid, fp: fp, cloud: cloudUpdated });
  }

  function localDirty() {
    const s = syncInfo();
    const l = localDoc();
    if (!l || isEmpty(l)) return false;
    if (s.uid !== user.uid) return s.uid ? false : true;   // another account's leftovers never upload
    return fingerprint(l) !== s.fp;
  }

  function apply(data) {
    applying = true;
    try {
      const res = window.__gta6.importData(data);
      if (!res || !res.ok) throw new Error('import rejected: ' + (res && res.reason));
    } finally {
      applying = false;
    }
    return fingerprint(localDoc());
  }

  async function upload(payload) {
    const doc = Object.assign({}, payload);
    delete doc.writer;
    setStatus('Saving…', 'busy');
    await fb.setDoc(ref, {
      data: JSON.stringify(doc),
      updated: doc.updated,
      writer: CLIENT_ID,
      found: (doc.found || []).length,
      savedAt: fb.serverTimestamp()
    });
    markSynced(fingerprint(doc), doc.updated);
    setStatus('Saved to your Google account', 'cloud');
  }

  function scheduleUpload(payload) {
    const s = syncInfo();
    if (s.uid === user.uid && fingerprint(payload) === s.fp) {   // nothing new (UI re-save)
      pending = null; clearTimeout(timer); return;
    }
    pending = payload;
    clearTimeout(timer);
    timer = setTimeout(flush, WRITE_DELAY);
  }

  async function flush() {
    clearTimeout(timer);
    if (!pending || !user || !ready) return;
    const p = pending;
    pending = null;
    try { await upload(p); }
    catch (e) {
      console.error('[cloud] save failed', e);
      setStatus('Could not save (will retry)', 'error');
      pending = pending || p;
      timer = setTimeout(flush, 8000);
    }
  }

  window.__cloudSave = function (payload) {
    if (applying || !user || !ready) return;
    scheduleUpload(payload);
  };

  async function reconcile(cloudRaw, cloudUpdated, isInitial) {
    const s = syncInfo();
    const local = localDoc();
    const cloud = cloudRaw ? JSON.parse(cloudRaw) : null;
    const dirty = (pending != null && fingerprint(pending) !== s.fp) || localDirty();
    const cloudChanged = cloud && (s.uid !== user.uid || cloudUpdated !== s.cloud);

    if (!cloud) {                                     // first sign-in on any device
      if (local && !isEmpty(local) && (s.uid === user.uid || !s.uid)) await upload(local);
      else if (s.uid && s.uid !== user.uid) {          // previous account's data on this device
        apply({ found: [], notes: {}, custom: [], lists: [], hundred: { c: {}, n: {} } });
        markSynced(fingerprint(localDoc()), null);
      } else setStatus('Signed in — progress will save here', 'cloud');
      return;
    }
    if (!cloudChanged) {
      if (dirty) await upload(pending || local); else setStatus('Synced', 'cloud');
      pending = null;
      return;
    }
    if (fingerprint(cloud) === fingerprint(pending || local)) {   // same content already
      pending = null;
      markSynced(fingerprint(cloud), cloudUpdated);
      setStatus('Synced', 'cloud');
      return;
    }
    if (!dirty) {                                     // only the cloud moved: take it
      const lu = apply(cloud);
      markSynced(lu, cloudUpdated);
      setStatus('Synced', 'cloud');
      if (!isInitial) toast('Progress updated from another device');
      else if (!isEmpty(cloud)) toast('Loaded your saved progress (' + (cloud.found || []).length + ' found)');
      return;
    }
    // both moved: merge, keep the result locally and in the cloud
    const merged = merge(pending || local, cloud);
    pending = null;
    apply(merged);
    await upload(localDoc());
    toast('Merged progress from this device with your account');
  }

  async function startUser(u) {
    user = u;
    ready = false;
    ref = fb.doc(db, 'users', u.uid, 'progress', 'main');
    ui.signIn.hidden = true;
    ui.user.hidden = false;
    ui.note.hidden = true;
    ui.name.textContent = u.displayName || u.email || 'Signed in';
    if (u.photoURL) { ui.avatar.src = u.photoURL; ui.avatar.hidden = false; } else ui.avatar.hidden = true;
    setStatus('Syncing…', 'busy');
    try {
      const snap = await fb.getDoc(ref);
      const d = snap.exists() ? snap.data() : null;
      await reconcile(d && d.data, d && d.updated, true);
    } catch (e) {
      console.error('[cloud] initial sync failed', e);
      setStatus('Sync failed: ' + (e.code || e.message), 'error');
      return;
    }
    ready = true;
    if (pending) flush();
    unsub = fb.onSnapshot(ref, (snap) => {
      if (snap.metadata.hasPendingWrites || !snap.exists()) return;
      const d = snap.data();
      if (d.writer === CLIENT_ID) return;
      if (d.updated === syncInfo().cloud) return;
      reconcile(d.data, d.updated, false).catch((e) => {
        console.error('[cloud] live sync failed', e);
        setStatus('Sync error', 'error');
      });
    }, (e) => {
      console.error('[cloud] listener error', e);
      setStatus('Sync error: ' + (e.code || e.message), 'error');
    });
  }

  function stopUser() {
    if (unsub) { unsub(); unsub = null; }
    clearTimeout(timer);
    user = null; ref = null; ready = false; pending = null;
    ui.signIn.hidden = false;
    ui.signIn.disabled = false;
    ui.user.hidden = true;
    ui.note.hidden = false;
    ui.note.textContent = 'Sign in to save your progress to your Google account and use it on any device.';
    setStatus('', 'local');
  }

  ui.signIn.addEventListener('click', async () => {
    ui.signIn.disabled = true;
    try {
      await fb.signInWithPopup(auth, provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        await fb.signInWithRedirect(auth, provider);
        return;
      }
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        console.error('[cloud] sign-in failed', e);
        toast('Sign-in failed: ' + (e.code || e.message));
      }
    } finally {
      ui.signIn.disabled = false;
    }
  });

  ui.signOut.addEventListener('click', async () => {
    await flush();
    await fb.signOut(auth);
    toast('Signed out. Progress stays saved in your account.');
  });

  // try to get unsaved changes out before the tab goes away
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });

  stopUser();
  fb.onAuthStateChanged(auth, (u) => {
    if (u && (!user || user.uid !== u.uid)) { if (user) stopUser(); startUser(u); }
    else if (!u && user) stopUser();
  });
})();
