/* ═══════════════════════════════════════════════════════════════════════════
   RRMI · tracker.js  — Visitor Analytics Engine  (v1.0)
   Runs silently on every page. Zero impact on perceived performance.
   Storage: localStorage  |  Session guard: sessionStorage
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';
(function RRMI_Tracker() {

  /* ── CONFIG ────────────────────────────────────────────────────────────── */
  var STORE_KEY    = 'rrmi_visits';       // array of visit records
  var MONTH_KEY    = 'rrmi_month';        // current month marker  "YYYY-MM"
  var SESSION_KEY  = 'rrmi_session';      // unique session id
  var IPDATA_KEY   = 'rrmi_ipdata';       // cached IP / geo (sessionStorage)
  var MAX_RECORDS  = 10000;               // cap log to prevent runaway storage
  var DEDUP_SECS   = 30;                  // ignore same-page reload within N sec

  /* ── PAGE MAP ──────────────────────────────────────────────────────────── */
  // Maps URL hashes / titles to readable page names.
  // Falls back to the document title or hash automatically — future-proof.
  function detectPage() {
    var h = (window.location.hash || '').replace('#','').trim();
    var map = {
      '':'Home','home':'Home',
      'about':'About Us','welcome':'About Us',
      'ministries':'Ministries',
      'sermons':'Sermons',
      'events':'Events',
      'livestream':'Live Stream',
      'gallery':'Gallery',
      'prayer':'Prayer Request',
      'give':'Give / Donation',
      'testimonials':'Testimonials',
      'contact':'Contact',
      'footer':'Contact'
    };
    if (map[h]) return map[h];
    // Dynamic fallback — capture title or first path segment
    var title = document.title.replace(' · RRMI','').replace('Redemption Revival Ministry International','Home').trim();
    return title || 'Page: '+(h||'Home');
  }

  /* ── DEVICE DETECTION ──────────────────────────────────────────────────── */
  function parseUA() {
    var ua = navigator.userAgent;
    // Device
    var device = 'Desktop';
    if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
    else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) device = 'Mobile';
    // Browser
    var browser = 'Unknown';
    if      (/Edg\//i.test(ua))                      browser = 'Edge';
    else if (/OPR\/|Opera/i.test(ua))                browser = 'Opera';
    else if (/SamsungBrowser/i.test(ua))             browser = 'Samsung Internet';
    else if (/Chrome\/\d/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Firefox\/\d/i.test(ua))                browser = 'Firefox';
    else if (/Safari\/\d/i.test(ua) && !/Chrome/i.test(ua))   browser = 'Safari';
    else if (/MSIE|Trident/i.test(ua))               browser = 'Internet Explorer';
    // OS
    var os = 'Unknown';
    if      (/Windows NT 10/i.test(ua))  os = 'Windows 10/11';
    else if (/Windows NT/i.test(ua))     os = 'Windows';
    else if (/Mac OS X/i.test(ua))       os = 'macOS';
    else if (/iPhone/i.test(ua))         os = 'iOS';
    else if (/iPad/i.test(ua))           os = 'iPadOS';
    else if (/Android/i.test(ua))        os = 'Android';
    else if (/Linux/i.test(ua))          os = 'Linux';
    return { device: device, browser: browser, os: os };
  }

  /* ── SESSION ID ────────────────────────────────────────────────────────── */
  function getSession() {
    var s = sessionStorage.getItem(SESSION_KEY);
    if (!s) { s = 'sess-'+Date.now()+'-'+Math.random().toString(36).slice(2,8); sessionStorage.setItem(SESSION_KEY, s); }
    return s;
  }

  /* ── STORAGE HELPERS ───────────────────────────────────────────────────── */
  function loadVisits() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch(e) { return []; }
  }
  function saveVisits(arr) {
    // trim to cap
    if (arr.length > MAX_RECORDS) arr = arr.slice(arr.length - MAX_RECORDS);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(arr)); } catch(e) {}
  }

  /* ── MONTHLY AUTO-RESET ────────────────────────────────────────────────── */
  function checkMonthReset() {
    var now   = new Date();
    var month = now.getFullYear()+'-'+(now.getMonth()+1).toString().padStart(2,'0');
    var stored = localStorage.getItem(MONTH_KEY);
    if (stored && stored !== month) {
      // New month — archive last month's data then clear active
      try {
        var old = loadVisits();
        if (old.length) {
          localStorage.setItem('rrmi_visits_archive_'+stored, JSON.stringify(old.slice(-500)));
        }
      } catch(e){}
      saveVisits([]);
    }
    localStorage.setItem(MONTH_KEY, month);
  }

  /* ── DUPLICATE GUARD ───────────────────────────────────────────────────── */
  function isDuplicate(session, page) {
    var key = 'rrmi_last_'+session+'_'+page.replace(/\W/g,'_');
    var last = parseInt(sessionStorage.getItem(key)||'0');
    var now  = Date.now();
    if ((now - last) < DEDUP_SECS * 1000) return true;
    sessionStorage.setItem(key, now);
    return false;
  }

  /* ── SESSION DURATION ──────────────────────────────────────────────────── */
  var _pageStart = Date.now();
  var _visitId   = null;

  function updateDuration() {
    if (!_visitId) return;
    try {
      var visits = loadVisits();
      var idx = visits.findIndex(function(v){ return v.id === _visitId; });
      if (idx >= 0) {
        visits[idx].duration = Math.round((Date.now() - _pageStart) / 1000);
        saveVisits(visits);
      }
    } catch(e){}
  }

  // Update duration every 15 seconds + on page unload
  setInterval(updateDuration, 15000);
  window.addEventListener('beforeunload', updateDuration);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) updateDuration(); });

  /* ── GEOLOCATION (async, non-blocking) ────────────────────────────────── */
  function getGeo(cb) {
    // Try sessionStorage cache first to avoid repeat API calls
    try {
      var cached = sessionStorage.getItem(IPDATA_KEY);
      if (cached) { cb(JSON.parse(cached)); return; }
    } catch(e){}

    // Free geo API — no key needed, 1000/day free
    fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined })
      .then(function(r){ return r.json(); })
      .then(function(d){
        var geo = {
          ip:      d.ipAddress    || 'Unknown',
          country: d.countryName  || 'Unknown',
          region:  d.regionName   || 'Unknown',
          city:    d.cityName     || ''
        };
        try { sessionStorage.setItem(IPDATA_KEY, JSON.stringify(geo)); } catch(e){}
        cb(geo);
      })
      .catch(function(){
        var fallback = { ip:'Unavailable', country:'Unknown', region:'Unknown', city:'' };
        try { sessionStorage.setItem(IPDATA_KEY, JSON.stringify(fallback)); } catch(e){}
        cb(fallback);
      });
  }

  /* ── RECORD A VISIT ────────────────────────────────────────────────────── */
  function recordVisit(geo) {
    var session = getSession();
    var page    = detectPage();

    if (isDuplicate(session, page)) return;

    var ua   = parseUA();
    var now  = new Date();
    var visit = {
      id:       'v-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
      ts:       now.getTime(),
      date:     now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
      time:     now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),
      ip:       geo.ip,
      country:  geo.country,
      region:   geo.region,
      city:     geo.city,
      device:   ua.device,
      browser:  ua.browser,
      os:       ua.os,
      page:     page,
      duration: 0,
      session:  session,
      returning: !!localStorage.getItem('rrmi_returning_'+session.slice(0,8))
    };
    _visitId = visit.id;

    // Mark as returning on future sessions
    try { localStorage.setItem('rrmi_returning_'+session.slice(0,8), '1'); } catch(e){}

    var visits = loadVisits();
    visits.push(visit);
    saveVisits(visits);
  }

  /* ── TRACK HASH CHANGES (SPA-style single-page navigation) ────────────── */
  window.addEventListener('hashchange', function() {
    _pageStart = Date.now();
    getGeo(recordVisit);
  });

  /* ── BOOT (deferred so it never blocks render) ─────────────────────────── */
  function boot() {
    checkMonthReset();
    getGeo(recordVisit);
  }

  // Use requestIdleCallback if available, else 500ms timeout
  if (window.requestIdleCallback) {
    window.requestIdleCallback(boot, { timeout: 2000 });
  } else {
    setTimeout(boot, 500);
  }

})();
