/* Zazoo menagerie — felt-style animal companions. Each Zazoo is a unique animal.
   Exposes window.Menagerie = { animalSVG, robotSVG, FAMILY, GUARDIANS, initEyeTracking, initQuirks }.
   Personality quirks ("appeal") per docs/experience-guide.md: none advance the product;
   all make the companion feel alive. */
(function () {
  'use strict';

  var SUIT = '#2c4266', SHIRT = '#fffdf8', TIE = '#14555a', INK = '#22303a';
  var EGG = 'M60 14 C32 14 19 48 19 82 C19 114 36 132 60 132 C84 132 101 114 101 82 C101 48 88 14 60 14 Z';

  // ── The family ────────────────────────────────────────────
  var FAMILY = [
    { id: 'aeva', animal: 'owl', name: 'Aeva', role: 'Chief of staff', spot: 'var(--mist-100)',
      does: ['Planning', 'Prioritization', 'Decision making', 'Keeps everyone moving'],
      quirk: 'Pauses for a second before every important decision.',
      intro: 'Hi. I’m Aeva. This week I coordinated 4 companions, protected 11 hours of focus time, and closed 23 open loops before you noticed them.' },
    { id: 'lina', animal: 'fox', name: 'Lina', role: 'Research companion', spot: 'var(--coral-100)',
      does: ['Constantly reading', 'Highlighting ideas', 'Connecting information'],
      quirk: 'Hums quietly while she reads.',
      intro: 'Hi. I’m Lina. Last week I reviewed 287 pages, 18 research papers, and 42 meeting notes, and found 9 ideas worth your attention.' },
    { id: 'nori', animal: 'elephant', name: 'Nori', role: 'Operations', spot: 'var(--sage-100)',
      does: ['Approvals', 'Processes', 'Vendors', 'Moving things along'],
      quirk: 'Neatly straightens every object before moving on.',
      intro: 'Hi. I’m Nori. This month I moved 61 approvals along, chased 7 vendors so you didn’t have to, and kept every process on its rails.' },
    { id: 'bomi', animal: 'beaver', name: 'Bomi', role: 'Builder', spot: 'var(--warmwood-100)',
      does: ['Constructing automations', 'Connecting workflows', 'Fixing things'],
      quirk: 'Gets visibly excited when an automation finally clicks.',
      intro: 'Hi. I’m Bomi. I’ve built 12 little automations for you so far. My favourite saves you 40 minutes every Monday. I’m still improving it.' },
    { id: 'jia', animal: 'swan', name: 'Jia', role: 'Relationships', spot: 'var(--heather-100)',
      does: ['Following up', 'Preparing meetings', 'Remembering birthdays', 'Customer care'],
      quirk: 'Waves enthusiastically after sending a thoughtful follow-up.',
      intro: 'Hi. I’m Jia. I remembered 3 birthdays this month, prepared every meeting you walked into, and made sure nobody waited for a reply.' },
    { id: 'neva', animal: 'dolphin', name: 'Neva', role: 'Creativity', spot: 'var(--teal-100)',
      does: ['Sketching ideas', 'Mood boards', 'Presentations', 'Exploring possibilities'],
      quirk: 'Doodles in the margins when a meeting runs long.',
      intro: 'Hi. I’m Neva. I sketched 5 directions for Thursday’s deck. Two are safe, two are bold, and one is my secret favourite.' }
  ];

  var GUARDIANS = [
    { id: 'judge', animal: 'owl2', name: 'The Judge', doing: 'Weighs every request against your rules.' },
    { id: 'security', animal: 'elephant2', name: 'Security', doing: 'Opens only the doors you’ve allowed.' },
    { id: 'gatekeeper', animal: 'dog', name: 'The Gatekeeper', doing: 'Checks every badge at the gate.' },
    { id: 'auditor', animal: 'bear', name: 'The Auditor', doing: 'Writes everything down. Nothing hidden.' }
  ];

  // ── Palettes per animal ───────────────────────────────────
  var P = {
    owl:      { body: '#a3c6e0', dark: '#7ba8c9', lite: '#cfe0ee' },
    owl2:     { body: '#c9b6e4', dark: '#a98fd0', lite: '#e2d7f2' },
    fox:      { body: '#f0b48a', dark: '#d98d5b', lite: '#fbe3d2' },
    elephant: { body: '#adbecb', dark: '#8ba2b3', lite: '#d5dee5' },
    elephant2:{ body: '#8fc6c2', dark: '#69a7a3', lite: '#c7e3e1' },
    beaver:   { body: '#c9a284', dark: '#a97f5f', lite: '#e8d3c2' },
    swan:     { body: '#f4f0e6', dark: '#d8d0bd', lite: '#ffffff' },
    dolphin:  { body: '#8fc6d8', dark: '#66a8bd', lite: '#c6e4ed' },
    dog:      { body: '#d8c29a', dark: '#b59d72', lite: '#efe2c9' },
    bear:     { body: '#b39274', dark: '#8f6f52', lite: '#d9c3ab' }
  };

  var uid = 0;

  function eyes(kind) {
    // Pupils carry class zz-pupil so eye tracking can nudge them.
    if (kind === 'owl' || kind === 'owl2') {
      return '<g class="zz-blink"><circle cx="46" cy="60" r="12" fill="#fff"/><circle cx="74" cy="60" r="12" fill="#fff"/>' +
        '<circle class="zz-pupil" cx="46" cy="61" r="6" fill="' + INK + '"/><circle class="zz-pupil" cx="74" cy="61" r="6" fill="' + INK + '"/>' +
        '<circle cx="48" cy="59" r="2" fill="#fff"/><circle cx="76" cy="59" r="2" fill="#fff"/></g>';
    }
    if (kind === 'swan') {
      return '<g class="zz-blink"><circle class="zz-pupil" cx="46" cy="61" r="6" fill="' + INK + '"/><circle class="zz-pupil" cx="74" cy="61" r="6" fill="' + INK + '"/>' +
        '<circle cx="48" cy="59" r="2" fill="#fff"/><circle cx="76" cy="59" r="2" fill="#fff"/>' +
        '<path d="M38 53 Q44 50 50 53" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M70 53 Q76 50 82 53" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/></g>';
    }
    return '<g class="zz-blink"><circle class="zz-pupil" cx="46" cy="61" r="7" fill="' + INK + '"/><circle class="zz-pupil" cx="74" cy="61" r="7" fill="' + INK + '"/>' +
      '<circle cx="48.5" cy="58.5" r="2.4" fill="#fff"/><circle cx="76.5" cy="58.5" r="2.4" fill="#fff"/></g>';
  }

  function features(kind, c) {
    var f = '';
    if (kind === 'owl' || kind === 'owl2') {
      f += '<path d="M30 24 L24 4 L44 16 Z" fill="' + c.dark + '"/><path d="M90 24 L96 4 L76 16 Z" fill="' + c.dark + '"/>' + // ear tufts
           '<path d="M55 70 L65 70 L60 79 Z" fill="#e2a24a"/>'; // beak
    }
    if (kind === 'fox') {
      f += '<path d="M28 28 L20 2 L46 14 Z" fill="' + c.dark + '"/><path d="M92 28 L100 2 L74 14 Z" fill="' + c.dark + '"/>' +
           '<path d="M32 28 L27 10 L44 18 Z" fill="' + c.lite + '"/><path d="M88 28 L93 10 L76 18 Z" fill="' + c.lite + '"/>' +
           '<ellipse cx="60" cy="74" rx="16" ry="12" fill="' + c.lite + '"/><ellipse cx="60" cy="69" rx="5" ry="3.6" fill="' + INK + '"/>';
    }
    if (kind === 'elephant' || kind === 'elephant2') {
      f += '<ellipse cx="20" cy="52" rx="13" ry="17" fill="' + c.dark + '"/><ellipse cx="100" cy="52" rx="13" ry="17" fill="' + c.dark + '"/>' +
           '<ellipse cx="22" cy="52" rx="8" ry="11" fill="' + c.lite + '"/><ellipse cx="98" cy="52" rx="8" ry="11" fill="' + c.lite + '"/>' +
           '<path d="M60 66 Q56 84 64 92 Q70 97 74 93" stroke="' + c.body + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
           '<path d="M60 66 Q56 84 64 92 Q70 97 74 93" stroke="' + c.dark + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".35"/>';
    }
    if (kind === 'beaver') {
      f += '<circle cx="30" cy="16" r="9" fill="' + c.dark + '"/><circle cx="90" cy="16" r="9" fill="' + c.dark + '"/>' +
           '<circle cx="30" cy="16" r="4.5" fill="' + c.lite + '"/><circle cx="90" cy="16" r="4.5" fill="' + c.lite + '"/>' +
           '<ellipse cx="60" cy="70" rx="12" ry="9" fill="' + c.lite + '"/><ellipse cx="60" cy="66" rx="4.6" ry="3.4" fill="' + INK + '"/>' +
           '<rect x="54" y="76" width="5.4" height="8" rx="1.5" fill="#fff" stroke="' + c.dark + '" stroke-width="1"/>' +
           '<rect x="60.6" y="76" width="5.4" height="8" rx="1.5" fill="#fff" stroke="' + c.dark + '" stroke-width="1"/>';
    }
    if (kind === 'swan') {
      f += '<path d="M48 12 Q52 2 58 10 M56 10 Q60 0 66 8 M64 10 Q68 2 72 10" stroke="' + c.dark + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
           '<path d="M54 68 L66 68 L60 78 Z" fill="#e2704a"/>';
    }
    if (kind === 'dolphin') {
      f += '<path d="M52 16 Q60 -8 74 6 Q66 8 62 16 Z" fill="' + c.dark + '"/>' + // dorsal fin
           '<ellipse cx="60" cy="72" rx="14" ry="9" fill="' + c.lite + '"/>';
    }
    if (kind === 'dog') {
      f += '<path d="M26 20 Q10 26 16 52 Q26 46 34 34 Z" fill="' + c.dark + '"/><path d="M94 20 Q110 26 104 52 Q94 46 86 34 Z" fill="' + c.dark + '"/>' +
           '<ellipse cx="74" cy="58" rx="12" ry="13" fill="' + c.lite + '"/>' +
           '<ellipse cx="60" cy="72" rx="10" ry="7" fill="' + c.lite + '"/><ellipse cx="60" cy="69" rx="4.6" ry="3.4" fill="' + INK + '"/>';
    }
    if (kind === 'bear') {
      f += '<circle cx="28" cy="18" r="10" fill="' + c.dark + '"/><circle cx="92" cy="18" r="10" fill="' + c.dark + '"/>' +
           '<circle cx="28" cy="18" r="5" fill="' + c.lite + '"/><circle cx="92" cy="18" r="5" fill="' + c.lite + '"/>' +
           '<ellipse cx="60" cy="72" rx="13" ry="10" fill="' + c.lite + '"/><ellipse cx="60" cy="68" rx="5" ry="3.8" fill="' + INK + '"/>';
    }
    return f;
  }

  function mouth(kind) {
    if (kind === 'fox' || kind === 'beaver' || kind === 'dog' || kind === 'bear' || kind === 'dolphin') {
      return '<path d="M54 80 Q60 85 66 80" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    }
    if (kind === 'owl' || kind === 'owl2' || kind === 'swan') return '';
    return '<path d="M53 76 Q60 82 67 76" stroke="' + INK + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  }

  /* animalSVG(kind, size, opts{delay, prop}) — prop: small held object drawn by the right hand.
     Props: book, pen, wrench, letter, brush, calendar, key, ledger, lantern, scales, coffee, umbrella, plant */
  function propSVG(prop) {
    var s = {
      book:    '<g transform="translate(88,96)"><rect x="0" y="0" width="20" height="15" rx="2" fill="#fffdf8" stroke="#d5c9ad"/><line x1="10" y1="1" x2="10" y2="14" stroke="#d5c9ad"/></g>',
      pen:     '<g transform="translate(92,98) rotate(40)"><rect x="0" y="0" width="4" height="18" rx="2" fill="#e2704a"/><path d="M0 18 L2 23 L4 18 Z" fill="#22303a"/></g>',
      wrench:  '<g transform="translate(90,94) rotate(-25)"><rect x="3" y="4" width="5" height="18" rx="2" fill="#8b938d"/><circle cx="5.5" cy="4" r="5" fill="none" stroke="#8b938d" stroke-width="4"/></g>',
      letter:  '<g transform="translate(88,98)"><rect x="0" y="0" width="20" height="13" rx="2" fill="#fffdf8" stroke="#d5c9ad"/><path d="M0 1 L10 8 L20 1" stroke="#7fadb2" fill="none"/></g>',
      brush:   '<g transform="translate(92,96) rotate(30)"><rect x="0" y="6" width="4" height="16" rx="2" fill="#14555a"/><path d="M-1 6 Q2 -2 5 6 Z" fill="#c9b6e4"/></g>',
      calendar:'<g transform="translate(88,96)"><rect x="0" y="0" width="18" height="16" rx="2" fill="#fffdf8" stroke="#d5c9ad"/><rect x="0" y="0" width="18" height="4" fill="#e2704a"/><circle cx="6" cy="10" r="1.6" fill="#2e7278"/><circle cx="12" cy="10" r="1.6" fill="#d5c9ad"/></g>',
      key:     '<g transform="translate(92,98) rotate(20)"><circle cx="3" cy="3" r="4" fill="none" stroke="#e2a24a" stroke-width="2.5"/><path d="M6 6 L15 15 M11 11 L14 8 M13 13 L16 10" stroke="#e2a24a" stroke-width="2.5" stroke-linecap="round"/></g>',
      ledger:  '<g transform="translate(88,94)"><rect x="0" y="0" width="17" height="20" rx="2" fill="#fffdf8" stroke="#d5c9ad"/><line x1="3" y1="5" x2="14" y2="5" stroke="#7fadb2"/><line x1="3" y1="9" x2="14" y2="9" stroke="#d5c9ad"/><line x1="3" y1="13" x2="11" y2="13" stroke="#d5c9ad"/></g>',
      lantern: '<g transform="translate(90,92)"><rect x="4" y="0" width="8" height="3" rx="1" fill="#14555a"/><rect x="2" y="3" width="12" height="14" rx="3" fill="#f0d494" stroke="#14555a"/><circle cx="8" cy="10" r="3.4" fill="#fff" opacity=".8"/></g>',
      scales:  '<g transform="translate(88,90)"><line x1="10" y1="0" x2="10" y2="16" stroke="#8b938d" stroke-width="2"/><line x1="0" y1="4" x2="20" y2="4" stroke="#8b938d" stroke-width="2"/><path d="M0 4 L-3 11 Q0 14 3 11 Z M20 4 L17 11 Q20 14 23 11 Z" fill="#e2a24a"/></g>',
      coffee:  '<g transform="translate(90,96)"><rect x="0" y="2" width="13" height="13" rx="3" fill="#fffdf8" stroke="#d5c9ad"/><path d="M13 5 Q19 7 13 12" fill="none" stroke="#d5c9ad" stroke-width="2"/><path d="M3 0 Q4 -3 5 0 M8 0 Q9 -3 10 0" stroke="#8b938d" fill="none" stroke-linecap="round"/></g>',
      umbrella:'<g transform="translate(86,88)"><path d="M12 8 Q12 -4 0 4 Q4 -8 12 -6 Q20 -8 24 4 Q12 -4 12 8" fill="#e2704a"/><path d="M12 0 L12 8 Q12 24 15 24" stroke="#14555a" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>',
      plant:   '<g transform="translate(88,94)"><path d="M8 8 Q2 2 6 -4 Q11 1 8 8 M8 8 Q14 2 10 -4 Q6 0 8 8" fill="#83b697"/><path d="M2 8 L14 8 L12 18 L4 18 Z" fill="#c85a36"/></g>'
    };
    return s[prop] || '';
  }

  function animalSVG(kind, size, opts) {
    opts = opts || {};
    size = size || 120;
    var c = P[kind] || P.owl;
    var id = 'mz' + (++uid);
    var bob = opts.bob === false ? '' : ' class="zz-bob" style="animation-delay:' + (opts.delay || 0) + 's"';
    return '<svg viewBox="-6 -18 132 156" width="' + size + '" height="' + (size * 1.3) + '" style="display:block;overflow:visible" role="img" aria-label="' + (opts.label || ('Zazoo companion, ' + kind)) + '">' +
      '<g' + bob + '>' +
      '<defs><clipPath id="' + id + '"><path d="' + EGG + '"/></clipPath></defs>' +
      '<path d="' + EGG + '" fill="' + c.body + '"/>' +
      '<ellipse cx="46" cy="36" rx="16" ry="10" fill="#ffffff" opacity=".18"/>' +
      '<g clip-path="url(#' + id + ')">' +
      '<rect x="14" y="92" width="92" height="44" fill="' + SUIT + '"/>' +
      '<polygon points="48,92 72,92 60,109" fill="' + SHIRT + '"/>' +
      '<polygon points="56.5,92 63.5,92 62,102 60,106 58,102" fill="' + TIE + '"/>' +
      '</g>' +
      features(kind, c) +
      eyes(kind) +
      '<ellipse cx="36" cy="72" rx="5" ry="3" fill="#e2704a" opacity=".26"/>' +
      '<ellipse cx="84" cy="72" rx="5" ry="3" fill="#e2704a" opacity=".26"/>' +
      mouth(kind) +
      (opts.prop ? propSVG(opts.prop) : '') +
      '</g></svg>';
  }

  function robotSVG(size) {
    size = size || 90;
    return '<svg viewBox="0 0 100 120" width="' + size + '" height="' + (size * 1.2) + '" style="display:block;overflow:visible" role="img" aria-label="A generic robot">' +
      '<line x1="50" y1="18" x2="50" y2="6" stroke="#5a6672" stroke-width="3"/><circle cx="50" cy="5" r="4" fill="#b04a3a"/>' +
      '<rect x="22" y="18" width="56" height="44" rx="8" fill="#7a8794"/>' +
      '<rect x="30" y="28" width="40" height="18" rx="5" fill="#3d4650"/>' +
      '<circle class="zz-roboeye" cx="42" cy="37" r="4" fill="#e0523c"/><circle class="zz-roboeye" cx="58" cy="37" r="4" fill="#e0523c"/>' +
      '<line x1="40" y1="53" x2="60" y2="53" stroke="#3d4650" stroke-width="2.5" stroke-linecap="round"/>' +
      '<rect x="28" y="64" width="44" height="40" rx="7" fill="#8b98a5"/>' +
      '<rect x="12" y="66" width="12" height="28" rx="6" fill="#7a8794"/><rect x="76" y="66" width="12" height="28" rx="6" fill="#7a8794"/>' +
      '<rect x="32" y="104" width="14" height="12" rx="3" fill="#5a6672"/><rect x="54" y="104" width="14" height="12" rx="3" fill="#5a6672"/>' +
      '</svg>';
  }

  // ── Eye tracking (pupils drift toward the cursor) ─────────
  function initEyeTracking() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.PointerEvent) return;
    var pending = false, px = 0, py = 0;
    document.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        document.querySelectorAll('.zz-pupil').forEach(function (p) {
          var r = p.getBoundingClientRect();
          if (r.bottom < -40 || r.top > innerHeight + 40) return;
          var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
          var d = Math.hypot(dx, dy) || 1, m = Math.min(2.4, d / 60);
          p.style.transform = 'translate(' + (dx / d * m) + 'px,' + (dy / d * m) + 'px)';
        });
      });
    }, { passive: true });
  }

  // ── Quirk emotes: a tiny bubble appears near a companion, then fades ──
  var QUIRK_EMOTES = { aeva: '…', lina: '♪', nori: '✓', bomi: '✨', jia: '👋', neva: '✎' };
  function initQuirks() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var hosts = Array.from(document.querySelectorAll('[data-quirk]'));
    if (!hosts.length) return;
    setInterval(function () {
      var h = hosts[Math.floor(Math.random() * hosts.length)];
      if (h.querySelector('.zz-emote')) return;
      var r = h.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      var e = document.createElement('span');
      e.className = 'zz-emote';
      e.textContent = QUIRK_EMOTES[h.dataset.quirk] || '✨';
      h.appendChild(e);
      setTimeout(function () { e.remove(); }, 2600);
    }, 3400);
  }

  var st = document.createElement('style');
  st.textContent =
    '.zz-pupil{transition:transform .18s ease-out}' +
    '.zz-emote{position:absolute;top:-6px;right:-2px;background:var(--surface-card);border:1px solid var(--border);border-radius:999px;padding:3px 8px;font-size:13px;box-shadow:var(--shadow-card);animation:zzemote 2.6s ease forwards;pointer-events:none;z-index:3}' +
    '@keyframes zzemote{0%{opacity:0;transform:translateY(6px)}15%,80%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}' +
    '@keyframes zzroboeye{0%,100%{opacity:1}50%{opacity:.35}}' +
    '.zz-roboeye{animation:zzroboeye 1.6s infinite}' +
    '@media (prefers-reduced-motion:reduce){.zz-roboeye{animation:none}.zz-emote{animation:none}}';
  document.head.appendChild(st);

  window.Menagerie = { animalSVG: animalSVG, robotSVG: robotSVG, FAMILY: FAMILY, GUARDIANS: GUARDIANS, initEyeTracking: initEyeTracking, initQuirks: initQuirks };
})();
