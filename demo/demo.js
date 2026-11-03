// The Zazoo demo engine: one made-up business per page (window.DEMO), no server, no real data.
// A page gives its tables, modules (pages with a render function), agents, Home cards and Ask
// answers; this draws the window around them and keeps the state in memory.
const Z = (window.Z = {})
const $ = (s, el = document) => el.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
Z.esc = esc

let D, S
const clone = (x) => JSON.parse(JSON.stringify(x))

// ---------- formatting
const money = (v, cur) => {
  const c = cur || D?.currency || Z.currency || 'USD'
  const opts = { style: 'currency', currency: c, maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }
  return new Intl.NumberFormat(c === 'INR' ? 'en-IN' : 'en-US', opts).format(v)
}
const compact = (v) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
const day = (iso) => {
  if (!iso) return ''
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
Z.today = () => D.today
Z.daysFrom = (iso) => Math.round((new Date(iso + 'T12:00:00') - new Date(D.today + 'T12:00:00')) / 864e5)
Z.addDays = (n) => new Date(new Date(D.today + 'T12:00:00').getTime() + n * 864e5).toISOString().slice(0, 10)
Z.money = money
Z.compact = compact
Z.day = day
Z.fmt = (v, c = {}) => {
  if (v == null || v === '') return '<span class="muted">—</span>'
  switch (c.kind) {
    case 'money': return money(v)
    case 'number': return c.unit ? `${v.toLocaleString()} ${c.unit}` : v.toLocaleString()
    case 'compact': return compact(v)
    case 'pct': return `${Math.round(v * 10) / 10}%`
    case 'date': {
      if (!c.due) return day(v)
      const n = Z.daysFrom(v)
      const tone = n < 0 ? 'bad' : n <= 7 ? 'warn' : ''
      const words = n < 0 ? `${-n}d late` : n === 0 ? 'today' : `in ${n}d`
      return `${day(v)} <span class="pill ${tone}">${words}</span>`
    }
    case 'choice': return Z.pill(v, c.tones?.[v])
    case 'score': return Z.score(v, c.max ?? 100)
    case 'bool': return v ? '<span class="pill ok">Yes</span>' : '<span class="pill">No</span>'
    default: return esc(v)
  }
}
Z.pill = (v, tone = '') => `<span class="pill ${tone}">${esc(v)}</span>`
Z.score = (v, max = 100) => {
  const p = Math.max(0, Math.min(1, v / max))
  const col = p >= 0.7 ? 'var(--ok)' : p >= 0.5 ? 'var(--warn)' : 'var(--bad)'
  return `<span class="bar"><i style="width:${p * 100}%;background:${col}"></i></span> ${Math.round(v)}`
}
// a term the person may not know, explained where it stands
Z.g = (term, words) => `<abbr title="${esc(words ?? D.glossary?.[term] ?? '')}">${esc(term)}</abbr>`

// ---------- charts (inline SVG, colours from the site's palette)
const PAL = ['#c4602f', '#2f7a55', '#3b6ea5', '#b5832e', '#7a5ea8', '#8a8f9c', '#d08a6a', '#5aa384']
Z.PAL = PAL
const svg = (w, h, body, label) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(label || '')}" style="display:block;overflow:visible">${body}</svg>`
const ticks = (max) => {
  const step = Math.pow(10, Math.floor(Math.log10(max || 1)))
  const m = [1, 2, 2.5, 5, 10].map((k) => k * step).find((s) => max / s <= 5) || step * 10
  const out = []
  for (let v = 0; v <= max + 1e-9; v += m) out.push(v)
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + m)
  return out
}
Z.chart = {
  // bars: [{label, value, tone?}] ; opt: {fmt, h, ref:{value,label}}
  bar(bars, o = {}) {
    const w = 560, h = o.h || 220, L = 44, B = 34, T = 12
    const max = Math.max(...bars.map((b) => b.value), o.ref?.value || 0) * 1.05
    const tk = ticks(max), top = tk[tk.length - 1]
    const bw = (w - L - 8) / bars.length
    const y = (v) => T + (h - T - B) * (1 - v / top)
    const f = o.fmt || compact
    let g = tk.map((t) => `<line x1="${L}" x2="${w}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" font-size="10" fill="var(--ink-2)">${f(t)}</text>`).join('')
    g += bars.map((b, i) => {
      const x = L + i * bw + bw * 0.18, bh = y(0) - y(b.value)
      const col = b.color || (b.tone === 'bad' ? 'var(--bad)' : b.tone === 'ok' ? 'var(--ok)' : b.tone === 'warn' ? 'var(--warn)' : PAL[0])
      return `<g><title>${esc(b.label)}: ${f(b.value)}</title><rect x="${x}" y="${y(b.value)}" width="${bw * 0.64}" height="${Math.max(0, bh)}" rx="4" fill="${col}"/>` +
        `<text x="${x + bw * 0.32}" y="${h - B + 15}" text-anchor="middle" font-size="10" fill="var(--ink-2)">${esc(b.label)}</text></g>`
    }).join('')
    if (o.ref) g += `<line x1="${L}" x2="${w}" y1="${y(o.ref.value)}" y2="${y(o.ref.value)}" stroke="var(--ink)" stroke-dasharray="4 4"/><text x="${w}" y="${y(o.ref.value) - 5}" text-anchor="end" font-size="10" fill="var(--ink)">${esc(o.ref.label)}</text>`
    return svg(w, h, g, o.label)
  },
  // series: [{name, values:[n], color?, dash?}], labels: [str]
  line(series, labels, o = {}) {
    const w = 560, h = o.h || 220, L = 48, B = 26, T = 12, R = 8
    const all = series.flatMap((s) => s.values.filter((v) => v != null))
    const lo = o.zero === false ? Math.min(...all) * 0.95 : 0
    const tk = ticks(Math.max(...all) - lo).map((t) => t + lo), top = tk[tk.length - 1]
    const x = (i) => L + ((w - L - R) * i) / Math.max(1, labels.length - 1)
    const y = (v) => T + (h - T - B) * (1 - (v - lo) / (top - lo || 1))
    const f = o.fmt || compact
    let g = tk.map((t) => `<line x1="${L}" x2="${w - R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" font-size="10" fill="var(--ink-2)">${f(t)}</text>`).join('')
    const every = Math.ceil(labels.length / 8)
    g += labels.map((l, i) => (i % every ? '' : `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="10" fill="var(--ink-2)">${esc(l)}</text>`)).join('')
    if (o.ref) g += `<line x1="${L}" x2="${w - R}" y1="${y(o.ref.value)}" y2="${y(o.ref.value)}" stroke="var(--ink)" stroke-dasharray="4 4"/><text x="${w - R}" y="${y(o.ref.value) - 5}" text-anchor="end" font-size="10">${esc(o.ref.label)}</text>`
    series.forEach((s, k) => {
      const col = s.color || PAL[k]
      const pts = s.values.map((v, i) => (v == null ? null : `${x(i)},${y(v)}`)).filter(Boolean)
      if (o.area && k === 0) g += `<polygon points="${x(0)},${y(lo)} ${pts.join(' ')} ${x(s.values.length - 1)},${y(lo)}" fill="${col}" opacity=".12"/>`
      g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2.2" ${s.dash ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`
      s.values.forEach((v, i) => { if (v != null) g += `<circle cx="${x(i)}" cy="${y(v)}" r="2.6" fill="${col}"><title>${esc(s.name)} · ${esc(labels[i])}: ${f(v)}</title></circle>` })
    })
    return svg(w, h, g, o.label) + Z.legend(series.map((s, k) => ({ label: s.name, color: s.color || PAL[k], dash: s.dash })))
  },
  // parts: [{label, value, color?}]
  donut(parts, o = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0) || 1
    const r = 62, c = 2 * Math.PI * r
    let off = 0
    const arcs = parts.map((p, i) => {
      const len = (p.value / total) * c
      const a = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${p.color || PAL[i]}" stroke-width="24" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 90 90)"><title>${esc(p.label)}: ${(o.fmt || compact)(p.value)} (${Math.round((p.value / total) * 100)}%)</title></circle>`
      off += len
      return a
    }).join('')
    const mid = `<text x="90" y="88" text-anchor="middle" font-size="22" font-weight="700" font-family="var(--display)">${esc(o.center ?? compact(total))}</text><text x="90" y="106" text-anchor="middle" font-size="10" fill="var(--ink-2)">${esc(o.sub || '')}</text>`
    return `<div class="donut">${svg(180, 180, arcs + mid, o.label)}${Z.legend(parts.map((p, i) => ({ label: `${p.label} · ${(o.fmt || compact)(p.value)}`, color: p.color || PAL[i] })), true)}</div>`
  },
  // horizontal bars, one per row: [{label, value, max?, tone?, note?}]
  hbar(rows, o = {}) {
    const max = o.max || Math.max(...rows.map((r) => r.value)) || 1
    return `<div class="hbars">${rows.map((r, i) => `<div class="hb"><span>${esc(r.label)}</span><span class="bar wide"><i style="width:${(r.value / max) * 100}%;background:${r.color || (r.tone ? `var(--${r.tone})` : PAL[i % PAL.length])}"></i>${r.mark != null ? `<b style="left:${(r.mark / max) * 100}%"></b>` : ''}</span><em>${(o.fmt || compact)(r.value)}${r.note ? ` <small>${esc(r.note)}</small>` : ''}</em></div>`).join('')}</div>`
  },
  spark(values, color = PAL[0]) {
    const w = 90, h = 26, max = Math.max(...values), min = Math.min(...values)
    const pts = values.map((v, i) => `${(w * i) / (values.length - 1)},${h - 2 - ((h - 4) * (v - min)) / (max - min || 1)}`).join(' ')
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8"/></svg>`
  },
}
Z.legend = (items, col) => `<div class="legend${col ? ' col' : ''}">${items.map((i) => `<span><i style="background:${i.color}${i.dash ? ';opacity:.6' : ''}"></i>${esc(i.label)}</span>`).join('')}</div>`
Z.stat = (value, label, note, spark) => `<div class="stat"><b>${value}</b><span>${label}</span>${note ? `<small>${note}</small>` : ''}${spark || ''}</div>`
Z.panel = (title, body, extra = '') => `<section class="box"><div class="box-h"><h3>${title}</h3>${extra}</div>${body}</section>`

// ---------- tables
Z.rows = (t) => D.tables[t].rows
Z.row = (t, id) => D.tables[t].rows.find((r) => r.id === id)
Z.set = (t, id, values) => Object.assign(Z.row(t, id), values)
Z.table = (t, o = {}) => {
  const T = D.tables[t]
  const cols = (o.cols ? o.cols.map((k) => T.cols.find((c) => c.k === k)) : T.cols.filter((c) => !c.hide)).filter(Boolean)
  let rows = o.rows || T.rows
  const q = S.q[t]?.toLowerCase()
  if (q && !o.rows) rows = rows.filter((r) => cols.some((c) => String(r[c.k] ?? '').toLowerCase().includes(q)))
  const sort = S.sort[t] || (T.sort && { k: T.sort[0], dir: T.sort[1] })
  if (sort) rows = [...rows].sort((a, b) => ((a[sort.k] ?? '') > (b[sort.k] ?? '') ? 1 : -1) * (sort.dir === 'desc' ? -1 : 1))
  if (o.limit) rows = rows.slice(0, o.limit)
  const num = (c) => ['money', 'number', 'compact', 'pct', 'score'].includes(c.kind)
  const head = cols.map((c) => `<th class="${num(c) ? 'num' : ''}" data-act="sort" data-t="${t}" data-k="${c.k}" title="${esc(c.help || 'Sort')}">${esc(c.label)}${sort?.k === c.k ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}</th>`).join('')
  const body = rows.map((r) => `<tr data-act="row" data-t="${t}" data-id="${r.id}" class="${S.flash === r.id ? 'flash' : ''}">${cols.map((c) => `<td class="${num(c) ? 'num' : ''}">${Z.fmt(r[c.k], c)}</td>`).join('')}</tr>`).join('')
  const tools = o.bare ? '' : `<div class="tools"><input placeholder="Search ${esc(T.name.toLowerCase())}" value="${esc(S.q[t] || '')}" data-q="${t}"><span class="muted" style="font-size:.8rem">${rows.length} of ${T.rows.length} · click a row to open it</span></div>`
  return `${tools}<div class="tablewrap${o.bare ? ' mini' : ''}"><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${cols.length}" class="muted">Nothing here.</td></tr>`}</tbody></table></div>`
}

// ---------- journal, undo
const log = (who, words, mod, snap) => {
  S.journal.unshift({ who, words, mod, at: S.clockMin++, snap })
}
Z.log = log
// cards keep their action functions, so they are kept by reference with their done state
const snapshot = () => ({ rows: Object.fromEntries(Object.entries(D.tables).map(([k, t]) => [k, clone(t.rows)])), cards: S.cards.slice(), done: S.cards.map((c) => [c.done, c.doneWords]) })
const restore = (s) => {
  for (const k in s.rows) D.tables[k].rows = s.rows[k]
  S.cards = s.cards
  s.cards.forEach((c, i) => { [c.done, c.doneWords] = s.done[i] })
}
const clockStr = (m) => {
  const base = 9 * 60 + 12 + m * 3
  return `${Math.floor(base / 60)}:${String(base % 60).padStart(2, '0')}`
}

// ---------- the window
const roleOk = (x) => !x.roles || !S.role || x.roles.includes(S.role)
const needs = () => S.cards.filter((c) => c.kind === 'needs' && !c.done && roleOk(c))

const rail = () => {
  const btn = (view, icon, label, n) => `<button data-act="go" data-v="${view}" ${S.view === view ? 'aria-current="page"' : ''}><i class="ph ph-${icon}"></i>${label}${n ? `<span class="n">${n}</span>` : ''}</button>`
  // a module of one page is one button; more pages sit under the module's name
  const mods = `<div class="sec">Modules</div>` + D.modules.filter(roleOk).map((m) => (m.pages.length === 1 ? btn(`${m.id}/${m.pages[0].id}`, m.pages[0].icon || m.icon, esc(m.pages[0].name)) : `<div class="sec">${esc(m.name)}</div>` + m.pages.map((p) => btn(`${m.id}/${p.id}`, p.icon || m.icon, esc(p.name))).join(''))).join('')
  return `<nav class="rail" aria-label="Modules">
    <div class="brand"><span class="logo-dot">${D.brand.mark}</span><div><b>${esc(D.brand.name)}</b><small>${esc(D.brand.sub)}</small></div></div>
    ${D.roles ? `<label class="role">Signed in as<select data-role>${D.roles.map((r) => `<option ${r.id === S.role ? 'selected' : ''} value="${r.id}">${esc(r.name)}</option>`).join('')}</select></label>` : ''}
    ${btn('home', 'house', 'Home', needs().length)}
    ${btn('agents', 'robot', 'Agents', S.running.size || '')}
    ${btn('activity', 'clock-counter-clockwise', 'Activity')}
    ${mods}
    <div class="foot"><i class="ph ph-shield-check"></i> Runs on ${esc(D.brand.server)}. Maintained by Zazoo. <a href="#" data-act="why">What this means</a></div>
  </nav>`
}

const tourBox = () => {
  if (S.tourOff || !D.tour) return ''
  const steps = D.tour.map((t, i) => `<li class="${S.tourDone.has(i) ? 'done' : ''}">${t.text}</li>`).join('')
  return `<div class="tour"><i class="ph ph-compass" style="font-size:1.3rem;color:var(--accent)"></i><div><b>Try it as ${esc(D.persona)}</b><ol>${steps}</ol></div><button data-act="tour-off" aria-label="Hide the tour">Hide</button></div>`
}
const tick = (key) => {
  D.tour?.forEach((t, i) => { if (t.key === key) S.tourDone.add(i) })
}
Z.tick = tick

const cardHtml = (c) => {
  const mod = D.modules.find((m) => m.id === c.module)
  const lv = D.levels?.[c.level]
  const acts = c.done
    ? `<span class="pill ok"><i class="ph ph-check"></i> ${esc(c.doneWords || 'Done')}</span>`
    : (c.acts || []).map((a, i) => `<button class="btn ${a.primary ? '' : 'ghost'}" data-act="card" data-id="${c.id}" data-i="${i}">${esc(a.label)}</button>`).join('')
  return `<article class="card ${c.done ? 'done' : ''} ${c.kind}">
    <div class="top"><i class="ph ph-${c.icon || mod?.icon || 'sparkle'}"></i>${esc(mod?.name || '')}<span class="sp"></span>${lv ? `<span class="pill ${lv.tone}" title="${esc(lv.words)}">${esc(lv.name)}</span>` : ''}</div>
    <h3>${c.title}</h3><p>${c.body}</p>
    ${c.why ? `<details><summary>Why Zazoo flagged this</summary><p>${c.why}</p></details>` : ''}
    ${c.draft ? `<div class="draft">${c.draft}</div>` : ''}
    ${c.row ? `<a href="#" data-act="row" data-t="${c.row[0]}" data-id="${c.row[1]}" class="open">Open ${esc(D.tables[c.row[0]].one || 'record')} →</a>` : ''}
    <div class="acts">${acts}</div></article>`
}

const askBox = () => `<section class="ask"><form data-ask><input name="q" placeholder="Ask Zazoo about ${esc(D.brand.name)}…" autocomplete="off"><button class="btn">Ask</button></form>
  <div class="chips">${D.ask.filter(roleOk).map((a, i) => `<button data-act="ask" data-i="${D.ask.indexOf(a)}">${esc(a.q)}</button>`).join('')}</div>
  <div class="msgs">${S.msgs.map((m) => `<div class="msg ${m.me ? 'me' : 'z'}">${m.html}</div>`).join('')}</div></section>`

const home = () => {
  const n = needs()
  const done = S.cards.filter((c) => (c.kind === 'done' || c.done) && roleOk(c))
  return `<div class="head"><div><h1>${D.greeting(S.role)}</h1><p>${D.homeLine(S.role)}</p></div></div>
    ${tourBox()}${askBox()}
    ${D.homeStats ? `<div class="stats">${D.homeStats(S.role)}</div>` : ''}
    <div class="section-t"><h2>Needs you</h2><span class="pill accent">${n.length}</span><span class="muted" style="font-size:.82rem">Agents did the work; these wait for your yes.</span></div>
    <div class="grid">${n.map(cardHtml).join('') || '<p class="muted">Nothing waits for you. The agents will put anything new here.</p>'}</div>
    <div class="section-t"><h2>Done for you</h2><span class="muted" style="font-size:.82rem">Ran on their own, within the limits you set. Each can be undone from Activity.</span></div>
    <div class="grid">${done.map(cardHtml).join('')}</div>`
}

const agentsView = () => `<div class="head"><div><h1>Agents</h1><p>Each agent works inside one module, on a schedule, and can only do what its level allows. Run one now to watch it.</p></div></div>
  <div class="levels">${Object.entries(D.levels).map(([k, l]) => `<div><span class="pill ${l.tone}">${esc(l.name)}</span> ${esc(l.words)}</div>`).join('')}</div>
  <div class="grid">${D.agents.filter(roleOk).map((a) => {
    const m = D.modules.find((x) => x.id === a.module), lv = D.levels[a.level]
    const run = S.runs[a.id]
    return `<article class="card agent"><div class="top"><i class="ph ph-${m.icon}"></i>${esc(m.name)}<span class="sp"></span><span class="pill ${lv.tone}" title="${esc(lv.words)}">${esc(lv.name)}</span></div>
      <h3>${esc(a.name)}</h3><p>${a.does}</p>
      <p style="font-size:.78rem"><i class="ph ph-calendar-blank"></i> ${esc(a.when)} · reads ${esc(a.reads)}</p>
      ${run ? `<div class="log">${run.lines.map((l) => `<div class="${l.ok ? 'ok' : ''}">${esc(l.t)}</div>`).join('')}</div>` : ''}
      <div class="acts"><button class="btn" data-act="run" data-id="${a.id}" ${S.running.has(a.id) ? 'disabled' : ''}>${S.running.has(a.id) ? 'Running…' : run ? 'Run again' : 'Run now'}</button>
      <button class="btn ghost" data-act="pause" data-id="${a.id}">${S.paused.has(a.id) ? 'Resume' : 'Pause'}</button>${S.paused.has(a.id) ? '<span class="pill warn">Paused</span>' : ''}</div></article>`
  }).join('')}</div>`

const activity = () => {
  const last = S.journal.find((x) => x.snap && !x.undone)
  return `<div class="head"><div><h1>Activity</h1><p>Every change, by a person or an agent, in order. Undo the latest one and everything goes back as it was.</p></div></div>
  <ul class="lines">${S.journal.map((j, i) => `<li class="${j.undone ? 'undone' : ''}"><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${clockStr(j.at)}</time>${j === last ? '<button class="btn ghost sm" data-act="undo">Undo</button>' : ''}</li>`).join('') || '<li class="muted">Nothing yet.</li>'}</ul>`
}

const sidePanel = () => {
  if (!S.panel) return ''
  const { t, id } = S.panel
  const T = D.tables[t], r = Z.row(t, id)
  if (!r) return ''
  const title = r[T.title] ?? id
  const fields = T.cols.map((c) => `<dt>${esc(c.label)}</dt><dd>${Z.fmt(r[c.k], c)}${c.src ? `<small><i class="ph ph-link-simple"></i> ${esc(typeof c.src === 'function' ? c.src(r) : c.src)}</small>` : ''}</dd>`).join('')
  const lines = S.journal.filter((j) => j.row === id)
  return `<div class="scrim" data-act="close"></div><aside class="side" aria-label="${esc(title)}"><button class="x" data-act="close" aria-label="Close">✕</button>
    <span class="pill">${esc(T.one || T.name)}</span><h2 style="margin-top:8px">${esc(title)}</h2>
    ${T.detail ? T.detail(r) : ''}
    <h3 style="margin-top:18px">Every value, with where it came from</h3><dl class="fields">${fields}</dl>
    ${lines.length ? `<h3>History</h3><ul class="lines">${lines.map((j) => `<li><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${clockStr(j.at)}</time></li>`).join('')}</ul>` : ''}
  </aside>`
}

const why = () => S.why ? `<div class="scrim" data-act="close"></div><aside class="side"><button class="x" data-act="close" aria-label="Close">✕</button><h2>Where ${esc(D.brand.name)}'s data lives</h2>${D.whyHtml}</aside>` : ''

Z.render = () => {
  const y = scrollY
  let mainHtml
  if (S.view === 'home') mainHtml = home()
  else if (S.view === 'agents') mainHtml = agentsView()
  else if (S.view === 'activity') mainHtml = activity()
  else {
    const [m, p] = S.view.split('/')
    const page = D.modules.find((x) => x.id === m).pages.find((x) => x.id === p)
    mainHtml = page.render(Z)
  }
  $('#app').innerHTML = `<div class="demo-bar"><i class="ph ph-flask"></i><span>Interactive prototype · <b>every name and number is made up</b><span class="hide-sm"> · nothing you do leaves this page</span></span><span class="sp"></span><a href="./">Other demos</a><a href="#" data-act="reset">Start over</a></div>
    <div class="app">${rail()}<main id="main">${mainHtml}</main></div>${sidePanel()}${why()}${S.toast ? `<div class="toast">${S.toast.words}${S.toast.undo ? '<button data-act="undo">Undo</button>' : ''}</div>` : ''}`
  scrollTo(0, y)
  D.after?.(Z)
}
Z.go = (v) => { S.view = v; S.panel = null; tick('view:' + v); Z.render(); scrollTo(0, 0) }
Z.toast = (words, undo) => {
  S.toast = { words, undo }
  clearTimeout(S.toastT)
  S.toastT = setTimeout(() => { S.toast = null; Z.render() }, 5000)
}
// a change made by a person or an agent: journaled, undoable as the latest
Z.change = (who, words, fn, o = {}) => {
  const snap = snapshot()
  fn()
  log(who, words, o.mod, snap)
  if (o.row) S.journal[0].row = o.row
  if (o.row) S.flash = o.row
}
Z.state = () => S
Z.waiting = (mod) => needs().filter((c) => c.module === mod).length

// ---------- agents
const runAgent = (id) => {
  const a = D.agents.find((x) => x.id === id)
  if (S.running.has(id)) return
  S.running.add(id)
  S.runs[id] = { lines: [{ t: `▸ ${a.name} started (${D.levels[a.level].name})` }] }
  tick('run:' + id)
  Z.render()
  let i = 0
  const step = () => {
    if (i < a.steps.length) {
      S.runs[id].lines.push({ t: '  ' + a.steps[i++] })
      Z.render()
      setTimeout(step, 520)
      return
    }
    const snap = snapshot()
    const out = a.run(Z) || {}
    S.runs[id].lines.push({ t: `✓ ${out.text || 'Done'}`, ok: true })
    for (const c of out.cards || []) S.cards.unshift({ id: `${id}-${Date.now()}-${Math.random()}`, module: a.module, level: a.level, ...c })
    log(a.name, out.text || 'ran', a.module, snap)
    S.running.delete(id)
    Z.toast(`${esc(a.name)}: ${esc(out.text || 'done')}${out.cards?.length ? ' — see Home' : ''}`, true)
    Z.render()
  }
  setTimeout(step, 400)
}

// ---------- ask
const answer = (i, typed) => {
  const a = D.ask[i]
  S.msgs.push({ me: true, html: esc(typed || a.q) })
  S.msgs.push({ html: `<span class="muted" style="font-size:.78rem"><i class="ph ph-sparkle"></i> Reading ${esc(a.reads || 'your tables')}…</span>` })
  Z.render()
  setTimeout(() => {
    S.msgs.pop()
    S.msgs.push({ html: a.a(Z) })
    tick('ask')
    Z.render()
  }, 650)
}
const matchAsk = (q) => {
  const w = q.toLowerCase()
  let best = -1, score = 0
  D.ask.forEach((a, i) => {
    const s = a.keys.filter((k) => w.includes(k)).length
    if (s > score) { score = s; best = i }
  })
  return best
}

// ---------- events
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]')
  if (!el) return
  const act = el.dataset.act
  if (el.tagName === 'A') e.preventDefault()
  if (act === 'go') Z.go(el.dataset.v)
  else if (act === 'row') { S.panel = { t: el.dataset.t, id: el.dataset.id }; tick('row'); Z.render() }
  else if (act === 'close') { S.panel = null; S.why = false; Z.render() }
  else if (act === 'why') { S.why = true; Z.render() }
  else if (act === 'sort') {
    const { t, k } = el.dataset, cur = S.sort[t]
    S.sort[t] = { k, dir: cur?.k === k && cur.dir === 'asc' ? 'desc' : 'asc' }
    Z.render()
  } else if (act === 'card') {
    const c = S.cards.find((x) => x.id === el.dataset.id), a = c.acts[+el.dataset.i]
    const snap = snapshot()
    const words = a.run ? a.run(Z, c) : a.label
    c.done = true
    c.doneWords = a.doneWords || words
    log(D.you(S.role), words, c.module, snap)
    if (c.row) S.journal[0].row = c.row[1]
    tick('card')
    Z.toast(esc(words), true)
    Z.render()
  } else if (act === 'run') runAgent(el.dataset.id)
  else if (act === 'pause') {
    const id = el.dataset.id
    S.paused.has(id) ? S.paused.delete(id) : S.paused.add(id)
    log(D.you(S.role), `${S.paused.has(id) ? 'paused' : 'resumed'} ${D.agents.find((a) => a.id === id).name}`)
    Z.render()
  } else if (act === 'undo') {
    const j = S.journal.find((x) => x.snap && !x.undone)
    if (j) { restore(j.snap); j.undone = true; S.toast = null; log(D.you(S.role), `undid: ${j.words}`); Z.toast('Undone. Everything is as it was.') }
    Z.render()
  } else if (act === 'ask') answer(+el.dataset.i)
  else if (act === 'tour-off') { S.tourOff = true; Z.render() }
  else if (act === 'reset') { sessionStorage.removeItem('z-' + D.id); location.reload() }
  else D.acts?.[act]?.(Z, el)
})
document.addEventListener('input', (e) => {
  const t = e.target.dataset?.q
  if (t != null) {
    S.q[t] = e.target.value
    const pos = e.target.selectionStart
    Z.render()
    const inp = document.querySelector(`[data-q="${t}"]`)
    inp?.focus(); inp?.setSelectionRange(pos, pos)
  }
  if (e.target.dataset?.w != null) e.target.previousElementSibling.lastElementChild.textContent = e.target.value
})
document.addEventListener('change', (e) => {
  if (e.target.dataset?.w != null) return D.onWeight?.(Z, e.target)
  if (e.target.matches('[data-role]')) {
    S.role = e.target.value
    S.msgs = []
    Z.go('home')
  }
})
document.addEventListener('submit', (e) => {
  if (!e.target.matches('[data-ask]')) return
  e.preventDefault()
  const q = new FormData(e.target).get('q').trim()
  if (!q) return
  const i = matchAsk(q)
  if (i >= 0) return answer(i, q)
  S.msgs.push({ me: true, html: esc(q) }, { html: `In the live Zazoo this question goes to the model, which reads your tables to answer it. This prototype only knows a few answers: try one of the suggestions above.` })
  Z.render()
})
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (S.panel || S.why)) { S.panel = null; S.why = false; Z.render() } })

Z.boot = (demo) => {
  D = demo
  S = { view: 'home', panel: null, q: {}, sort: {}, journal: [], cards: D.cards.map((c) => ({ ...c })), msgs: [], runs: {}, running: new Set(), paused: new Set(), tourDone: new Set(), clockMin: 0, role: D.roles?.[0].id }
  for (const j of D.journal || []) log(j.who, j.words, j.mod)
  document.title = `${D.brand.name} · Zazoo demo`
  Z.render()
}
