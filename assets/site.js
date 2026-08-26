/* ==========================================================================
   THE LOCAL-FIRST AI SYSTEMS MASTERCLASS — SITE JS
   Cero dependencias. Tres responsabilidades:
   1) Progreso persistente (localStorage)
   2) Chrome del sitio (nav activa, "continuar", copiar código, fullscreen)
   3) TOC activo por IntersectionObserver
   No toca nunca el contenido de los slides (iframes aislados).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1 · PROGRESO PERSISTENTE --------------------------------- */
  const KEY = (id) => 'bootcamp.progress.' + id;

  const Progress = {
    get(classId) {
      try { return JSON.parse(localStorage.getItem(KEY(classId))) || {}; }
      catch { return {}; }
    },
    set(classId, data) {
      try { localStorage.setItem(KEY(classId), JSON.stringify(data)); } catch {}
    },
    toggle(classId, item, on) {
      const d = this.get(classId);
      d[item] = on ? true : false;
      this.set(classId, d);
      document.dispatchEvent(new CustomEvent('bootcamp:progress', {
        detail: { classId, data: d }
      }));
    },
    pct(classId) {
      const d = this.get(classId);
      const vals = Object.values(d).filter(v => typeof v === 'boolean');
      if (!vals.length) return 0;
      return Math.round(vals.filter(Boolean).length / vals.length * 100);
    }
  };
  window.BootcampProgress = Progress;

  function hydrateCheckboxes() {
    const wrap = document.querySelector('[data-progress-class]');
    if (!wrap) return;
    const classId = wrap.getAttribute('data-progress-class');
    const state = Progress.get(classId);
    wrap.querySelectorAll('input[type="checkbox"][data-item]').forEach(cb => {
      cb.checked = !!state[cb.dataset.item];
      cb.addEventListener('change', () => Progress.toggle(classId, cb.dataset.item, cb.checked));
    });
    // Anillo de progreso de esta clase
    const ring = document.querySelector('[data-ring="' + classId + '"]');
    if (ring) {
      const paint = () => {
        const p = Progress.pct(classId);
        ring.style.setProperty('--pct', p);
        const label = ring.querySelector('i');
        if (label) label.textContent = p + '%';
      };
      paint();
      document.addEventListener('bootcamp:progress', paint);
    }
  }

  /* ---------- 2a · NAV ACTIVA ------------------------------------------ */
  function markCurrentNav() {
    // Normaliza: URLs de directorio (".../class-01.../") no deben caer en "index.html"
    let path = location.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
    if (!path.endsWith('.html') && path !== '') path += '/';   // enlaces de directorio
    document.querySelectorAll('.site-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path !== 'index.html' && href !== 'index.html' && location.pathname.includes(href.replace('.html', '').replace(/\/$/, '')))) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- 2b · CONTINUAR DONDE QUEDASTE ---------------------------- */
  function rememberVisit() {
    const main = document.querySelector('[data-class-page]');
    if (main) {
      try { localStorage.setItem('bootcamp.lastVisited', location.href); } catch {}
    }
    const cont = document.querySelector('[data-continue]');
    if (cont) {
      try {
        const last = localStorage.getItem('bootcamp.lastVisited');
        if (last && !last.endsWith('index.html')) {
          cont.setAttribute('href', last);
          const label = cont.querySelector('[data-continue-label]');
          if (label) label.textContent = 'Continuar donde quedaste →';
          else cont.textContent = 'Continuar donde quedaste →';
        }
      } catch {}
    }
  }

  /* ---------- 2c · COPIAR CÓDIGO --------------------------------------- */
  function addCopyButtons() {
    document.querySelectorAll('pre.codebox').forEach(pre => {
      if (pre.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copiar';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        try {
          await navigator.clipboard.writeText(code ? code.innerText : pre.innerText);
          btn.textContent = '¡Copiado!';
        } catch {
          btn.textContent = 'Ctrl+C';
        }
        setTimeout(() => { btn.textContent = 'Copiar'; }, 1600);
      });
      pre.appendChild(btn);
    });
  }

  /* ---------- 2d · SLIDES CARD (preview + expandir) ---------------------- */
  function bindSlidesCards() {
    document.querySelectorAll('[data-slides-card]').forEach((card) => {
      if (card.dataset.slidesBound) return;
      card.dataset.slidesBound = '1';

      const src = card.getAttribute('data-slides-src');
      const title = card.getAttribute('data-slides-title') || 'Presentación';
      const total = parseInt(card.getAttribute('data-slides-total') || '0', 10);
      const preview = card.querySelector('[data-slides-preview]');
      const deck = card.querySelector('[data-slides-deck]');
      const toolbar = card.querySelector('[data-slides-toolbar]');
      const iframe = card.querySelector('[data-slides-iframe]');
      const loading = card.querySelector('[data-slides-loading]');
      const counter = card.querySelector('[data-slides-counter]');
      const btnExpand = card.querySelector('[data-slides-expand]');
      const btnCollapse = card.querySelector('[data-slides-collapse]');
      const btnPrev = card.querySelector('[data-slides-prev]');
      const btnNext = card.querySelector('[data-slides-next]');
      const btnFs = card.querySelector('[data-slides-fullscreen]');
      let ready = false;
      let slide = { current: 0, total: total || 0 };

      const paintCounter = () => {
        if (!counter) return;
        counter.textContent = slide.total > 0
          ? slide.current + ' / ' + slide.total
          : (total ? '— / ' + total : '— / —');
      };
      paintCounter();

      const post = (action) => {
        iframe?.contentWindow?.postMessage({ type: 'qvac-slides', action }, location.origin);
      };

      const onMessage = (event) => {
        if (event.origin !== location.origin) return;
        const data = event.data;
        if (!data || data.type !== 'qvac-slides') return;
        if (typeof data.current === 'number' && typeof data.total === 'number') {
          slide = { current: data.current, total: data.total };
          ready = true;
          paintCounter();
          if (btnPrev) btnPrev.disabled = slide.current <= 1;
          if (btnNext) btnNext.disabled = slide.current >= slide.total;
        }
      };
      window.addEventListener('message', onMessage);

      const expand = () => {
        card.classList.add('slides-card--expanded');
        preview?.setAttribute('hidden', '');
        deck?.removeAttribute('hidden');
        toolbar?.removeAttribute('hidden');
        btnExpand?.setAttribute('aria-expanded', 'true');
        if (iframe && !iframe.getAttribute('src')) {
          iframe.setAttribute('src', src);
          iframe.setAttribute('title', title);
          loading?.removeAttribute('hidden');
          iframe.addEventListener('load', () => loading?.setAttribute('hidden', ''), { once: true });
        }
      };

      const collapse = () => {
        card.classList.remove('slides-card--expanded');
        preview?.removeAttribute('hidden');
        deck?.setAttribute('hidden', '');
        toolbar?.setAttribute('hidden', '');
        btnExpand?.setAttribute('aria-expanded', 'false');
        if (document.fullscreenElement === deck) document.exitFullscreen?.();
      };

      btnExpand?.addEventListener('click', expand);
      btnCollapse?.addEventListener('click', collapse);
      btnPrev?.addEventListener('click', () => post('prev'));
      btnNext?.addEventListener('click', () => post('next'));
      btnFs?.addEventListener('click', () => {
        if (!deck) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else deck.requestFullscreen?.();
      });
    });
  }

  /* ---------- 2d · FULLSCREEN DEL EMBED DE SLIDES (legacy) --------------- */
  function bindFullscreen() {
    const btn = document.querySelector('[data-fullscreen-target]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.getAttribute('data-fullscreen-target'));
      if (!target) return;
      if (document.fullscreenElement) document.exitFullscreen();
      else target.requestFullscreen?.();
    });
  }

  /* ---------- 3 · TOC ACTIVO + RAIL ------------------------------------ */
  function paintLessonRail(classId) {
    const ring = document.querySelector('[data-ring-rail="' + classId + '"]');
    if (!ring) return;
    const paint = () => {
      const p = Progress.pct(classId);
      ring.style.setProperty('--pct', p);
      const label = ring.querySelector('i');
      if (label) label.textContent = p + '%';
    };
    paint();
    document.addEventListener('bootcamp:progress', paint);
  }

  function bindTocSpy() {
    const toc = document.querySelector('.lesson-toc');
    if (!toc) return;
    const links = Array.from(toc.querySelectorAll('a[href^="#"]'));
    const currentEl = document.querySelector('[data-toc-current]');
    const targets = links
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) return;

    const visible = new Set();

    function activate(id) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      const activeLink = links.find(a => a.classList.contains('active'));
      if (activeLink && currentEl) currentEl.textContent = activeLink.textContent;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id));
      const first = targets.find(t => visible.has(t.id));
      if (first) activate(first.id);
    }, { rootMargin: '-12% 0px -65% 0px' });
    targets.forEach(t => io.observe(t));

    if (location.hash) {
      const id = location.hash.slice(1);
      if (document.getElementById(id)) activate(id);
    }
  }

  /* ---------- 2e · TEMA CLARO/OSCURO ----------------------------------- */
  function mountThemeToggle() {
    if (window.BootcampTheme) window.BootcampTheme.mountToggle();
  }

  /* ---------- INIT ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    mountThemeToggle();
    hydrateCheckboxes();
    markCurrentNav();
    rememberVisit();
    addCopyButtons();
    bindSlidesCards();
    bindFullscreen();
    bindTocSpy();
    const lessonClass = document.body.getAttribute('data-lesson-class');
    if (lessonClass) paintLessonRail(lessonClass);
  });
})();
