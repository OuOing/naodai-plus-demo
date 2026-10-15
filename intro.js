/* Optional, presentation-only entry greeting. The application never depends on it. */
(function () {
  'use strict';

  if (window.__naodaiEntryVisitV1) return;
  window.__naodaiEntryVisitV1 = true;

  var VISIT_KEY = 'naodai-entry-visit-v1';
  var SESSION_KEY = 'naodai-entry-session-v1';
  var ABSENCE_MS = 7 * 24 * 60 * 60 * 1000;
  var MAX_DURATION_MS = 900;
  var ACTIVITY_STAMP_MS = 60 * 60 * 1000;
  var lastStampedAt = 0;
  var overlay = null;
  var timeout = null;
  var cleanups = [];
  var motion = null;
  var local = null;
  var session = null;
  var storageReady = false;
  var wasVisible = document.visibilityState === 'visible';

  function dismiss() {
    if (timeout !== null) window.clearTimeout(timeout);
    timeout = null;
    cleanups.splice(0).forEach(function (remove) { try { remove(); } catch (_) {} });
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  function listen(target, type, callback, options) {
    target.addEventListener(type, callback, options);
    cleanups.push(function () { target.removeEventListener(type, callback, options); });
  }

  function stamp() {
    if (!storageReady) return;
    try {
      var visible = document.visibilityState === 'visible';
      if (!visible && !wasVisible) return;
      wasVisible = visible;
      if (window.ReaderTools && window.ReaderTools.storageChoice &&
          window.ReaderTools.storageChoice() === 'session') return;
      var time = String(Date.now());
      local.setItem(VISIT_KEY, time);
      session.setItem(SESSION_KEY, time);
      lastStampedAt = Number(time);
    } catch (_) { storageReady = false; }
  }

  function stampActivity() {
    if (Date.now() - lastStampedAt >= ACTIVITY_STAMP_MS) stamp();
  }

  function stale(value, now) {
    if (value === null) return true;
    // Corrupt, future, or clock-skewed timestamps conservatively skip the greeting.
    if (!/^\d{1,16}$/.test(value)) return false;
    var time = Number(value);
    return Number.isSafeInteger(time) && time > 0 && now >= time && now - time >= ABSENCE_MS;
  }

  function navigationType() {
    try {
      var entries = window.performance.getEntriesByType('navigation');
      if (entries[0]) return entries[0].type;
      var legacy = window.performance.navigation;
      if (legacy) return legacy.type === 0 ? 'navigate' : 'other';
    } catch (_) {}
    return 'unknown';
  }

  function tooLate() {
    try {
      // This mark is set immediately after the existing app.js script in index.html.
      // Header paint and a slow initial download do not count as viewing the page.
      var marks = window.performance.getEntriesByName('naodai-app-ready', 'mark');
      if (!marks.length) return true;
      var age = window.performance.now() - marks[marks.length - 1].startTime;
      return !Number.isFinite(age) || age < 0 || age > 150;
    } catch (_) { return true; }
  }

  try {
    // Respect an explicit session-only choice; do not create persistent UI metadata.
    if (window.ReaderTools && window.ReaderTools.storageChoice &&
        window.ReaderTools.storageChoice() === 'session') return;
    if (document.prerendering) return;

    var now = Date.now();
    local = window.localStorage;
    session = window.sessionStorage;
    var previousVisit = local.getItem(VISIT_KEY);
    var previousSession = session.getItem(SESSION_KEY);
    var eligible = stale(previousVisit, now) && stale(previousSession, now);

    // Reading and writing both stores must work. If either is blocked, skip quietly.
    // The shared visit timestamp suppresses normal new-tab repeats; session storage
    // also suppresses duplicate tabs whose opener's session data was copied.
    if (document.visibilityState === 'visible') {
      local.setItem(VISIT_KEY, String(now));
      session.setItem(SESSION_KEY, String(now));
      lastStampedAt = now;
    } else {
      eligible = false;
    }
    storageReady = true;

    // Last *use*, not last greeting: leaving a long-open tab counts as a visit.
    // These lightweight lifetime listeners only update presentation metadata.
    window.addEventListener('pagehide', stamp);
    window.addEventListener('hashchange', stamp);
    document.addEventListener('visibilitychange', stamp);
    // A long-open, continuously visible tab may stay on one article for days.
    // Count real use, with at most one storage write per hour from these events.
    document.addEventListener('pointerdown', stampActivity, { passive: true });
    document.addEventListener('keydown', stampActivity, { passive: true });

    if (!eligible || navigationType() !== 'navigate' || document.wasDiscarded ||
        document.visibilityState !== 'visible' || tooLate()) return;
    // Only arrival/landing surfaces. Every reading, vocabulary, and other deep link skips.
    if (!/^(?:#(?:english|subjects)?)?$/.test(window.location.hash)) return;
    if (!window.matchMedia) return;
    motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    var app = document.getElementById('app');
    if (!app || !app.firstElementChild) return;
    if (document.activeElement && document.activeElement !== document.body &&
        document.activeElement !== document.documentElement) return;

    overlay = document.createElement('div');
    overlay.id = 'naodai-entry-intro';
    overlay.setAttribute('aria-hidden', 'true');
    // Keep the node invisible even if intro.css is missing, late, or disabled.
    overlay.style.setProperty('visibility', 'hidden', 'important');
    overlay.style.setProperty('pointer-events', 'none', 'important');
    var lockup = document.createElement('div');
    lockup.className = 'nd-entry-lockup';
    var brand = document.createElement('span');
    brand.className = 'nd-entry-name';
    brand.textContent = '脑袋加一';
    var plus = document.createElement('span');
    plus.className = 'nd-entry-plus';
    plus.textContent = '+1';
    lockup.appendChild(brand);
    lockup.appendChild(plus);
    overlay.appendChild(lockup);
    document.body.appendChild(overlay);

    var style = window.getComputedStyle(overlay);
    if (style.getPropertyValue('--naodai-entry-ready').trim() !== '1' ||
        style.animationName !== 'nd-entry-veil' || style.display === 'none') {
      dismiss();
      return;
    }

    var passiveCapture = { capture: true, passive: true };
    ['pointerdown', 'mousedown', 'touchstart', 'click', 'keydown', 'wheel', 'input', 'focusin']
      .forEach(function (type) { listen(document, type, dismiss, passiveCapture); });
    ['hashchange', 'popstate', 'pagehide', 'scroll']
      .forEach(function (type) { listen(window, type, dismiss, passiveCapture); });
    listen(document, 'visibilitychange', dismiss, passiveCapture);
    listen(overlay, 'animationend', function (event) {
      if (event.target === overlay && event.animationName === 'nd-entry-veil') dismiss();
    });
    listen(overlay, 'animationcancel', function (event) {
      if (event.target === overlay) dismiss();
    });
    var changedMotion = function () { if (motion.matches) dismiss(); };
    if (motion.addEventListener) listen(motion, 'change', changedMotion);
    else if (motion.addListener) {
      motion.addListener(changedMotion);
      cleanups.push(function () { motion.removeListener(changedMotion); });
    } else {
      dismiss();
      return;
    }
    // The CSS also ends hidden. Either mechanism alone leaves the live page usable.
    timeout = window.setTimeout(dismiss, MAX_DURATION_MS);
    overlay.style.removeProperty('visibility');
  } catch (_) {
    // Decorative failure must never affect the app, navigation, focus, or learning data.
    dismiss();
  }
}());
