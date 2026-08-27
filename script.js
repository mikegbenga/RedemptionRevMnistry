/* ════════════════════════════════════════════════════════════════
   RRMI · Premium Interactions v2.0
   Sacred Luxury — Obsidian & Gold
   ════════════════════════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initHeroSlider();
  initScrollReveal();
  initScrollSpy();
  initStatCounters();
  initTestimonials();
  initGallery();
  initCountdown();
  initForms();
  initGiveAmounts();
  initGiveModal();
  initMagneticButtons();
  setFooterYear();
  initCMSContent();
});

/* ── NAVBAR ─────────────────────────────────────────────────── */
function initNavbar() {
  var nav       = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
  }
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
    });
  });
  document.addEventListener('click', function (e) {
    if (nav && !nav.contains(e.target)) {
      navLinks && navLinks.classList.remove('open');
      hamburger && hamburger.classList.remove('open');
    }
  });
}

/* ── HERO SLIDER ─────────────────────────────────────────────── */
function initHeroSlider() {
  var slides = document.querySelectorAll('.hero-slide');
  var dots   = document.querySelectorAll('.hero-dots .dot');
  var current = 0;
  var timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function startAuto() { timer = setInterval(function () { goTo(current + 1); }, 6500); }
  function stopAuto()  { clearInterval(timer); }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { stopAuto(); goTo(i); startAuto(); });
  });

  startAuto();
}

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
function initScrollReveal() {
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { observer.observe(el); });
}

/* ── SCROLL SPY ──────────────────────────────────────────────── */
function initScrollSpy() {
  var sections = document.querySelectorAll('section[id]');
  var links    = document.querySelectorAll('.nav-links a');
  var navH     = 80;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-' + navH + 'px 0px -55% 0px' });

  sections.forEach(function (s) { observer.observe(s); });
}

/* ── STAT COUNTERS ───────────────────────────────────────────── */
function initStatCounters() {
  var counters = document.querySelectorAll('.stat-num[data-target]');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.dataset.target, 10);
      var dur = 2200;
      var step = 16;
      var inc = target / (dur / step);
      var current = 0;
      var timer = setInterval(function () {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(function (c) { observer.observe(c); });
}

/* ── TESTIMONIALS ────────────────────────────────────────────── */
function initTestimonials() {
  var slides   = document.querySelectorAll('.testimonial-slide');
  var dotsWrap = document.getElementById('testDots');
  var prevBtn  = document.getElementById('testPrev');
  var nextBtn  = document.getElementById('testNext');
  if (!slides.length) return;

  var current = 0;
  var timer;

  if (dotsWrap) {
    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'test-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Testimonial ' + (i + 1));
      d.addEventListener('click', function () { stopAuto(); goTo(i); startAuto(); });
      dotsWrap.appendChild(d);
    });
  }

  var dotEls = dotsWrap ? dotsWrap.querySelectorAll('.test-dot') : [];

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotEls[current] && dotEls[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotEls[current] && dotEls[current].classList.add('active');
  }

  function startAuto() { timer = setInterval(function () { goTo(current + 1); }, 5200); }
  function stopAuto()  { clearInterval(timer); }

  prevBtn && prevBtn.addEventListener('click', function () { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', function () { stopAuto(); goTo(current + 1); startAuto(); });

  /* Swipe */
  var startX = 0;
  var track = document.querySelector('.testimonial-track');
  if (track) {
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { stopAuto(); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });
  }

  startAuto();
}

/* ── GALLERY ─────────────────────────────────────────────────── */
function initGallery() {
  var items   = Array.from(document.querySelectorAll('.gallery-item'));
  var filters = document.querySelectorAll('.gf-btn');
  var lb      = document.getElementById('lightbox');
  var lbImg   = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  var lbPrev  = document.getElementById('lbPrev');
  var lbNext  = document.getElementById('lbNext');

  var visible = items.slice();
  var current = 0;

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.dataset.filter;
      items.forEach(function (item) {
        item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
      });
      visible = items.filter(function (i) { return i.style.display !== 'none'; });
    });
  });

  items.forEach(function (item) {
    item.addEventListener('click', function () {
      current = visible.indexOf(item);
      if (current < 0) return;
      openLB(current);
    });
  });

  function openLB(idx) {
    var src = visible[idx] && visible[idx].style.backgroundImage.replace(/url\(['"]?(.+?)['"]?\)/, '$1');
    if (!src) return;
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    current = idx;
  }
  function closeLB() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose && lbClose.addEventListener('click', closeLB);
  lb      && lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  lbPrev  && lbPrev.addEventListener('click', function () { openLB((current - 1 + visible.length) % visible.length); });
  lbNext  && lbNext.addEventListener('click', function () { openLB((current + 1) % visible.length); });

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLB();
    if (e.key === 'ArrowLeft')   lbPrev && lbPrev.click();
    if (e.key === 'ArrowRight')  lbNext && lbNext.click();
  });
}

