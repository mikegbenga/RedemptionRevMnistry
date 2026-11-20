/* ═══════════════════════════════════════════════════════
   RRMI v6 — Visitor Analytics Tracker
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const KEY = 'rrmi_analytics';
  const START_KEY = 'rrmi_session_start';
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 7); // YYYY-MM

  function getDB() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { month: today, visitors: [], total: 0, countries: {} }; }
    catch { return { month: today, visitors: [], total: 0, countries: {} }; }
  }
  function saveDB(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  }

  // Monthly reset
  function resetIfNewMonth(db) {
    if (db.month !== today) {
      db.month = today;
      db.visitors = [];
      db.total = 0;
      db.countries = {};
    }
    return db;
  }

  // Deduplicate by session
  function getSessionId() {
    let id = sessionStorage.getItem('rrmi_sid');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('rrmi_sid', id);
    }
    return id;
  }

  // Device detection
  function getDevice() {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) return /iPad/i.test(ua) ? 'Tablet' : 'Mobile';
    return 'Desktop';
  }
  function getOS() {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }
  function getBrowser() {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\//i.test(ua)) return 'Opera';
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua)) return 'Safari';
    return 'Other';
  }

  // Fetch IP/geo
  function fetchGeo(cb) {
    try {
      fetch('https://freeipapi.com/api/json/', { method: 'GET', mode: 'cors' })
        .then(r => r.ok ? r.json() : null)
        .then(d => cb(d && d.countryName ? { country: d.countryName, city: d.cityName || '', ip: d.ipAddress || '' } : null))
        .catch(() => cb(null));
    } catch { cb(null); }
  }

  function record(geo) {
    let db = getDB();
    db = resetIfNewMonth(db);
    const sid = getSessionId();

    // Check if this session already recorded
    if (db.visitors.some(v => v.sid === sid)) return;

    db.total = (db.total || 0) + 1;

    const entry = {
      sid,
      ts: new Date().toISOString(),
      device: getDevice(),
      os: getOS(),
      browser: getBrowser(),
      page: location.pathname,
      referrer: document.referrer || 'direct',
      country: geo ? geo.country : 'Unknown',
      city: geo ? geo.city : '',
    };

    db.visitors.push(entry);

    // Countries count
    if (!db.countries) db.countries = {};
    db.countries[entry.country] = (db.countries[entry.country] || 0) + 1;

    // Keep last 500 only
    if (db.visitors.length > 500) db.visitors = db.visitors.slice(-500);

    saveDB(db);

    // Session start time for duration
    sessionStorage.setItem(START_KEY, String(now));
  }

  // Track session duration on unload
  window.addEventListener('beforeunload', () => {
    const start = parseInt(sessionStorage.getItem(START_KEY), 10);
    if (!start) return;
    const duration = Math.round((Date.now() - start) / 1000);
    const sid = getSessionId();
    const db = getDB();
    const visitor = db.visitors.find(v => v.sid === sid);
    if (visitor) {
      visitor.duration = duration;
      saveDB(db);
    }
  });

  fetchGeo(record);

})();
