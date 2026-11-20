/* ═══════════════════════════════════════════════════════
   RRMI v8 — Main Script
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SEED DATA ─────────────────────────────────────── */
  const SEED = {
    sermons: [],   // published sermons live in content.js
    events: [],        // published events live in content.js
    gallery: [],       // published photos live in content.js
    testimonials: [],  // published testimonies live in content.js
    giveCategories: [
      { id: 1, icon: "🙏", title: "Tithes", desc: "Honor God with the first tenth of your increase." },
      { id: 2, icon: "🌾", title: "Offerings", desc: "Give generously as your heart leads you." },
      { id: 3, icon: "🤝", title: "Partnership", desc: "Partner with our global vision for souls." },
      { id: 4, icon: "🏗️", title: "Building Fund", desc: "Support the expansion of God's house." }
    ]
  };

  function seedData() {
    if (!localStorage.getItem('rrmi_seeded')) {
      localStorage.setItem('rrmi_sermons', JSON.stringify(SEED.sermons));
      localStorage.setItem('rrmi_events', JSON.stringify(SEED.events));
      localStorage.setItem('rrmi_gallery', JSON.stringify(SEED.gallery));
      localStorage.setItem('rrmi_testimonials', JSON.stringify(SEED.testimonials));
      localStorage.setItem('rrmi_give_categories', JSON.stringify(SEED.giveCategories));
      localStorage.setItem('rrmi_seeded', '1');
    }
  }

  function getLS(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  /* ── PUBLISHED CONTENT (content.js) ────────────────── */
  // Sermons, gallery and testimonies come from content.js so every visitor
  // sees them. Items added in the admin panel (saved in that browser only)
  // are appended so the admin can preview them before publishing.
  const PUBLISHED = window.RRMI_CONTENT || {};
  const CONTENT_VERSION = '2026-11-20-v8';
  function clearOldDemoContent() {
    try {
      if (localStorage.getItem('rrmi_content_version') !== CONTENT_VERSION) {
        ['rrmi_sermons', 'rrmi_gallery', 'rrmi_testimonials', 'rrmi_events']
          .forEach(k => localStorage.setItem(k, '[]'));
        localStorage.setItem('rrmi_content_version', CONTENT_VERSION);
      }
    } catch (e) { /* storage blocked: published content still shows */ }
  }
  function getContent(type, lsKey) {
    const pub = Array.isArray(PUBLISHED[type]) ? PUBLISHED[type] : [];
    const local = getLS(lsKey, []);
    return pub.concat(Array.isArray(local) ? local : []);
  }
  const ICONS = {
    play: '<path d="m10 8 6 4-6 4V8z"/><circle cx="12" cy="12" r="10"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>'
  };
  function emptyState(icon, title, text, action) {
    return `<div class="empty-state">
      <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon]}</svg></div>
      <h3 class="empty-title">${title}</h3>
      <p class="empty-text">${text}</p>
      ${action || ''}
    </div>`;
  }

  /* ── FLASH POPUP ───────────────────────────────────── */
  function initFlash() {
    if (sessionStorage.getItem('flash_shown')) return;
    const overlay = document.getElementById('flashOverlay');
    if (!overlay) return;

    // Published announcement (content.js); an admin-panel config in this
    // browser overrides it for preview. Nothing to show = no pop-up.
    const pub = (window.RRMI_CONTENT && window.RRMI_CONTENT.announcement) || {};
    const local = getLS('rrmi_flash_cfg', null);
    const cfg = (local && local.enabled !== false && (local.image || local.title || local.message))
      ? local : (pub.show ? pub : null);
    if (!cfg || !(cfg.image || cfg.title || cfg.message)) return;
    const inner = document.getElementById('flashInner');
    if (inner) {
      inner.innerHTML = `${cfg.image ? `<img src="${esc(cfg.image)}" alt="${esc(cfg.title || 'Announcement')}">` : ''}
        ${(cfg.title || cfg.message || cfg.link) ? `<div class="flash-text">
          ${cfg.title ? `<h2>${esc(cfg.title)}</h2>` : ''}
          ${cfg.message ? `<p>${esc(cfg.message)}</p>` : ''}
          ${cfg.link ? `<a class="btn-primary" href="${esc(cfg.link)}">${esc(cfg.cta || 'Learn more')}</a>` : ''}
        </div>` : ''}`;
    }

    overlay.style.display = 'flex';
    sessionStorage.setItem('flash_shown', '1');

    const closeBtn = overlay.querySelector('.flash-close');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .3s ease';
      setTimeout(() => overlay.remove(), 300);
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeBtn && closeBtn.click();
    });
  }

  /* ── NAVBAR ────────────────────────────────────────── */
  function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Hamburger
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-controls', 'navLinks');
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        const open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(open));
      });
      navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }));
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[href^="#"]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ── HERO SLIDER ───────────────────────────────────── */
  function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hdot');
    if (!slides.length) return;

    let cur = 0;
    function goTo(n) {
      slides[cur].classList.remove('active');
      dots[cur] && dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur] && dots[cur].classList.add('active');
    }
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    setInterval(() => goTo(cur + 1), 6000);
  }

  /* ── HERO CANVAS PARTICLES ─────────────────────────── */
  function initCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], raf;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.r = Math.random() * 1.5 + .3;
        this.alpha = Math.random() * .5 + .1;
        this.speed = Math.random() * .3 + .05;
        this.dx = (Math.random() - .5) * .3;
        this.dy = -this.speed;
      }
      update() {
        this.x += this.dx; this.y += this.dy;
        this.alpha -= .0008;
        if (this.y < 0 || this.alpha <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227,166,59,${this.alpha})`;
        ctx.fill();
      }
    }
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── SCROLL REVEAL ─────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-hero');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ── COUNTER ANIMATIONS ────────────────────────────── */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const step = target / (duration / 16);
        let cur = 0;
        const timer = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.floor(cur).toLocaleString();
          if (cur >= target) clearInterval(timer);
        }, 16);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ── RENDER SERMONS ────────────────────────────────── */
  function renderSermons() {
    const grid = document.getElementById('sermonsGrid');
    if (!grid) return;
    const sermons = getContent('sermons', 'rrmi_sermons')
      .slice().sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
    grid.classList.toggle('is-empty', !sermons.length);
    if (!sermons.length) {
      grid.innerHTML = emptyState('play', 'New sermons are on the way',
        'Fresh messages will be posted here soon. Meanwhile, catch our latest services on YouTube.');
      return;
    }
    grid.innerHTML = sermons.slice(0, 6).map(s => {
      const d = new Date(s.date);
      const dateStr = isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const thumb = s.thumbnail || (s.youtube ? `https://img.youtube.com/vi/${encodeURIComponent(s.youtube)}/hqdefault.jpg` : '');
      return `<div class="sermon-card">
        <div class="sermon-thumb">
          ${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
          <div class="sermon-play">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="sermon-body">
          <div class="sermon-meta">
            <span>${esc(s.category)}</span>
            <span class="dot"></span>
            <span>${dateStr}</span>
          </div>
          <h3 class="sermon-title">${esc(s.title)}</h3>
          <div class="sermon-actions">
            ${s.youtube ? `<a href="https://youtube.com/watch?v=${esc(s.youtube)}" target="_blank" rel="noopener" class="sermon-btn watch">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>
              Watch
            </a>` : ''}
            ${s.audio ? `<a href="${esc(s.audio)}" class="sermon-btn download" download>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              Audio
            </a>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');
    initReveal();
  }

  /* ── RENDER EVENTS ─────────────────────────────────── */
  function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const events = getContent('events', 'rrmi_events')
      .filter(ev => { const d = new Date(ev.date + 'T00:00:00'); return !isNaN(d) && d >= today; });
    const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    grid.classList.toggle('is-empty', !sorted.length);
    if (!sorted.length) {
      grid.innerHTML = emptyState('calendar', 'No events announced yet',
        'Upcoming programmes, conventions and special services will be listed here. Our weekly services run as usual.');
      return;
    }

    grid.innerHTML = sorted.slice(0, 4).map((ev, i) => {
      const d = new Date(ev.date + 'T00:00:00');
      const day = d.getDate();
      const mon = d.toLocaleString('en', { month: 'short' });
      const featured = !!ev.featured;
      return `<div class="event-card ${featured ? 'featured' : ''}">
        <div class="event-date-col">
          <span class="ev-day">${day}</span>
          <span class="ev-mon">${mon}</span>
        </div>
        <div class="event-body">
          <span class="event-tag">${esc(ev.category || 'Church')}</span>
          <h3 class="event-title">${esc(ev.title)}</h3>
          <p class="event-meta">
            <span>${esc(ev.time || 'Time to be announced')}</span>
            ${ev.location ? `<span>${esc(ev.location)}</span>` : ''}
          </p>
          ${featured ? `<div class="event-countdown" data-date="${esc(ev.date)}"></div>` : ''}
        </div>
      </div>`;
    }).join('');
    initCountdowns();
    initReveal();
  }

  /* ── COUNTDOWN ─────────────────────────────────────── */
  function initCountdowns() {
    document.querySelectorAll('[data-date]').forEach(el => {
      function tick() {
        const target = new Date(el.dataset.date + 'T00:00:00');
        const now = new Date();
        let diff = target - now;
        if (diff <= 0) { el.innerHTML = '<span class="cd-today">Happening today</span>'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML = [['days', d], ['hours', h], ['minutes', m]].map(([l, v]) =>
          `<div class="cd-item"><span class="cd-num">${v}</span><span class="cd-label">${l}</span></div>`
        ).join('');
      }
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ── RENDER GIVE CARDS ─────────────────────────────── */
  function renderGiveCards() {
    const wrap = document.getElementById('giveCards');
    if (!wrap) return;
    const cats = getLS('rrmi_give_categories', SEED.giveCategories);
    wrap.innerHTML = cats.map((c, i) => `
      <div class="give-card ${i === 0 ? 'active' : ''}" onclick="this.closest('.give-cards').querySelectorAll('.give-card').forEach(x=>x.classList.remove('active'));this.classList.add('active')">
        <span class="give-icon">${c.icon}</span>
        <div class="give-card-title">${esc(c.title)}</div>
        <div class="give-card-desc">${esc(c.desc)}</div>
      </div>`).join('');
  }

  /* ── RENDER TESTIMONIALS ───────────────────────────── */
  function renderTestimonials() {
    const slider = document.getElementById('testiSlider');
    const dotsWrap = document.getElementById('testiDots');
    if (!slider) return;
    const testimonials = getContent('testimonials', 'rrmi_testimonials');
    if (!testimonials.length) {
      slider.classList.add('is-empty');
      slider.innerHTML = emptyState('quote', 'Testimonies coming soon',
        'Has God done something wonderful in your life? We would love to hear it and, with your permission, share it here.',
        '<a href="#contact" class="btn-primary sm-empty">Share your testimony</a>');
      if (dotsWrap) dotsWrap.innerHTML = '';
      return;
    }
    slider.classList.remove('is-empty');

    slider.innerHTML = testimonials.map((t, i) => `
      <div class="testi-slide ${i === 0 ? 'active' : ''}">
        <div class="testi-card">
          <div class="testi-stars">${'★'.repeat(t.rating || 5)}</div>
          <p class="testi-text">"${esc(t.text)}"</p>
          <div class="testi-author">
            <div class="testi-avatar">${esc(t.initials || t.name.slice(0,2).toUpperCase())}</div>
            <div class="testi-info">
              <strong>${esc(t.name)}</strong>
              <span>${esc(t.location || '')}</span>
            </div>
          </div>
        </div>
      </div>`).join('');

    if (dotsWrap) dotsWrap.innerHTML = testimonials.map((_, i) =>
      `<button class="testi-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></button>`
    ).join('');

    let cur = 0;
    function goTo(n) {
      const slides = slider.querySelectorAll('.testi-slide');
      const dots = dotsWrap ? dotsWrap.querySelectorAll('.testi-dot') : [];
      slides[cur] && slides[cur].classList.remove('active');
      dots[cur] && dots[cur].classList.remove('active');
      cur = (n + testimonials.length) % testimonials.length;
      slides[cur] && slides[cur].classList.add('active');
      dots[cur] && dots[cur].classList.add('active');
    }
    dotsWrap && dotsWrap.addEventListener('click', e => {
      const btn = e.target.closest('[data-i]');
      if (btn) goTo(parseInt(btn.dataset.i));
    });
    const auto = setInterval(() => goTo(cur + 1), 5500);
    slider.addEventListener('mouseenter', () => clearInterval(auto));
  }

  /* ── GALLERY FILTER + LIGHTBOX ─────────────────────── */
  function initGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    const items = getContent('gallery', 'rrmi_gallery');
    const filters = document.querySelector('.gallery-filters');
    if (!items.length) {
      if (filters) filters.hidden = true;
      grid.classList.add('is-empty');
      grid.innerHTML = emptyState('camera', 'Photos coming soon',
        'Pictures from our services, events and outreach will appear here shortly.');
      return;
    }
    if (filters) filters.hidden = false;
    grid.classList.remove('is-empty');

    function render(filter = 'all') {
      const f = String(filter || 'all').toLowerCase();
      const filtered = f === 'all' ? items : items.filter(i => String(i.category || '').toLowerCase() === f);
      if (!filtered.length) {
        grid.innerHTML = `<p class="empty-inline">No photos in this category yet.</p>`;
        return;
      }
      grid.innerHTML = filtered.map((item, idx) => `
        <div class="gallery-item" data-idx="${idx}" data-category="${esc(item.category)}">
          ${item.src
            ? `<img src="${esc(item.src)}" alt="${esc(item.title)}" loading="lazy">`
            : `<div class="gallery-placeholder">✝</div>`
          }
          <div class="gi-overlay">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </div>
        </div>`).join('');
      grid.querySelectorAll('.gallery-item').forEach(el => {
        el.addEventListener('click', () => openLightbox(filtered, parseInt(el.dataset.idx)));
      });
    }
    render();

    document.querySelectorAll('.gf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.filter);
      });
    });

    // Lightbox
    let lbIdx = 0;
    let lbItems = items;
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const lbImg = lb.querySelector('.lb-img-wrap');
    const lbCap = lb.querySelector('.lb-caption');

    function openLightbox(list, idx) {
      lbItems = list; lbIdx = idx;
      showLbItem();
      lb.style.display = 'flex';
    }
    function showLbItem() {
      const item = lbItems[lbIdx];
      if (!item) return;
      lbImg.innerHTML = item.src
        ? `<img src="${esc(item.src)}" alt="${esc(item.title)}">`
        : `<div style="width:400px;height:400px;display:flex;align-items:center;justify-content:center;background:#18174D;border-radius:12px;color:#E3A63B;font-size:6rem">✝</div>`;
      if (lbCap) lbCap.textContent = item.title || '';
    }
    lb.querySelector('.lb-close').addEventListener('click', () => lb.style.display = 'none');
    lb.querySelector('.lb-prev').addEventListener('click', () => { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; showLbItem(); });
    lb.querySelector('.lb-next').addEventListener('click', () => { lbIdx = (lbIdx + 1) % lbItems.length; showLbItem(); });
    lb.addEventListener('click', e => { if (e.target === lb) lb.style.display = 'none'; });
    document.addEventListener('keydown', e => {
      if (lb.style.display === 'none') return;
      if (e.key === 'ArrowLeft') { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; showLbItem(); }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbItems.length; showLbItem(); }
      if (e.key === 'Escape') lb.style.display = 'none';
    });
  }

  /* ── FORMS ─────────────────────────────────────────── */
  const CHURCH_WHATSAPP = '2348030949380';
  const CHURCH_EMAIL = 'redemptionrevivalministryintl@gmail.com';
  function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function showSuccess(form) {
    const ok = form.querySelector('.form-success');
    if (ok) { ok.style.display = 'block'; setTimeout(() => { ok.style.display = 'none'; }, 8000); }
  }
  function initContactForms() {
    const prayer = document.getElementById('prayerForm');
    if (prayer) prayer.addEventListener('submit', e => {
      e.preventDefault();
      const lines = ['Prayer request from the RRMI website', '',
        'Name: ' + val('prayerName')];
      if (val('prayerPhone')) lines.push('Phone: ' + val('prayerPhone'));
      if (val('prayerEmail')) lines.push('Email: ' + val('prayerEmail'));
      if (val('prayerCategory')) lines.push('Category: ' + val('prayerCategory'));
      const priv = document.getElementById('prayerPrivate');
      if (priv && priv.checked) lines.push('Please keep this private (pastoral team only).');
      lines.push('', val('prayerRequest'));
      window.open('https://wa.me/' + CHURCH_WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      showSuccess(prayer); prayer.reset();
    });
    const contact = document.getElementById('contactForm');
    if (contact) contact.addEventListener('submit', e => {
      e.preventDefault();
      const subject = val('cSubject') || 'Message from the RRMI website';
      const body = val('cMessage') + '\n\n' + val('cName') + '\n' + val('cEmail');
      window.location.href = 'mailto:' + CHURCH_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      showSuccess(contact); contact.reset();
    });
    const news = document.getElementById('newsletterForm');
    if (news) news.addEventListener('submit', e => {
      e.preventDefault();
      const email = (news.querySelector('input[type="email"]') || {}).value || '';
      window.location.href = 'mailto:' + CHURCH_EMAIL + '?subject=' + encodeURIComponent('Please add me to the RRMI mailing list') +
        '&body=' + encodeURIComponent('Please add ' + email + ' to the RRMI mailing list for devotionals, sermon updates and event news.');
      news.reset();
    });
  }

  /* ── GIVING DETAILS (content.js) ───────────────────── */
  function initGiving() {
    const g = (window.RRMI_CONTENT && window.RRMI_CONTENT.giving) || {};
    const box = document.getElementById('bankDetails');
    const btn = document.getElementById('copyAccountBtn');
    if (!box || !g.accountNumber) return;
    box.innerHTML = `<dl class="bank-dl">
        ${g.bankName ? `<div><dt>Bank</dt><dd>${esc(g.bankName)}</dd></div>` : ''}
        ${g.accountName ? `<div><dt>Account name</dt><dd>${esc(g.accountName)}</dd></div>` : ''}
        <div><dt>Account number</dt><dd class="acct-no">${esc(g.accountNumber)}</dd></div>
      </dl>`;
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        const done = () => { btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy account number'; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(g.accountNumber).then(done, () => {});
      });
    }
  }

  function initForms() {
    document.querySelectorAll('form[data-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const type = form.dataset.form;
        const data = Object.fromEntries(new FormData(form));
        const key = `rrmi_${type}_submissions`;
        const arr = getLS(key, []);
        arr.push({ ...data, ts: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(arr));
        form.reset();
        const success = form.querySelector('.form-success');
        if (success) {
          success.style.display = 'block';
          setTimeout(() => success.style.display = 'none', 4000);
        }
      });
    });

    // Newsletter form
    const nlForm = document.getElementById('newsletterForm');
    if (nlForm) {
      nlForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = nlForm.querySelector('input[type="email"]').value;
        const arr = getLS('rrmi_newsletter', []);
        if (!arr.includes(email)) {
          arr.push(email);
          localStorage.setItem('rrmi_newsletter', JSON.stringify(arr));
        }
        nlForm.querySelector('input').value = '';
        const btn = nlForm.querySelector('button');
        const orig = btn.textContent;
        btn.textContent = '✓ Subscribed!';
        setTimeout(() => btn.textContent = orig, 3000);
      });
    }
  }

  /* ── LIVE STREAM STATUS ────────────────────────────── */
  function initLiveStream() {
    const cfg = getLS('rrmi_live_cfg', null);
    if (cfg && cfg.youtube_live) {
      const iframe = document.getElementById('youtubePlayer');
      if (iframe) iframe.src = `https://www.youtube.com/embed/${cfg.youtube_live}?autoplay=0&rel=0`;
    }
  }

  /* ── SCROLL CUE ────────────────────────────────────── */
  function initScrollCue() {
    const cue = document.querySelector('.hero-scroll-cue');
    if (cue) cue.addEventListener('click', () => {
      document.getElementById('about') && document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── GIVE SECTION ──────────────────────────────────── */
  function initGive() {
    renderGiveCards();
    const giveBtn = document.getElementById('giveNowBtn');
    if (giveBtn) {
      giveBtn.addEventListener('click', () => {
        const active = document.querySelector('.give-card.active .give-card-title');
        const cat = active ? active.textContent : 'Offering';
        alert(`Thank you for your desire to give ${cat}!\n\nPlease use the bank details below or contact us directly.\n\nAcct Name: Redemption Revival Ministries Int'l\nBank: First Bank\nAcct No: 3100584737\n\nGod bless you!`);
      });
    }
  }

  /* ── SMOOTH SCROLL for anchor links ────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── HELPER ─────────────────────────────────────────── */
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── INIT ───────────────────────────────────────────── */
  function init() {
    seedData();
    clearOldDemoContent();
    initFlash();
    initNavbar();
    initHeroSlider();
    initCanvas();
    initScrollCue();
    renderSermons();
    renderEvents();
    renderTestimonials();
    initGallery();
    initGive();
    initForms();
    initContactForms();
    initGiving();
    initLiveStream();
    initReveal();
    initCounters();
    initSmoothScroll();
  }

  // index.html buttons also carry inline onclick="filterGallery()/closeLightbox()/lbNav()";
  // the real handlers are attached above, these stubs just stop console errors.
  window.filterGallery = window.filterGallery || function () {};
  window.toggleMenu = window.toggleMenu || function () {};
  window.closeFlash = window.closeFlash || function () {};
  window.closeLightbox = window.closeLightbox || function () {};
  window.lbNav = window.lbNav || function () {};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