/* ── COUNTDOWN ───────────────────────────────────────────────── */
function initCountdown() {
  var container = document.querySelector('[data-date]');
  if (!container) return;
  var target = new Date(container.dataset.date + 'T09:00:00');
  var dEl = document.getElementById('cd1-d');
  var hEl = document.getElementById('cd1-h');
  var mEl = document.getElementById('cd1-m');
  if (!dEl) return;
  function pad(n) { return String(n).padStart(2, '0'); }
  function update() {
    var diff = target - new Date();
    if (diff <= 0) { dEl.textContent = hEl.textContent = mEl.textContent = '00'; return; }
    dEl.textContent = pad(Math.floor(diff / 86400000));
    hEl.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
  }
  update();
  setInterval(update, 60000);
}

/* ── FORMS ───────────────────────────────────────────────────── */
function initForms() {
  var pForm = document.getElementById('prayerForm');
  if (pForm) {
    pForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = pForm.querySelector('#pName').value.trim();
      var req  = pForm.querySelector('#pRequest').value.trim();
      if (!name || !req) return;
      var s = document.getElementById('prayerSuccess');
      if (s) s.style.display = 'block';
      pForm.querySelectorAll('input,textarea,select').forEach(function (el) { el.value = ''; });
      setTimeout(function () { if (s) s.style.display = 'none'; }, 6000);
    });
  }
  var cForm = document.getElementById('contactForm');
  if (cForm) {
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      cForm.querySelectorAll('[required]').forEach(function (inp) { if (!inp.value.trim()) ok = false; });
      if (!ok) return;
      var s = document.getElementById('contactSuccess');
      if (s) s.style.display = 'block';
      cForm.querySelectorAll('input,textarea,select').forEach(function (el) { el.value = ''; });
      setTimeout(function () { if (s) s.style.display = 'none'; }, 6000);
    });
  }
  var nForm = document.getElementById('newsletter');
  if (nForm) {
    nForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = nForm.querySelector('input[type=email]');
      if (inp && inp.value) {
        inp.value = '';
        var btn = nForm.querySelector('button');
        if (btn) { btn.textContent = 'Subscribed ✓'; setTimeout(function () { btn.textContent = 'Subscribe'; }, 3000); }
      }
    });
  }
}

/* ── GIVE AMOUNTS ────────────────────────────────────────────── */
function initGiveAmounts() {
  var btns   = document.querySelectorAll('.amt-btn');
  var custom = document.getElementById('customAmt');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (custom) custom.value = '';
    });
  });
  if (custom) {
    custom.addEventListener('input', function () {
      if (custom.value) btns.forEach(function (b) { b.classList.remove('active'); });
    });
  }
}

/* ── GIVE MODAL (bank transfer details — no payment gateway yet) ─ */
/* Delegated on document so it also catches CMS-rendered give buttons (renderCMSGive). */
function initGiveModal() {
  var modal = document.getElementById('giveModal');
  if (!modal) return;
  var closeBtn  = document.getElementById('giveModalClose');
  var contextEl = document.getElementById('giveModalContext');
  var copyBtn   = document.getElementById('giveCopyBtn');
  var acctNum   = document.getElementById('giveAcctNum');

  function openGiveModal(label) {
    if (contextEl) contextEl.textContent = label || 'Partner With The Vision';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeGiveModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('.js-give-trigger');
    if (!trigger) return;
    e.preventDefault();
    var label = trigger.dataset.give;
    if (!label) {
      var activeAmt = document.querySelector('.amt-btn.active');
      var custom = document.getElementById('customAmt');
      if (custom && custom.value.trim()) {
        label = 'Quick Gift · ₦' + custom.value.trim();
      } else if (activeAmt) {
        label = 'Quick Gift · ' + activeAmt.textContent.trim();
      } else {
        label = 'Quick Gift';
      }
    }
    openGiveModal(label);
  });

  closeBtn && closeBtn.addEventListener('click', closeGiveModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeGiveModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeGiveModal();
  });

  copyBtn && copyBtn.addEventListener('click', function () {
    var text = acctNum ? acctNum.textContent.trim() : '';
    if (!text) return;
    function markCopied() {
      var orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied ✓';
      copyBtn.classList.add('copied');
      setTimeout(function () { copyBtn.textContent = orig; copyBtn.classList.remove('copied'); }, 2000);
    }
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); markCopied(); } catch (err) {}
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markCopied).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
}

