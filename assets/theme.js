/* Theme toggle — shared with React via localStorage key bootcamp.theme */
(function (global) {
  'use strict';

  var KEY = 'bootcamp.theme';

  function getStored() {
    try {
      var t = localStorage.getItem(KEY);
      if (t === 'light' || t === 'dark') return t;
    } catch (e) {}
    return null;
  }

  function getResolved() {
    var stored = getStored();
    if (stored) return stored;
    return global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme, persist) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (theme === 'light' && document.documentElement.dataset.ui !== 'ninja') {
      document.documentElement.style.colorScheme = 'light';
    } else if (theme === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.removeProperty('color-scheme');
    }
    if (persist !== false) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
    document.dispatchEvent(new CustomEvent('bootcamp:theme', { detail: { theme: theme } }));
  }

  function init() {
    var stored = getStored();
    if (stored) {
      apply(stored, false);
      return;
    }
    document.documentElement.classList.toggle('dark', global.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.style.removeProperty('color-scheme');
    document.documentElement.removeAttribute('data-theme');
  }

  function toggle() {
    var next = getResolved() === 'dark' ? 'light' : 'dark';
    apply(next);
    return next;
  }

  function paint(btn) {
    var dark = getResolved() === 'dark';
    btn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    btn.title = dark ? 'Tema claro' : 'Tema oscuro';
    var icon = btn.querySelector('.theme-toggle__icon');
    var label = btn.querySelector('.theme-toggle__label');
    if (icon) icon.textContent = dark ? '\u2600' : '\u263D';
    if (label) label.textContent = dark ? 'Claro' : 'Oscuro';
  }

  function mountToggle() {
    var bar = document.querySelector('.site-head .bar');
    if (!bar || bar.querySelector('.theme-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.innerHTML =
      '<span class="theme-toggle__icon" aria-hidden="true">\u263D</span>' +
      '<span class="theme-toggle__label">Oscuro</span>';
    paint(btn);
    btn.addEventListener('click', function () {
      toggle();
      paint(btn);
    });

    var nav = bar.querySelector('.site-nav');
    if (nav) bar.insertBefore(btn, nav);
    else bar.appendChild(btn);

    document.addEventListener('bootcamp:theme', function () { paint(btn); });
  }

  global.BootcampTheme = { KEY: KEY, getStored: getStored, getResolved: getResolved, apply: apply, init: init, toggle: toggle, mountToggle: mountToggle };
  init();
})();
