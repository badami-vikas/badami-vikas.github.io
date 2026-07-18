/* Zazoo companions + site interactions (vanilla port of assets/zazoo-characters.jsx
   from the Zazoo design-system project). Exposes window.Zazoo. */
(function () {
  'use strict';

  // ── Character art ─────────────────────────────────────────
  var EGG = 'M60 14 C32 14 19 48 19 82 C19 114 36 132 60 132 C84 132 101 114 101 82 C101 48 88 14 60 14 Z';
  var SUIT = '#2c4266', SHIRT = '#fffdf8', TIE = '#14555a', INK = '#22303a';

  var VARIANTS = {
    aeva: { body: '#a3c6e0', dark: '#7ba8c9', antenna: 'pom', acc: 'glasses' },
    pip:  { body: '#abd4ba', dark: '#83b697', antenna: 'double', acc: 'none' },
    sol:  { body: '#f2c5a4', dark: '#dba379', antenna: 'curl', acc: 'none' },
    mira: { body: '#c9b6e4', dark: '#a98fd0', antenna: 'tuft', acc: 'none' },
    odo:  { body: '#8fc6c2', dark: '#69a7a3', antenna: 'fin', acc: 'headphones' },
    nova: { body: '#f0d494', dark: '#d4b366', antenna: 'pom', acc: 'none' }
  };

  var ZAZOOS = [
    { id: 'aeva', name: 'Aeva', role: 'Chief of staff', spot: 'var(--mist-100)',
      powers: ['Protects your attention', 'Coordinates the moving pieces', 'Keeps promises from slipping'] },
    { id: 'pip', name: 'Pip', role: 'Engineering', spot: 'var(--sage-100)',
      powers: ['Keeps projects aligned', 'Surfaces blockers', 'Coordinates releases'] },
    { id: 'sol', name: 'Sol', role: 'Sales', spot: 'var(--coral-100)',
      powers: ['Prepares meetings', 'Tracks deals', 'Follows up automatically'] },
    { id: 'mira', name: 'Mira', role: 'Operations', spot: 'var(--heather-100)',
      powers: ['Runs recurring processes', 'Coordinates vendors', 'Keeps everything moving'] },
    { id: 'odo', name: 'Odo', role: 'Leadership', spot: 'var(--teal-100)',
      powers: ['Summarizes everything', 'Highlights risks', 'Turns strategy into execution'] }
  ];

  function antenna(kind, dark) {
    if (kind === 'pom') return '<path d="M60 14 L60 -4" stroke="' + dark + '" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="-8" r="6" fill="' + dark + '"/>';
    if (kind === 'double') return '<path d="M50 16 L40 -2" stroke="' + dark + '" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="-5" r="5" fill="' + dark + '"/><path d="M70 16 L80 -2" stroke="' + dark + '" stroke-width="3" stroke-linecap="round"/><circle cx="82" cy="-5" r="5" fill="' + dark + '"/>';
    if (kind === 'fin') return '<ellipse cx="60" cy="8" rx="13" ry="8" fill="' + dark + '"/>';
    if (kind === 'tuft') return '<circle cx="51" cy="8" r="5" fill="' + dark + '"/><circle cx="60" cy="2" r="6" fill="' + dark + '"/><circle cx="69" cy="8" r="5" fill="' + dark + '"/>';
    if (kind === 'curl') return '<path d="M60 12 Q60 -6 70 -8 Q77 -9 75 -2 Q74 3 69 2" stroke="' + dark + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    return '';
  }

  function accessory(kind) {
    if (kind === 'glasses') return '<g fill="none" stroke="' + INK + '" stroke-width="2.5"><circle cx="46" cy="61" r="11"/><circle cx="74" cy="61" r="11"/><path d="M57 61 L63 61"/></g>';
    if (kind === 'headphones') return '<path d="M32 52 Q60 24 88 52" stroke="' + SUIT + '" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="32" cy="58" rx="5.5" ry="9" fill="' + SUIT + '"/><ellipse cx="88" cy="58" rx="5.5" ry="9" fill="' + SUIT + '"/>';
    return '';
  }

  var uidCounter = 0;

  function charSVG(variant, size, delay) {
    var v = VARIANTS[variant] || VARIANTS.aeva;
    size = size || 120;
    delay = delay || 0;
    var uid = 'zz' + (++uidCounter);
    return '<svg viewBox="0 -18 120 156" width="' + size + '" height="' + (size * 1.3) + '" style="display:block;overflow:visible" role="img" aria-label="Zazoo companion ' + variant + '">' +
      '<g class="zz-bob" style="animation-delay:' + delay + 's">' +
      '<defs><clipPath id="' + uid + '"><path d="' + EGG + '"/></clipPath></defs>' +
      antenna(v.antenna, v.dark) +
      '<path d="' + EGG + '" fill="' + v.body + '"/>' +
      '<ellipse cx="46" cy="36" rx="16" ry="10" fill="#ffffff" opacity=".18"/>' +
      '<g clip-path="url(#' + uid + ')">' +
      '<rect x="14" y="90" width="92" height="46" fill="' + SUIT + '"/>' +
      '<polygon points="48,90 72,90 60,108" fill="' + SHIRT + '"/>' +
      '<polygon points="56.5,90 63.5,90 62,101 60,105 58,101" fill="' + TIE + '"/>' +
      '</g>' +
      '<g class="zz-blink" style="animation-delay:' + (delay + 1.2) + 's">' +
      '<circle cx="46" cy="61" r="7" fill="' + INK + '"/><circle cx="74" cy="61" r="7" fill="' + INK + '"/>' +
      '<circle cx="48.5" cy="58.5" r="2.4" fill="#fff"/><circle cx="76.5" cy="58.5" r="2.4" fill="#fff"/>' +
      '</g>' +
      '<ellipse cx="38" cy="73" rx="5" ry="3" fill="#e2704a" opacity=".28"/>' +
      '<ellipse cx="82" cy="73" rx="5" ry="3" fill="#e2704a" opacity=".28"/>' +
      '<path d="M53 76 Q60 82 67 76" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      accessory(v.acc) +
      '</g></svg>';
  }

  // Keyframes for bob + blink, injected once.
  var st = document.createElement('style');
  st.textContent =
    '@keyframes zzbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}' +
    '@keyframes zzblink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}' +
    '.zz-bob{animation:zzbob 3.4s ease-in-out infinite}' +
    '.zz-blink{animation:zzblink 4.6s infinite;transform-box:fill-box;transform-origin:center}' +
    '@media (prefers-reduced-motion:reduce){.zz-bob,.zz-blink{animation:none}}';
  document.head.appendChild(st);

  // Render every element carrying data-zazoo="variant" (optional data-size, data-delay).
  function renderChars(root) {
    (root || document).querySelectorAll('[data-zazoo]').forEach(function (el) {
      el.innerHTML = charSVG(el.dataset.zazoo, parseInt(el.dataset.size || '120', 10), parseFloat(el.dataset.delay || '0'));
    });
  }

  // ── Family selector (hover to preview, click to lock) ─────
  function familySelector(mount) {
    var locked = null, active = null;
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:18px;justify-content:center;flex-wrap:wrap';
    var info = document.createElement('div');
    info.style.cssText = 'text-align:center;margin-top:24px;min-height:96px';

    function paint() {
      var shown = active || locked;
      row.querySelectorAll('button').forEach(function (b) {
        var on = shown === b.dataset.id, dim = shown && !on;
        b.style.filter = dim ? 'blur(2px) saturate(.7)' : 'none';
        b.style.opacity = dim ? '.55' : '1';
        b.style.transform = on ? 'translateY(-6px) scale(1.05)' : 'none';
        b.style.boxShadow = on ? 'var(--shadow-raised)' : 'none';
        b.style.border = locked === b.dataset.id ? '2px solid var(--teal-500)' : '2px solid transparent';
      });
      var z = null;
      for (var i = 0; i < ZAZOOS.length; i++) if (ZAZOOS[i].id === shown) z = ZAZOOS[i];
      if (z) {
        info.innerHTML =
          '<span style="font-family:var(--font-display);font-weight:700;font-size:22px;color:var(--text-heading)">' + z.name + '</span>' +
          '<span style="color:var(--text-muted);margin-left:10px;font:var(--text-label)">' + z.role + '</span>' +
          '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px">' +
          z.powers.map(function (p) {
            return '<span style="background:var(--surface-card);border:1px solid var(--border);border-radius:999px;padding:6px 14px;font:var(--text-body-sm);color:var(--text-body)">✓ ' + p + '</span>';
          }).join('') + '</div>';
      } else {
        info.innerHTML = '<div style="color:var(--text-muted);font:var(--text-body-md)">Hover a Zazoo to see its superpowers. Tap to choose.</div>';
      }
    }

    ZAZOOS.forEach(function (z, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.id = z.id;
      b.setAttribute('aria-label', z.name + ', ' + z.role);
      b.style.cssText = 'cursor:pointer;background:' + z.spot + ';border-radius:28px;padding:20px 14px 0;transition:all .25s var(--ease-soft);border:2px solid transparent';
      b.innerHTML = charSVG(z.id, 104, i * 0.4);
      b.addEventListener('mouseenter', function () { active = z.id; paint(); });
      b.addEventListener('mouseleave', function () { active = null; paint(); });
      b.addEventListener('focus', function () { active = z.id; paint(); });
      b.addEventListener('blur', function () { active = null; paint(); });
      b.addEventListener('click', function () { locked = (locked === z.id) ? null : z.id; paint(); });
      row.appendChild(b);
    });
    mount.appendChild(row);
    mount.appendChild(info);
    paint();
  }

  // ── Scroll reveal ─────────────────────────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ── Nav (active link + mobile toggle) ─────────────────────
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav .links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  // ── Email capture (front-end only; honest done state) ─────
  function initEmailCapture() {
    document.querySelectorAll('[data-email-capture]').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if (!input || !input.value || input.value.indexOf('@') < 1) {
          if (input) { input.style.boxShadow = '0 0 0 3px rgba(176,74,58,.35)'; input.focus(); }
          return;
        }
        var subject = form.dataset.subject || 'Hello Zazoo';
        location.href = 'mailto:hello@zazoo.me?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent('Reach me at: ' + input.value);
        var done = form.querySelector('[data-done]');
        if (done) { done.hidden = false; form.querySelector('[data-fields]').hidden = true; }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderChars();
    initReveal();
    initNav();
    initEmailCapture();
    document.querySelectorAll('[data-zazoo-family]').forEach(familySelector);
  });

  window.Zazoo = { charSVG: charSVG, renderChars: renderChars, ZAZOOS: ZAZOOS };
})();