/* ── MAGNETIC BUTTONS (subtle luxury effect) ─────────────────── */
var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initMagneticButtons() {
  if (prefersReducedMotion) return;
  var btns = document.querySelectorAll('.btn-gold, .btn-outline');
  btns.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = 'translateX(' + (x * 0.06) + 'px) translateY(' + (y * 0.08 - 2) + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });
}

/* ── RIPPLE ──────────────────────────────────────────────────── */
document.querySelectorAll('.btn-gold').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    if (prefersReducedMotion) return;
    var rect = btn.getBoundingClientRect();
    var ripple = document.createElement('span');
    var size = Math.max(rect.width, rect.height);
    ripple.style.cssText = 'position:absolute;border-radius:50%;width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - rect.left - size/2) + 'px;top:' + (e.clientY - rect.top - size/2) + 'px;background:rgba(255,255,255,.28);transform:scale(0);animation:ripple .65s ease-out;pointer-events:none';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 700);
  });
});
var rippleStyle = document.createElement('style');
rippleStyle.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
document.head.appendChild(rippleStyle);

/* ── SMOOTH SCROLL ───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var navH = 76;
    var top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

/* ── FOOTER YEAR ─────────────────────────────────────────────── */
function setFooterYear() {
  var el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}

/* ════════════════════════════════════════════════════════════════
   CMS CONTENT LOADER
   Reads from localStorage (admin.html) — falls back to static HTML
   ════════════════════════════════════════════════════════════════ */
var CMS_KEYS = {
  sermons:'rrmi_sermons', gallery:'rrmi_gallery',
  testimonials:'rrmi_testimonials', events:'rrmi_events', give:'rrmi_give'
};

function cmsGet(key) {
  try { var d = localStorage.getItem(CMS_KEYS[key]); return d ? JSON.parse(d) : null; }
  catch(e) { return null; }
}

function initCMSContent() {
  renderCMSSermons();
  renderCMSGallery();
  renderCMSTestimonials();
  renderCMSEvents();
  renderCMSGive();
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDateDisplay(s) {
  if (!s) return '';
  try { var d = new Date(s+'T00:00:00'); return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return s; }
}

function isUpcoming(s) { return new Date(s+'T23:59:59') >= new Date(); }

function categoryBadge(cat) {
  var m = {'Special Event':'tag-gold','Youth':'tag-blue','Training':'tag-green','Outreach':'tag-dim'};
  return m[cat] || 'tag-gold';
}

/* Sermons */
function renderCMSSermons() {
  var data = cmsGet('sermons');
  if (!data || !data.length) return;
  var grid = document.getElementById('sermonGrid');
  if (!grid) return;
  grid.innerHTML = data.slice(0,6).map(function(s,i) {
    var thumb = escHtml(s.thumb || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=500&q=70');
    var delay = i===1?' d1':i===2?' d2':'';
    return '<div class="sermon-card reveal' + delay + '">'
      + '<div class="sermon-thumb" style="background-image:url(\'' + thumb + '\')">'
      + '<div class="sermon-thumb-overlay"><button class="play-btn"' + (s.ytUrl?(' onclick="window.open(\'' + escHtml(s.ytUrl) + '\',\'_blank\')"'):'') + ' aria-label="Play"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button></div>'
      + '<span class="sermon-cat">' + escHtml(s.category||'Message') + '</span>'
      + '</div><div class="sermon-body">'
      + '<h3>' + escHtml(s.title) + '</h3>'
      + '<p class="sermon-meta"><span>' + escHtml(s.preacher||'Pastor Itoro Isaac James') + '</span><span>' + escHtml(s.date||'') + '</span><span>' + escHtml(s.duration||'') + '</span></p>'
      + '<div class="sermon-actions"><button class="btn-play-sm"' + (s.ytUrl?(' onclick="window.open(\'' + escHtml(s.ytUrl) + '\',\'_blank\')"'):'') + '><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Play</button>'
      + '<button class="btn-dl" title="Download"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></button>'
      + '</div></div></div>';
  }).join('');
  initScrollReveal();
}

/* Gallery */
function renderCMSGallery() {
  var data = cmsGet('gallery');
  if (!data || !data.length) return;
  var grid = document.getElementById('galleryGrid');
  if (!grid) return;
  var cls = ['tall','','','wide','',''];
  grid.innerHTML = data.slice(0,6).map(function(g,i) {
    return '<div class="gallery-item ' + (cls[i]||'') + ' reveal-scale' + (i?' d'+(i%3+1):'') + '" data-cat="' + escHtml(g.category||'all') + '" style="background-image:url(\'' + escHtml(g.img) + '\')">'
      + '<div class="gallery-overlay"><span>' + escHtml(g.caption||g.category||'') + '</span></div></div>';
  }).join('');
  initGallery();
  initScrollReveal();
}

/* Testimonials */
function renderCMSTestimonials() {
  var data = cmsGet('testimonials');
  if (!data || !data.length) return;
  var track = document.getElementById('testTrack');
  if (!track) return;
  track.innerHTML = data.map(function(t) {
    return '<div class="testimonial-slide">'
      + '<div class="test-stars">' + '\u2605'.repeat(parseInt(t.stars)||5) + '</div>'
      + '<blockquote>&ldquo;' + escHtml(t.text) + '&rdquo;</blockquote>'
      + '<div class="test-author"><div class="test-avatar">' + escHtml((t.name||'?')[0].toUpperCase()) + '</div>'
      + '<div><strong>' + escHtml(t.name) + '</strong><span>' + escHtml(t.role||'Church Member') + (t.tag?' · '+escHtml(t.tag):'') + '</span></div></div>'
      + '</div>';
  }).join('');
  initTestimonials();
}

/* Events */
function renderCMSEvents() {
  var grid = document.getElementById('eventsGrid');
  if (!grid) return;
  var data = cmsGet('events') || [];
  var sorted = data.slice().sort(function(a,b) { return new Date(a.date)-new Date(b.date); });
  var upcoming = sorted.filter(function(e) { return isUpcoming(e.date); }).slice(0,3);
  if (!upcoming.length) {
    grid.style.gridTemplateColumns = '1fr';
    grid.innerHTML = '<div class="events-empty"><div class="events-empty-icon">📅</div>'
      + '<h3>No Upcoming Events Right Now</h3>'
      + '<p>Check back soon, or follow us on social media for the latest updates.</p></div>';
    return;
  }
  grid.style.gridTemplateColumns = upcoming.length>=3?'1.4fr 1fr 1fr':upcoming.length===2?'1fr 1fr':'1fr';
  grid.innerHTML = upcoming.map(function(ev,i) {
    var d = new Date(ev.date+'T00:00:00');
    var mon = d.toLocaleString('en-GB',{month:'short'}).toUpperCase();
    var day = d.getDate();
    var yr  = d.getFullYear();
    var fT  = function(t) { if(!t) return ''; var p=t.split(':'),hr=parseInt(p[0]); return (hr>12?hr-12:hr||12)+':'+p[1]+' '+(hr>=12?'PM':'AM'); };
    var cd  = i===0&&ev.featured ? '<div class="event-countdown" data-date="'+ev.date+'">'
      + '<div class="cd-box"><span class="cd-num" id="cd1-d">--</span><span class="cd-label">Days</span></div>'
      + '<div class="cd-box"><span class="cd-num" id="cd1-h">--</span><span class="cd-label">Hrs</span></div>'
      + '<div class="cd-box"><span class="cd-num" id="cd1-m">--</span><span class="cd-label">Min</span></div>'
      + '</div>' : '';
    return '<div class="event-card' + (ev.featured?' featured':'') + ' reveal' + (i?' d'+i:'') + '">'
      + '<div class="event-date-block"><span class="ev-month">' + mon + '</span><span class="ev-day">' + day + '</span><span class="ev-year">' + yr + '</span></div>'
      + '<div class="event-info">'
      + (ev.featured?'<span class="tag tag-gold">\u2b50 Featured</span>':'<span class="tag '+categoryBadge(ev.category)+'">' + escHtml(ev.category||'Event') + '</span>')
      + '<h3>' + escHtml(ev.title) + '</h3>'
      + '<p>' + escHtml(ev.description||'') + '</p>'
      + '<div class="event-meta">' + (ev.time?'<span>\uD83D\uDD50 '+fT(ev.time)+'</span>':'') + (ev.location?'<span>\uD83D\uDCCD '+escHtml(ev.location)+'</span>':'') + '</div>'
      + '</div>' + cd + '</div>';
  }).join('');
  initCountdown();
  initScrollReveal();
}

/* Give */
function renderCMSGive() {
  var data = cmsGet('give');
  if (!data || !data.length) return;
  var grid = document.getElementById('giveGrid');
  if (!grid) return;
  grid.innerHTML = data.map(function(g,i) {
    return '<div class="give-card' + (i===2?' highlight':'') + ' reveal' + (i?' d'+i:'') + '">'
      + '<div class="give-icon">' + (g.icon||'💝') + '</div>'
      + '<h3>' + escHtml(g.title) + '</h3>'
      + '<p>' + escHtml(g.description) + '</p>'
      + '<button type="button" class="' + (i===2?'btn-gold':'btn-outline') + ' mt-auto js-give-trigger" data-give="' + escHtml(g.title) + '">' + (i===2?'Become a Partner':'Give '+escHtml(g.title)) + '</button>'
      + '</div>';
  }).join('');
  initScrollReveal();
}

/* Flash popup */
(function() {
  if (sessionStorage.getItem('rrmi_flash_shown')) return;
  var data = null;
  try { data = JSON.parse(localStorage.getItem('rrmi_flash_event')); } catch(e) {}
  if (!data || !data.enabled) return;
  if (data.eventId) {
    var linkedEvents = cmsGet('events') || [];
    var linkedEvent = null;
    for (var li = 0; li < linkedEvents.length; li++) { if (linkedEvents[li].id === data.eventId) { linkedEvent = linkedEvents[li]; break; } }
    if (!linkedEvent || !isUpcoming(linkedEvent.date)) return; /* linked event has passed or was deleted — don't show a stale popup */
  }
  var overlay = document.getElementById('flashOverlay');
  var banner  = document.getElementById('flashBanner');
  var badge   = document.getElementById('flashDateBadge');
  var titleEl = document.getElementById('flashTitle');
  var metaEl  = document.getElementById('flashMeta');
  var descEl  = document.getElementById('flashDesc');
  var viewBtn = document.getElementById('flashViewEvent');
  var allBtn  = document.getElementById('flashAllEvents');
  var closeX  = document.getElementById('flashClose');
  var closeBtn= document.getElementById('flashCloseBtn');
  if (!overlay) return;
  if (banner && data.img) { banner.src = data.img; }
  if (badge)   badge.textContent   = data.date || '';
  if (titleEl) titleEl.textContent = data.title || '';
  if (metaEl)  metaEl.textContent  = data.date  || '';
  if (descEl)  descEl.textContent  = data.description || '';
  if (viewBtn) viewBtn.textContent = data.btnViewEvent || 'View Event Details';
  if (allBtn)  allBtn.textContent  = data.btnAllEvents || 'View All Events';
  function closeFlash() {
    overlay.style.animation = 'fadeIn .3s reverse forwards';
    setTimeout(function() { overlay.style.display='none'; }, 320);
    sessionStorage.setItem('rrmi_flash_shown','1');
  }
  closeX   && closeX.addEventListener('click', closeFlash);
  closeBtn && closeBtn.addEventListener('click', closeFlash);
  viewBtn  && viewBtn.addEventListener('click', function() { closeFlash(); setTimeout(function() { var el=document.getElementById('events'); if(el) el.scrollIntoView({behavior:'smooth'}); },350); });
  allBtn   && allBtn.addEventListener('click',  function() { closeFlash(); setTimeout(function() { var el=document.getElementById('events'); if(el) el.scrollIntoView({behavior:'smooth'}); },350); });
  overlay.addEventListener('click', function(e) { if(e.target===overlay) closeFlash(); });
  document.addEventListener('keydown', function(e) { if(e.key==='Escape' && overlay.style.display!=='none') closeFlash(); });
  overlay.style.display = 'flex';
})();

/* Storage event for cross-tab updates */
window.addEventListener('storage', function(e) {
  var keys = Object.values(CMS_KEYS);
  if (keys.indexOf(e.key) >= 0) initCMSContent();
});
