// The Zazoo window as a static demo. A page gives one made-up business (tables, modules, agents,
// what needs the person, tasks, answers); this draws the real window's shape around it: the rail,
// the 48px bar with a module's tabs, saved lists and a toolbar of views (map, table, list, card,
// board, calendar, timeline, chart), the row panel with each value's source, Home, Tasks, Agents,
// Activity and the assistant. Everything stays in this tab; Start over begins again.
const Z = (window.Z = {})
let D, S
const $ = (s, el = document) => el.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const clone = (x) => JSON.parse(JSON.stringify(x))
const ic = (n) => `<i class="ph ph-${n} i"></i>`
Z.esc = esc
Z.ic = ic

// ---------- dates and amounts
const T12 = (iso) => new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
Z.daysFrom = (iso) => Math.round((T12(iso) - T12(D.today)) / 864e5)
Z.addDays = (n, from) => new Date(T12(from || D.today).getTime() + n * 864e5).toISOString().slice(0, 10)
Z.day = (iso) => (iso ? T12(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '')
Z.wday = (iso) => T12(iso).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
Z.money = (v, cur) => {
  const c = cur || D?.currency || Z.currency || 'USD'
  return new Intl.NumberFormat(c === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: c, maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v)
}
Z.compact = (v) => {
  if ((D?.currency || Z.currency) === 'INR' && Math.abs(v) >= 1e5) return Math.abs(v) >= 1e7 ? `${(v / 1e7).toFixed(1)}Cr` : `${(v / 1e5).toFixed(1)}L`
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
}
Z.cmoney = (v) => ((D?.currency || Z.currency) === 'INR' ? '₹' : '$') + Z.compact(v)

// ---------- choices and their colours
const TONES = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7', 'o8']
const toneOf = (f, v) => f.tones?.[v] || TONES[Math.max(0, (f.choices || []).indexOf(v)) % 8]
const toneColor = (t) => ({ good: 'var(--good)', warn: '#b5832e', bad: 'var(--bad)', acc: 'var(--accent)' })[t] || `var(--${t})`
Z.PAL = ['#c4602f', '#2f7a55', '#2f5f8a', '#b5832e', '#6a4a9c', '#21676a', '#9a3a6b', '#66553f']
Z.chip = (v, tone = '') => `<span class="chip ${tone}">${esc(v)}</span>`

Z.fmt = (v, f = {}, r) => {
  if (f.show) return f.show(v, r)
  if (v == null || v === '') return '<span class="mute3">—</span>'
  switch (f.kind) {
    case 'money': return Z.money(v)
    case 'cmoney': return Z.cmoney(v)
    case 'number': return `${v.toLocaleString()}${f.unit ? ' ' + f.unit : ''}`
    case 'compact': return Z.compact(v)
    case 'pct': return `${Math.round(v * 10) / 10}%`
    case 'date': {
      if (!f.due) return Z.day(v)
      const n = Z.daysFrom(v)
      return `<span class="${n < 0 ? 'late' : n <= 7 ? 'soon' : ''}" data-tip="${n < 0 ? `${-n} days late` : n === 0 ? 'Due today' : `In ${n} days`}">${Z.day(v)}</span>`
    }
    case 'choice': return Z.chip(v, toneOf(f, v))
    case 'bool': return v ? Z.chip('Yes', f.yes || 'warn') : '<span class="mute3">No</span>'
    case 'score': {
      const p = Math.max(0, Math.min(1, v / (f.max || 100)))
      return `<span class="bar-s"><i style="width:${p * 100}%;background:${p >= 0.7 ? 'var(--good)' : p >= 0.5 ? '#b5832e' : 'var(--bad)'}"></i></span>${Math.round(v)}`
    }
    case 'link': return `<span class="link">${esc(v)}</span>`
    default: return esc(v)
  }
}
const isNum = (f) => ['money', 'cmoney', 'number', 'compact', 'pct', 'score'].includes(f.kind)
const plain = (v, f) => (v == null ? '' : f.kind === 'money' || f.kind === 'cmoney' ? Z.money(v) : f.kind === 'date' ? Z.day(v) : String(v))

// ---------- charts
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="overflow:visible;max-height:${h + 20}px">${body}</svg>`
const ticks = (max) => {
  const step = Math.pow(10, Math.floor(Math.log10(max || 1)))
  const m = [1, 2, 2.5, 5, 10].map((k) => k * step).find((s) => max / s <= 5) || step * 10
  const out = []
  for (let v = 0; v <= max + 1e-9; v += m) out.push(v)
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + m)
  return out
}
Z.legend = (items) => `<div class="legend">${items.map((i) => `<span><i style="background:${i.color}"></i>${esc(i.label)}</span>`).join('')}</div>`
Z.chart = {
  bar(bars, o = {}) {
    const w = 560, h = o.h || 200, L = 46, B = 30, T = 10
    const max = Math.max(...bars.map((b) => b.value), o.ref?.value || 0, 1) * 1.05
    const tk = ticks(max), top = tk[tk.length - 1], f = o.fmt || Z.compact
    const y = (v) => T + (h - T - B) * (1 - v / top), bw = (w - L) / bars.length
    let g = tk.map((t) => `<line x1="${L}" x2="${w}" y1="${y(t)}" y2="${y(t)}" stroke="var(--hair)"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${f(t)}</text>`).join('')
    g += bars.map((b, i) => {
      const x = L + i * bw + bw * 0.2
      return `<g data-tip="${esc(b.label)}: ${esc(f(b.value))}"><rect x="${x}" y="${y(b.value)}" width="${bw * 0.6}" height="${Math.max(0, y(0) - y(b.value))}" rx="4" fill="${b.color || (b.tone ? toneColor(b.tone) : Z.PAL[0])}"/><text x="${x + bw * 0.3}" y="${h - B + 15}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${esc(b.label)}</text></g>`
    }).join('')
    if (o.ref) g += `<line x1="${L}" x2="${w}" y1="${y(o.ref.value)}" y2="${y(o.ref.value)}" stroke="var(--ink)" stroke-dasharray="4 4"/><text x="${w}" y="${y(o.ref.value) - 5}" text-anchor="end" font-size="10">${esc(o.ref.label)}</text>`
    return svg(w, h, g)
  },
  line(series, labels, o = {}) {
    const w = 560, h = o.h || 200, L = 48, B = 24, T = 10, R = 6
    const all = series.flatMap((s) => s.values).filter((v) => v != null)
    const tk = ticks(Math.max(...all, o.ref?.value || 0)), top = tk[tk.length - 1], f = o.fmt || Z.compact
    const x = (i) => L + ((w - L - R) * i) / Math.max(1, labels.length - 1), y = (v) => T + (h - T - B) * (1 - v / top)
    let g = tk.map((t) => `<line x1="${L}" x2="${w - R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--hair)"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end" font-size="10" fill="var(--ink-3)">${f(t)}</text>`).join('')
    const every = Math.ceil(labels.length / 8)
    g += labels.map((l, i) => (i % every ? '' : `<text x="${x(i)}" y="${h - 6}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${esc(l)}</text>`)).join('')
    if (o.ref) g += `<line x1="${L}" x2="${w - R}" y1="${y(o.ref.value)}" y2="${y(o.ref.value)}" stroke="var(--ink)" stroke-dasharray="4 4"/><text x="${w - R}" y="${y(o.ref.value) - 5}" text-anchor="end" font-size="10">${esc(o.ref.label)}</text>`
    series.forEach((s, k) => {
      const col = s.color || Z.PAL[k], idx = s.values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0), pts = idx.map((i) => `${x(i)},${y(s.values[i])}`)
      if (o.area && k === 0) g += `<polygon points="${x(idx[0])},${y(0)} ${pts.join(' ')} ${x(idx.at(-1))},${y(0)}" fill="${col}" opacity=".1"/>`
      g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="2.2" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`
      s.values.forEach((v, i) => v != null && (g += `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${col}" data-tip="${esc(s.name)} · ${esc(labels[i])}: ${esc(f(v))}"/>`))
    })
    return svg(w, h, g) + (series.length > 1 || o.legend ? Z.legend(series.map((s, k) => ({ label: s.name, color: s.color || Z.PAL[k] }))) : '')
  },
  donut(parts, o = {}) {
    const total = parts.reduce((a, p) => a + p.value, 0) || 1, r = 60, c = 2 * Math.PI * r, f = o.fmt || Z.compact
    let off = 0
    const arcs = parts.map((p, i) => {
      const len = (p.value / total) * c
      const a = `<circle r="${r}" cx="80" cy="80" fill="none" stroke="${p.color || Z.PAL[i % 8]}" stroke-width="22" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)" data-tip="${esc(p.label)}: ${esc(f(p.value))} (${Math.round((p.value / total) * 100)}%)"/>`
      off += len
      return a
    }).join('')
    return `<div class="donut">${svg(160, 160, arcs + `<text x="80" y="80" text-anchor="middle" font-size="22" font-weight="600" font-family="var(--display)">${esc(o.center ?? f(total))}</text><text x="80" y="98" text-anchor="middle" font-size="10" fill="var(--ink-3)">${esc(o.sub || '')}</text>`)}<div class="legend" style="flex-direction:column">${parts.map((p, i) => `<span><i style="background:${p.color || Z.PAL[i % 8]}"></i>${esc(p.label)} · ${esc(f(p.value))}</span>`).join('')}</div></div>`
  },
  hbar(rows, o = {}) {
    const max = o.max || Math.max(...rows.map((r) => r.value), 1), f = o.fmt || Z.compact
    return `<div class="hbars">${rows.map((r, i) => `<div class="hb" ${r.row ? `data-act="row" data-t="${r.row[0]}" data-id="${r.row[1]}" style="cursor:pointer"` : ''} data-tip="${esc(r.tip || `${r.label}: ${f(r.value)}`)}"><span class="ell">${esc(r.label)}</span><span class="tr"><i style="width:${Math.min(100, (r.value / max) * 100)}%;background:${r.color || (r.tone ? toneColor(r.tone) : Z.PAL[i % 8])}"></i>${r.mark != null ? `<b style="left:${(r.mark / max) * 100}%"></b>` : ''}</span><em>${esc(f(r.value))}${r.note ? ` <small class="mute3">${esc(r.note)}</small>` : ''}</em></div>`).join('')}</div>`
  },
}
Z.box = (title, body, right = '', tip) => `<section class="box"><div class="box-h"><h2>${title}${tip ? ` <span class="mute3" data-tip="${esc(tip)}">${ic('info')}</span>` : ''}</h2>${right}</div><div class="box-b">${body}</div></section>`
Z.count = (n, label, btn, act) => `<div class="count"><div class="t"><b>${n}</b><span>${label}</span></div>${btn ? `<button class="btn sm" ${act}><span class="dot" style="background:var(--ink-3)"></span>${esc(btn)}</button>` : ''}</div>`

// ---------- rows
Z.rows = (t) => D.tables[t].rows
Z.row = (t, id) => D.tables[t].rows.find((r) => r.id === id)
Z.set = (t, id, values) => Object.assign(Z.row(t, id), values)
const fieldOf = (t, k) => D.tables[t].fields.find((f) => f.k === k)
const titleOf = (t, r) => r[D.tables[t].title]

// ---------- journal and undo
const snapshot = () => ({
  rows: Object.fromEntries(Object.entries(D.tables).map(([k, t]) => [k, clone(t.rows)])),
  needs: S.needs.slice(), nstate: S.needs.map((n) => [n.done, n.doneWords]),
  tasks: S.tasks.slice(), tstate: S.tasks.map((t) => t.state), on: { ...S.on }, srcs: clone(S.srcs), notes: S.notes.slice(), page: D.save?.(),
})
const restore = (s) => {
  for (const k in s.rows) D.tables[k].rows = s.rows[k]
  S.needs = s.needs; s.needs.forEach((n, i) => ([n.done, n.doneWords] = s.nstate[i]))
  S.tasks = s.tasks; s.tasks.forEach((t, i) => (t.state = s.tstate[i]))
  S.on = s.on; S.srcs = s.srcs; S.notes = s.notes
  D.load?.(s.page)
  D.after?.(Z)
}
const clock = () => { const m = 9 * 60 + 14 + S.tick++ * 3; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}` }
const log = (who, words, o = {}) => S.journal.unshift({ who, words, at: clock(), ...o })
Z.log = log
Z.you = () => D.you(S.role)
// a change by the person or an agent: journaled, and the latest can be undone
Z.change = (who, words, fn, o = {}) => {
  const snap = snapshot()
  fn()
  D.after?.(Z)
  log(who, words, { snap, ...o })
  if (o.row) S.flash = o.row
}
Z.toast = (words, undo) => {
  S.toast = { words, undo }
  clearTimeout(S.toastT)
  S.toastT = setTimeout(() => { S.toast = null; Z.render() }, 5000)
}
Z.state = () => S

// ---------- roles
const roleOk = (x) => !x.roles || !S.role || x.roles.includes(S.role)
const needsOpen = () => S.needs.filter((n) => !n.done && roleOk(n))
const tasksMine = () => S.tasks.filter(roleOk)
Z.waiting = (mod) => needsOpen().filter((n) => n.module === mod).length

// ---------- the rail
const go = (at, o = {}) => {
  S.route = { at, ...o }
  S.panel = null
  S.found = ''
  Z.render()
  const p = $('.page'); if (p) p.scrollTop = 0
}
Z.go = go
Z.open = (t, id) => { S.panel = { t, id }; Z.render() }
const here = (at, mod) => S.route.at === at && (!mod || S.route.mod === mod)
const rail = () => {
  const ri = (act, icon, label, cur, n = '', extra = '') => `<button class="ri" ${act} ${cur ? 'aria-current="page"' : ''} data-tip="${esc(label)}" data-tipside="r">${ic(icon)}<span class="ell">${esc(label)}</span>${n ? `<span class="n">${n}</span>` : ''}${extra}</button>`
  const tasksDue = tasksMine().filter((t) => t.state !== 'done' && t.state !== 'waiting' && Z.daysFrom(t.due) <= 0).length
  const mods = D.modules.filter(roleOk).map((m) => ri(`data-act="mod" data-m="${m.id}"`, m.icon, m.name, here('module', m.id), Z.waiting(m.id) || '')).join('')
  return `<aside class="rail" aria-label="Rail">
    <div class="rail-head"><button class="ws" data-act="wsmenu"><span class="mk">${esc(D.brand.mark)}</span><b class="ell">${esc(D.brand.name)}</b><span class="chev mute3">${ic('caret-down')}</span></button><button class="iconbtn" data-act="railfold" data-tip="Fold the rail (⌘\\)">${ic('sidebar-simple')}</button></div>
    <nav>
      ${ri('data-act="go" data-at="home"', 'house', 'Home', here('home'), needsOpen().length || '')}
      ${ri('data-act="go" data-at="agents"', 'robot', 'Agents', here('agents'))}
      ${ri('data-act="go" data-at="tasks"', 'list-checks', 'Tasks', here('tasks'), tasksDue || '')}
      <div class="rail-sec">Modules</div>
      ${mods}
      ${ri('data-act="nomod"', 'plus', 'New module', false, '', '').replace('class="ri"', 'class="ri dim"')}
    </nav>
    <div class="rail-foot">${ri('data-act="go" data-at="settings"', 'sliders-horizontal', 'Settings', here('settings') || here('activity'))}<button class="iconbtn ${here('brain') ? 'on' : ''}" data-act="go" data-at="brain" data-tip="Second Brain: every module, connected" aria-label="Second Brain">${ic('brain')}</button></div>
  </aside>`
}

// ---------- the bar
const bar = () => {
  const r = S.route
  let mid = ''
  if (r.at === 'home') mid = `<h1>${esc(D.greeting(S.role))} <small>${Z.wday(D.today)}</small></h1>`
  else if (r.at === 'module') {
    const m = D.modules.find((x) => x.id === r.mod)
    const tabs = [...(m.overview ? [['overview', 'Overview', '']] : []), ...m.tables.map((t) => [t, D.tables[t].name, D.tables[t].rows.length]), ['agents', 'Agents and notes', '']]
    mid = `<div class="tabs" role="tablist">${tabs.map(([k, l, c]) => `<button role="tab" aria-pressed="${r.tab === k}" data-act="tab" data-k="${k}">${esc(l)}${c !== '' ? `<span class="c">${c}</span>` : ''}</button>`).join('')}</div>`
  } else if (r.at === 'tasks') {
    const sets = taskLists(tasksMine())
    mid = `<div class="tabs" role="tablist">${Object.entries(TLISTS).map(([k, l]) => `<button role="tab" aria-pressed="${S.tlist === k}" data-act="tlist" data-k="${k}">${l}<span class="c">${sets[k].length}</span></button>`).join('')}</div>`
  } else mid = `<h1>${({ agents: 'Agents', activity: 'Activity', settings: 'Settings', brain: 'Second Brain' })[r.at]}</h1>`
  return `<header class="bar"><div class="l">${r.at !== 'home' ? `<button class="iconbtn" data-act="back" data-tip="Back">${ic('arrow-left')}</button>` : ''}</div>${mid}<div class="r">${S.chat ? '' : `<button class="iconbtn" data-act="chat" data-tip="Open ${esc(D.assistant)}">${ic('sidebar-simple')}</button>`}</div></header>`
}

// ---------- Home
const needItem = (n) => {
  const lv = D.levels[n.level]
  const open = S.openNeed === n.id
  const acts = n.done ? `<span class="chip good">${ic('check')} ${esc(n.doneWords || 'Done')}</span>` : n.acts.map((a, i) => `<button class="btn sm ${a.pri ? 'pri' : ''}" data-act="need" data-id="${n.id}" data-i="${i}" ${a.tip ? `data-tip="${esc(a.tip)}"` : ''}>${esc(a.label)}</button>`).join('')
  return `<div class="it ${n.done ? 'done' : ''}"><span class="dot" style="background:${n.done ? 'var(--good)' : 'var(--accent)'}"></span>
    <div><button class="ti" style="text-align:left" data-act="opneed" data-id="${n.id}" data-tip="${n.why ? 'Why this, and the draft' : ''}">${n.title}</button><div class="su">${esc(n.agent)} · ${lv ? `<span data-tip="${esc(lv.words)}">${esc(lv.name)}</span>` : ''}${n.row ? ` · <button class="link" data-act="row" data-t="${n.row[0]}" data-id="${n.row[1]}">${esc(titleOf(n.row[0], Z.row(...n.row)) ?? 'Open')}</button>` : ''}</div>${n.quote ? `<div class="wa">${esc(n.quote)}<small>${esc(n.quoteFrom || '')}</small></div>` : ''}</div>
    <span class="dt">${esc(n.date || 'Today')}</span>
    ${open ? `<div class="more">${n.sub ? n.sub + '\n\n' : ''}${n.why ? `<b>Why:</b> ${n.why}` : ''}${n.draft ? `\n\n<b>Draft</b>\n${n.draft}` : ''}</div>` : ''}
    <div class="acts">${acts}</div></div>`
}
const needsBox = () => {
  const ns = S.needs.filter(roleOk).filter((n) => !n.done || n.justDone)
  const open = ns.filter((n) => !n.done)
  let body
  if (S.needsMode === 'list') body = ns.map(needItem).join('')
  else {
    const by = {}
    ns.forEach((n) => (by[n.agent] ??= []).push(n))
    body = Object.entries(by).map(([a, xs]) => `<div class="grp">${esc(a)} <span class="mute3">${xs.filter((x) => !x.done).length}</span></div>` + xs.map(needItem).join('')).join('')
  }
  return `<section class="box" id="needs"><div class="box-h"><h2>Needs you <span class="chip acc">${open.length}</span></h2><button class="drop" data-act="needsmode">${ic(S.needsMode === 'list' ? 'list' : 'robot')} ${S.needsMode === 'list' ? 'List' : 'By agent'} ${ic('caret-down')}</button></div><div class="items">${body || '<div class="it"><span></span><div class="mute">Nothing waits for you. The agents put anything new here.</div></div>'}</div></section>`
}
const taskItem = (t) => {
  const r = t.row && Z.row(...t.row), n = Z.daysFrom(t.due)
  const next = t.state === 'todo' ? ['Start', 'doing'] : t.state === 'doing' ? ['Done', 'done'] : t.state === 'waiting' ? [t.chase || 'Chase', 'chase'] : null
  return `<div class="it ${t.state === 'done' ? 'done' : ''}"><button class="ring ${t.state}" data-act="tdone" data-id="${t.id}" data-tip="${t.state === 'done' ? 'Done' : 'Mark done'}">${t.state === 'done' ? '✓' : ''}</button>
    <div><div class="ti">${esc(t.title)}</div><div class="su">${t.by ? esc(t.by) + ' · ' : ''}${r ? `<button class="link" data-act="row" data-t="${t.row[0]}" data-id="${t.row[1]}">${esc(D.tables[t.row[0]].name)} › ${esc(titleOf(t.row[0], r))}</button>` : ''}${t.state === 'waiting' ? ` · waiting on ${esc(t.on || 'a reply')}` : ''}</div></div>
    <span class="dt ${n < 0 && t.state !== 'done' ? 'late' : ''}">${Z.wday(t.due)}</span>
    ${next ? `<div class="acts"><button class="btn sm ${t.state === 'doing' ? 'pri' : ''}" data-act="tnext" data-id="${t.id}" data-to="${next[1]}">${esc(next[0])}</button></div>` : ''}</div>`
}
const taskTabs = (all) => {
  const tab = S.taskTab
  const sets = {
    today: all.filter((t) => t.state !== 'done' && t.state !== 'waiting' && Z.daysFrom(t.due) <= 0),
    week: all.filter((t) => t.state !== 'done' && t.state !== 'waiting' && Z.daysFrom(t.due) <= 7),
    waiting: all.filter((t) => t.state === 'waiting'),
    done: all.filter((t) => t.state === 'done'),
  }
  const names = { today: 'Today', week: 'This week', waiting: 'Waiting', done: 'Done' }
  return { tabs: `<div class="ttabs">${Object.keys(sets).map((k) => `<button aria-pressed="${tab === k}" data-act="ttab" data-k="${k}">${names[k]}<span class="c">${sets[k].length}</span></button>`).join('')}</div>`, list: sets[tab] }
}
const agentsCard = () => {
  const groups = {}
  D.agents.filter(roleOk).forEach((a) => (groups[a.group] ??= []).push(a))
  return Z.box('Agents', Object.entries(groups).map(([g, as]) => `<div class="rail-sec" style="padding-left:0">${esc(g)}</div>` + as.map((a) => `<div class="ag"><span class="dot" style="background:${S.on[a.id] ? 'var(--good)' : 'var(--edge)'}"></span><button class="nm ell" style="text-align:left" data-act="agent" data-id="${a.id}" data-tip="${esc(a.does)}">${esc(a.name)}<small>${esc(D.modules.find((m) => m.id === a.module).name)}</small></button><button class="switch" role="switch" aria-checked="${!!S.on[a.id]}" data-act="toggle" data-id="${a.id}" data-tip="${S.on[a.id] ? 'On: runs ' + esc(a.when.toLowerCase()) : 'Off: turn it on to run ' + esc(a.when.toLowerCase())}"></button></div>`).join('')).join(''), `<button class="btn sm ghost" data-act="go" data-at="agents">All agents</button>`)
}
const finder = () => {
  if (!S.found) return ''
  const q = S.found.toLowerCase(), hits = []
  for (const [k, t] of Object.entries(D.tables)) for (const r of t.rows) if (String(r[t.title]).toLowerCase().includes(q)) hits.push([k, r])
  const mods = D.modules.filter((m) => m.name.toLowerCase().includes(q))
  return `<div class="found">${mods.map((m) => `<button data-act="mod" data-m="${m.id}">${ic(m.icon)} ${esc(m.name)} <span class="mute3">module</span></button>`).join('')}${hits.slice(0, 8).map(([k, r]) => `<button data-act="row" data-t="${k}" data-id="${r.id}">${ic('file-text')} <span class="ell">${esc(r[D.tables[k].title])}</span> <span class="mute3">${esc(D.tables[k].one)}</span></button>`).join('') || (mods.length ? '' : '<div class="mute" style="padding:8px">Nothing by that name.</div>')}</div>`
}
const home = () => {
  const mine = tasksMine(), due = mine.filter((t) => t.state !== 'done' && t.state !== 'waiting' && Z.daysFrom(t.due) <= 0)
  const { tabs, list } = taskTabs(mine)
  const on = D.agents.filter(roleOk).filter((a) => S.on[a.id]).length
  return `<div class="wrap">
    <label class="search">${ic('magnifying-glass')}<input data-keep="find" placeholder="Find a ${esc(D.findHint)}, a task or a module" value="${esc(S.found)}" data-find><kbd>⌘K</kbd>${finder()}</label>
    <div class="counts">
      ${Z.count(needsOpen().length, 'things need you', needsOpen().length ? 'Review' : 'All done', 'data-act="toneeds"')}
      ${Z.count(on, `of ${D.agents.filter(roleOk).length} agents active`, 'Open agents', 'data-act="go" data-at="agents"')}
      ${Z.count(due.length, `tasks due, ${due.filter((t) => Z.daysFrom(t.due) < 0).length} overdue`, 'Start', 'data-act="go" data-at="tasks"')}
      ${Z.count(S.journal.length, 'things changed', 'See changes', 'data-act="go" data-at="activity"')}
    </div>
    <div class="cols"><div class="stack">${needsBox()}
      <section class="box"><div class="box-h"><h2>Today and overdue <span class="chip acc">${due.length}</span></h2><button class="btn sm ghost" data-act="go" data-at="tasks">All tasks</button></div>${tabs}<div class="items">${list.map(taskItem).join('') || '<div class="it"><span></span><div class="mute">Nothing here.</div></div>'}</div></section></div>
      <div class="stack">${D.homeSide ? D.homeSide(Z, S.role) : ''}${agentsCard()}</div></div></div>`
}
const TLISTS = { all: 'All', today: 'Today', week: 'This week', overdue: 'Overdue', waiting: 'Waiting', done: 'Done' }
const TSTATES = [['todo', 'To do', 'o8'], ['doing', 'Doing', 'o1'], ['waiting', 'Waiting', 'warn'], ['done', 'Done', 'good']]
const taskLists = (all) => {
  const open = (t) => t.state !== 'done'
  return { all, today: all.filter((t) => open(t) && Z.daysFrom(t.due) <= 0), week: all.filter((t) => open(t) && Z.daysFrom(t.due) <= 7), overdue: all.filter((t) => open(t) && Z.daysFrom(t.due) < 0), waiting: all.filter((t) => t.state === 'waiting'), done: all.filter((t) => t.state === 'done') }
}
const taskCard = (t) => {
  const r = t.row && Z.row(...t.row), n = Z.daysFrom(t.due)
  return `<div class="cardv tcard" draggable="true" data-drag="${t.id}" data-tip="Drag to another column to change its state"><b>${esc(t.title)}</b>${r ? `<button class="link ell" style="text-align:left" data-act="row" data-t="${t.row[0]}" data-id="${t.row[1]}">${esc(D.tables[t.row[0]].name)} › ${esc(titleOf(t.row[0], r))}</button>` : ''}<span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="dt ${n < 0 && t.state !== 'done' ? 'late' : ''}">${ic('calendar-blank')} ${Z.wday(t.due)}</span>${t.by ? Z.chip(t.by, 'o8') : Z.chip(Z.you().split(' ')[0], 'acc')}${t.state === 'waiting' ? `<span class="mute3" style="font-size:12px">on ${esc(t.on || 'a reply')}</span>` : ''}</span></div>`
}
const tasksPage = () => {
  const list = taskLists(tasksMine())[S.tlist], v = S.tview
  const tool = `<div class="toolbar"><span class="tabs">${[['board', 'kanban', 'Board'], ['list', 'list', 'List'], ['calendar', 'calendar-blank', 'Calendar']].map(([k, i, l]) => `<button aria-pressed="${v === k}" data-act="tview" data-k="${k}">${ic(i)} ${l}</button>`).join('')}</span><span class="sp"></span><span class="mute3" style="font-size:13px">Agents add tasks; you, or they, finish them.</span></div>`
  let body
  if (v === 'board') body = `<div class="board">${TSTATES.map(([k, l, tone]) => { const xs = list.filter((t) => t.state === k); return `<div class="lane" data-lane="${k}" data-t="__tasks"><h3>${Z.chip(l, tone)}<span class="mute3">${xs.length}</span></h3>${xs.map(taskCard).join('') || '<span class="mute3" style="font-size:12px;padding:6px">Nothing here.</span>'}</div>` }).join('')}</div>`
  else if (v === 'list') body = `<section class="box"><div class="items">${list.map(taskItem).join('') || '<div class="it"><span></span><div class="mute">Nothing here.</div></div>'}</div></section>`
  else {
    const [y, mo] = D.today.slice(0, 7).split('-').map(Number), first = new Date(y, mo - 1, 1), start = new Date(y, mo - 1, 1 - first.getDay())
    const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    body = `<div class="cal">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="dh">${d}</div>`).join('')}${cells.map((d) => { const k = iso(d), evs = list.filter((t) => t.due === k); return `<div class="d ${d.getMonth() !== mo - 1 ? 'off' : ''} ${k === D.today ? 'today' : ''}"><span class="num">${d.getDate()}</span>${evs.slice(0, 3).map((t) => `<span class="ev ell chip ${TSTATES.find((x) => x[0] === t.state)[2]}" style="height:auto;display:block" data-tip="${esc(t.title)}">${esc(t.title)}</span>`).join('')}${evs.length > 3 ? `<span class="mute3">+${evs.length - 3}</span>` : ''}</div>` }).join('')}</div>`
  }
  return `<div class="wrap" style="max-width:none">${tool}${body}</div>`
}

// ---------- Settings, and the Second Brain
const settingsPage = () => {
  const last = S.journal.slice(0, 5)
  return `<div class="wrap" style="max-width:900px"><div class="stack">
    ${Z.box('Workspace', `<dl class="fields"><div class="fr"><dt>Name</dt><dd>${esc(D.brand.name)}</dd></div><div class="fr"><dt>What it does</dt><dd>${esc(D.brand.sub)}</dd></div><div class="fr"><dt>Runs on</dt><dd>${esc(D.runsOn || 'Its own server')}</dd></div><div class="fr"><dt>Modules</dt><dd>${D.modules.length}, with ${D.agents.length} agents</dd></div></dl>`, `<button class="btn sm" data-act="why">${ic('shield-check')} Where the data lives</button>`)}
    ${Z.box('People', `<div class="items">${(D.roles || []).map((r) => `<div class="it" style="grid-template-columns:auto minmax(0,1fr) auto"><span class="mk sm">${esc(r.name.split(' ').slice(0, 2).map((w) => w[0]).join(''))}</span><div><div class="ti">${esc(r.name.split(' · ')[0])}</div><div class="su">${esc(r.name.split(' · ')[1] || '')} · sees ${D.modules.filter((m) => !m.roles || m.roles.includes(r.id)).map((m) => esc(m.name)).join(', ')}</div></div>${S.role === r.id ? Z.chip('You', 'acc') : `<button class="btn sm" data-act="role" data-id="${r.id}">Switch to</button>`}</div>`).join('')}</div>`)}
    ${Z.box('Connections', `<div class="items">${(D.connections || []).map((c) => `<div class="it" style="grid-template-columns:auto minmax(0,1fr) auto"><span class="dot" style="background:${c.state === 'Needs you' ? 'var(--warn)' : 'var(--good)'}"></span><div><div class="ti">${ic(c.icon || 'plug')} ${esc(c.name)}</div><div class="su">${esc(c.what)}</div></div>${Z.chip(c.state || 'Connected', c.state === 'Needs you' ? 'warn' : 'good')}</div>`).join('')}</div>`, '', 'What Zazoo reads, and how. Nothing is copied out of the business.')}
    ${Z.box('Who approves what', `<div class="items">${Object.entries(D.levels).map(([k, l]) => `<div class="it" style="grid-template-columns:auto minmax(0,1fr)"><b class="mono">${k}</b><div><div class="ti">${Z.chip(l.name, l.tone)}</div><div class="su">${esc(l.words)} · ${D.agents.filter((a) => a.level === k).length} agents</div></div></div>`).join('')}</div>`)}
    ${Z.box('Activity', `<ul class="lines">${last.map((j) => `<li class="${j.undone ? 'undone' : ''}"><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${j.at}</time></li>`).join('')}</ul>`, `<button class="btn sm ghost" data-act="go" data-at="activity">Everything that changed</button>`)}
  </div></div>`
}
const brainPage = () => {
  const mods = D.modules, W = 800, H = 540, cx = W / 2, cy = H / 2
  const at = mods.map((m, i) => { const a = (i / mods.length) * 2 * Math.PI - Math.PI / 2; return [cx + 290 * Math.cos(a), cy + 200 * Math.sin(a), a] })
  const links = new Set()
  mods.forEach((m, i) => m.tables.forEach((t) => (D.tables[t].links || []).forEach((L) => { const j = mods.findIndex((x) => x.tables.includes(L.t)); if (j >= 0 && j !== i) links.add([Math.min(i, j), Math.max(i, j)].join('-')) })))
  ;(D.brainLinks || []).forEach(([a, b]) => { const i = mods.findIndex((m) => m.id === a), j = mods.findIndex((m) => m.id === b); if (i >= 0 && j >= 0) links.add([Math.min(i, j), Math.max(i, j)].join('-')) })
  let g = [...links].map((k) => { const [i, j] = k.split('-').map(Number); return `<path d="M${at[i][0]} ${at[i][1]} Q${cx} ${cy} ${at[j][0]} ${at[j][1]}" stroke="var(--accent)" stroke-opacity=".35" stroke-width="1.6" fill="none" stroke-dasharray="4 4"/>` }).join('')
  g += at.map(([x, y]) => `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--edge)"/>`).join('')
  g += mods.map((m, i) => {
    const [x, y, a] = at[i], rows = m.tables.reduce((s, t) => s + D.tables[t].rows.length, 0), r = 22 + Math.min(16, Math.sqrt(rows) * 1.6), ags = D.agents.filter((x) => x.module === m.id)
    const sats = [...m.tables.map((t) => ['t', D.tables[t].name + ' · ' + D.tables[t].rows.length]), ...ags.map((x) => ['a', x.name + (S.on[x.id] ? '' : ' (off)')])]
    const sat = sats.map(([k, tip], j) => { const b = a + (j - (sats.length - 1) / 2) * 0.22, sx = x + (r + 20) * Math.cos(b), sy = y + (r + 20) * Math.sin(b); return `<circle cx="${sx}" cy="${sy}" r="${k === 't' ? 5 : 4}" fill="${k === 't' ? 'var(--ink-3)' : 'var(--good)'}" data-tip="${esc(k === 't' ? 'Table: ' : 'Agent: ')}${esc(tip)}"/>` }).join('')
    return `${sat}<g data-act="mod" data-m="${m.id}" style="cursor:pointer" data-tip="${esc(m.name)}: ${rows} rows, ${ags.length} agents. Click to open."><circle cx="${x}" cy="${y}" r="${r}" fill="var(--surface)" stroke="${Z.waiting(m.id) ? 'var(--warn)' : 'var(--accent)'}" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="600">${rows}</text><text x="${x}" y="${y + r + (Math.sin(a) > 0.3 ? 30 : 16)}" text-anchor="middle" font-size="13" font-weight="500" fill="var(--ink)" stroke="var(--surface)" stroke-width="3" paint-order="stroke">${esc(m.name)}</text></g>`
  }).join('')
  g += `<circle cx="${cx}" cy="${cy}" r="34" fill="var(--accent)"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${esc(D.assistant)}</text>`
  return `<div class="wrap"><label class="search">${ic('magnifying-glass')}<input data-keep="find" placeholder="Ask across every module: a ${esc(D.findHint)}, a task" value="${esc(S.found)}" data-find>${finder()}</label>
    <div class="cols"><div class="stack">${Z.box('Every module, connected', `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Modules and how they link">${g}</svg><div class="legend"><span><i style="background:var(--surface);border:2px solid var(--accent)"></i>Module, with its rows</span><span><i style="background:var(--ink-3)"></i>Table</span><span><i style="background:var(--good)"></i>Agent</span><span><i style="background:var(--accent);opacity:.4"></i>Data shared between modules</span></div>`, '', 'Hover a dot for its name; click a module to open it')}</div>
    <div class="stack">${Z.box('What changed since you looked', `<ul class="lines">${S.journal.slice(0, 6).map((j) => `<li><span class="who">${esc(j.who)}</span><span>${j.words}</span></li>`).join('')}</ul>`)}${Z.box('What each module holds', `<div class="items">${mods.map((m) => `<button class="it" style="grid-template-columns:auto minmax(0,1fr) auto;text-align:left" data-act="mod" data-m="${m.id}">${ic(m.icon)}<div><div class="ti">${esc(m.name)}</div><div class="su">${m.tables.map((t) => `${esc(D.tables[t].name)} ${D.tables[t].rows.length}`).join(' · ')}</div></div><span class="mute3">${D.agents.filter((a) => a.module === m.id).length} agents</span></button>`).join('')}</div>`)}</div></div></div>`
}

const activityPage = () => {
  const last = S.journal.find((j) => j.snap && !j.undone)
  return `<div class="wrap" style="max-width:820px"><section class="box"><div class="box-h"><h2>Everything that changed</h2><span class="mute3" style="font-size:12px">By people and agents, newest first. Undo the latest and it all goes back.</span></div><div class="box-b"><ul class="lines">${S.journal.map((j) => `<li class="${j.undone ? 'undone' : ''}"><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${j.at}</time>${j === last ? '<button class="btn sm" data-act="undo">Undo</button>' : ''}</li>`).join('')}</ul></div></section></div>`
}

// ---------- Agents
const agentsPage = (onlyMod) => {
  const list = D.agents.filter(roleOk).filter((a) => !onlyMod || a.module === onlyMod)
  const sel = list.find((a) => a.id === S.agent) || list[0]
  if (!sel) return '<div class="mute">No agents here.</div>'
  const runs = S.runs[sel.id] || [], lv = D.levels[sel.level], mod = D.modules.find((m) => m.id === sel.module)
  const groups = D.modules.filter((m) => list.some((a) => a.module === m.id))
  const left = groups.map((m) => `<div class="axg">${ic(m.icon)} ${esc(m.name)}<span class="mute3">${list.filter((a) => a.module === m.id).length}</span></div>` + list.filter((a) => a.module === m.id).map((a) => `<div class="axa" data-act="agent" data-id="${a.id}" ${a.id === sel.id ? 'aria-current="true"' : ''} data-tip="${esc(a.does)}"><span class="dot" style="background:${S.running[a.id] ? 'var(--accent)' : S.on[a.id] ? 'var(--good)' : 'var(--edge)'}"></span><div class="nm ell"><b>${esc(a.name)}</b><div class="ell">${esc(a.when)}</div></div>${(S.amsgs[a.id] || []).length || (S.runs[a.id] || []).length ? `<span class="n">${(S.runs[a.id] || []).length + (S.amsgs[a.id] || []).filter((x) => x.me).length}</span>` : ''}</div>`).join('')).join('')
  const msgs = [{ z: true, html: `I'm the <b>${esc(sel.name)}</b>. ${sel.does} I read ${esc(sel.reads)}, ${esc(sel.when.toLowerCase())}.<div class="mute3" style="margin-top:6px">${esc(lv.name)}: ${esc(lv.words)}</div>` }, ...[...runs].reverse().map((r) => ({ z: true, run: r })), ...(S.amsgs[sel.id] || [])]
  const feed = msgs.map((m) => m.run ? `<div class="run"><div class="run-h">${ic(m.run.live ? 'circle-notch' : 'check-circle')} ${m.run.live ? 'Running' : 'Ran'} at ${m.run.at}<span style="flex:1"></span>${m.run.text ? esc(m.run.text) : ''}</div><div class="run-b">${m.run.lines.map((l) => (l.ok ? `<span class="ok">${esc(l.t)}</span>` : esc(l.t))).join('\n')}</div></div>` : `<div class="msg ${m.me ? 'me' : 'z'}">${m.html}</div>`).join('')
  return `<div class="ax"><aside class="axl"><div class="axh"><b>Agents</b><span class="mute3">${list.filter((a) => S.on[a.id]).length} of ${list.length} on</span></div><div class="axs">${left}</div></aside>
    <section class="axr"><div class="axh"><b class="ell">${esc(sel.name)}</b>${Z.chip(mod.name, 'o8')}<span data-tip="${esc(lv.words)}">${Z.chip(lv.name, lv.tone)}</span><span class="sp"></span><button class="switch" role="switch" aria-checked="${!!S.on[sel.id]}" data-act="toggle" data-id="${sel.id}" data-tip="${S.on[sel.id] ? 'On: turn it off' : 'Off: turn it on'}"></button><button class="btn pri sm" data-act="run" data-id="${sel.id}" ${S.running[sel.id] ? 'disabled' : ''}>${ic('play')} ${S.running[sel.id] ? 'Running…' : 'Run now'}</button></div>
      <div class="feed axf" id="afeed">${feed}</div>
      <div class="sugg">${['Run now', 'What did you do last?', S.on[sel.id] ? 'Pause until Monday' : 'Turn on'].map((q) => `<button data-act="asay" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form class="compose" data-agent="${sel.id}"><input name="q" data-keep="amsg" placeholder="Message ${esc(sel.name)}" autocomplete="off"><div class="row"><span class="mute3" style="font-size:12px">It answers about its own work; ask ${esc(D.assistant)} about anything else.</span><button class="send" aria-label="Send">${ic('arrow-up')}</button></div></form></section></div>`
}
const agentSay = (id, q) => {
  const a = D.agents.find((x) => x.id === id), w = q.toLowerCase(), runs = S.runs[id] || []
  ;(S.amsgs[id] ??= []).push({ me: true, html: esc(q) })
  let reply
  if (/\brun\b|go ahead|now/.test(w)) { reply = 'Running now. Each step shows above as I go.'; setTimeout(() => runAgent(id), 300) }
  else if (/pause|stop|off/.test(w)) { if (S.on[id]) Z.change(Z.you(), `paused ${esc(a.name)}`, () => (S.on[id] = false), { mod: a.module }); reply = `Paused. I won't run until you turn me on again. Anything waiting on me stays where it is.` }
  else if (/turn on|resume|start/.test(w)) { if (!S.on[id]) Z.change(Z.you(), `turned on ${esc(a.name)}`, () => (S.on[id] = true), { mod: a.module }); reply = `On. I run ${esc(a.when.toLowerCase())}.` }
  else if (/last|did|done|result/.test(w)) reply = runs.length ? `Last run at ${runs[0].at}: ${esc(runs[0].text || 'done')}.` : `Not yet in this session. My last scheduled run went as usual: ${esc(a.steps.at(-1))}.`
  else reply = a.reply?.(q, Z) || `I only ${esc(a.does.charAt(0).toLowerCase() + a.does.slice(1))} For anything else, ask ${esc(D.assistant)} on the right.`
  S.amsgs[id].push({ html: reply })
  Z.render(); const f = $('#afeed'); if (f) f.scrollTop = f.scrollHeight
}

// ---------- a module
const modulePage = () => {
  const m = D.modules.find((x) => x.id === S.route.mod), tab = S.route.tab
  if (tab === 'overview') return `<div class="wrap">${m.map ? `<section class="box" style="margin-bottom:16px"><div class="box-h"><h2>${esc(D.tables[m.map].name)} on the map</h2><button class="btn sm ghost" data-act="tab" data-k="${m.map}">Open ${esc(D.tables[m.map].name.toLowerCase())}</button></div><div class="box-b">${VIEW.map(m.map, D.tables[m.map].rows)}</div></section>` : ''}${m.overview(Z)}${overviewFoot(m)}</div>`
  if (tab === 'agents') return `<div class="wrap" style="max-width:none">${agentsPage(m.id)}<div style="height:16px"></div><div class="cols2">${notesBox(m)}${Z.box('Recent activity', `<ul class="lines">${S.journal.filter((j) => j.mod === m.id).slice(0, 8).map((j) => `<li><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${j.at}</time></li>`).join('') || '<li class="mute">Nothing yet.</li>'}</ul>`)}</div></div>`
  return `<div class="wrap" style="max-width:none">${tableArea(tab)}</div>`
}

const notesBox = (m) => Z.box('Notes', `<form class="noteform" data-note="${m.id}"><input name="q" data-keep="note-${m.id}" placeholder="Add a note for everyone on ${esc(m.name)}" autocomplete="off"><button class="btn sm">Add</button></form><ul class="notes">${S.notes.filter((n) => n.mod === m.id).map((n) => `<li><b>${esc(n.who)}</b><time>${esc(n.at)}</time><p>${esc(n.text)}</p></li>`).join('') || '<li class="mute">No notes yet.</li>'}</ul>`, '', 'Notes the team and the agents keep on this module. Agents read them before they run.')
const overviewFoot = (m) => {
  const ags = D.agents.filter(roleOk).filter((a) => a.module === m.id)
  return `<div class="cols2" style="margin-top:16px">${Z.box('Agents', ags.map((a) => `<div class="ag"><span class="dot" style="background:${S.on[a.id] ? 'var(--good)' : 'var(--edge)'}"></span><button class="nm ell" style="text-align:left" data-act="agent" data-id="${a.id}" data-tip="${esc(a.does)}">${esc(a.name)}<small>${esc(a.when)}</small></button><button class="switch" role="switch" aria-checked="${!!S.on[a.id]}" data-act="toggle" data-id="${a.id}"></button></div>`).join('') || '<p class="mute" style="font-size:13px">No agents on this module yet.</p>', `<button class="btn sm ghost" data-act="tab" data-k="agents">Agents and notes</button>`)}${notesBox(m)}</div>`
}

// the state of one table's lists and view
const ts = (t) => (S.ts[t] ??= { view: D.tables[t].view || 'table', list: 0, q: '', sort: null, page: 0, size: 50, filter: {}, group: D.tables[t].board, color: D.tables[t].map?.color || D.tables[t].board, chartBy: D.tables[t].board, chartType: 'bars', month: D.today.slice(0, 7), sel: new Set(), hidden: new Set() })
const listsOf = (t) => {
  const T = D.tables[t]
  if (T.lists) return T.lists
  const f = fieldOf(t, T.board)
  return f ? (f.choices || []).map((c) => ({ name: c, where: (r) => r[f.k] === c, tone: toneOf(f, c) })) : []
}
const shown = (t) => {
  const T = D.tables[t], st = ts(t)
  let rows = T.rows
  const L = st.list > 0 ? listsOf(t)[st.list - 1] : null
  if (L) rows = rows.filter(L.where)
  for (const [k, set] of Object.entries(st.filter)) if (set.size) rows = rows.filter((r) => set.has(r[k]))
  if (st.q) { const q = st.q.toLowerCase(); rows = rows.filter((r) => T.fields.some((f) => plain(r[f.k], f).toLowerCase().includes(q))) }
  const sort = st.sort || (T.sort && { k: T.sort[0], dir: T.sort[1] })
  if (sort) rows = [...rows].sort((a, b) => ((a[sort.k] ?? '') > (b[sort.k] ?? '') ? 1 : (a[sort.k] ?? '') < (b[sort.k] ?? '') ? -1 : 0) * (sort.dir === 'desc' ? -1 : 1))
  return rows
}
const VIEWS = { map: ['map-trifold', 'Map'], table: ['table', 'Table'], list: ['list', 'List'], card: ['squares-four', 'Card'], timeline: ['chart-bar-horizontal', 'Timeline'], calendar: ['calendar-blank', 'Calendar'], board: ['kanban', 'Board'], chart: ['chart-bar', 'Chart'] }
const viewsOf = (t) => { const T = D.tables[t]; return Object.keys(VIEWS).filter((v) => (v === 'map' ? T.map : v === 'calendar' ? T.date : v === 'timeline' ? T.span : v === 'board' || v === 'chart' ? T.board : true)) }

const tableArea = (t) => {
  const T = D.tables[t], st = ts(t), rows = shown(t), lists = listsOf(t)
  const nf = Object.values(st.filter).reduce((a, s) => a + s.size, 0)
  const differs = st.q || nf || st.sort || st.view !== (T.view || 'table')
  const chips = `<div class="lists"><button class="lb" aria-pressed="${st.list === 0}" data-act="list" data-t="${t}" data-i="0">${ic('star')} All <span class="c">${T.rows.length}</span></button>${lists.map((L, i) => `<button class="lb" aria-pressed="${st.list === i + 1}" data-act="list" data-t="${t}" data-i="${i + 1}" data-tip="${esc(L.tip || 'Saved list')}">${L.tone ? Z.chip(L.name, L.tone) : esc(L.name)} <span class="c">${T.rows.filter(L.where).length}</span></button>`).join('')}
    <span class="sp"></span>${differs ? `<button class="btn sm pri" data-act="savelist" data-t="${t}">Save as list</button><button class="btn sm" data-act="cancel" data-t="${t}">Cancel</button>` : ''}<button class="btn pri" data-act="new" data-t="${t}" data-tip="Add a ${esc(T.one)}">${ic('plus')} New</button></div>`
  const v = VIEWS[st.view]
  const extra = st.view === 'board' ? `<button class="drop" data-act="groupmenu" data-t="${t}" data-tip="Group by">${esc(fieldOf(t, st.group).label)} ${ic('caret-down')}</button>`
    : st.view === 'map' ? `<button class="drop" data-act="colormenu" data-t="${t}" data-tip="Colour the points by">${ic('palette')} ${esc(fieldOf(t, st.color).label)} ${ic('caret-down')}</button>`
    : st.view === 'chart' ? `<button class="drop" data-act="chartmenu" data-t="${t}">${esc(st.chartType === 'bars' ? 'Bars' : 'Donut')} by ${esc(fieldOf(t, st.chartBy).label)} ${ic('caret-down')}</button>` : ''
  const toolbar = `<div class="toolbar"><button class="drop" data-act="viewmenu" data-t="${t}">${ic(v[0])} ${v[1]} ${ic('caret-down')}</button>${extra}<label class="tsearch">${ic('magnifying-glass')}<input data-keep="q-${t}" data-q="${t}" placeholder="Search ${esc(T.name.toLowerCase())}" value="${esc(st.q)}"></label>
    ${st.sel.size ? `<span class="chip acc">${st.sel.size} selected</span><button class="btn sm" data-act="selclear" data-t="${t}">Clear</button>` : ''}<span class="sp"></span>
    <button class="btn ${nf ? 'pri' : ''}" data-act="filtermenu" data-t="${t}">${ic('funnel-simple')} Filter${nf ? ' · ' + nf : ''}</button><button class="iconbtn" data-act="moremenu" data-t="${t}" data-tip="Columns, export">${ic('dots-three-vertical')}</button></div>`
  return chips + toolbar + VIEW[st.view](t, rows) + (st.view === 'map' ? `<div class="sec-t" style="margin-top:18px">The same ${esc(T.name.toLowerCase())}, as a table <span class="mute3" style="font-weight:400">· sorted, filtered and searched with the map</span></div>` + VIEW.table(t, rows) : '')
}

const cellAttrs = (t, f, r) => `data-tip="${esc(srcOf(t, r, f))}"`
const VIEW = {
  table(t, rows) {
    const T = D.tables[t], st = ts(t)
    const cols = T.fields.filter((f) => !f.hide && !st.hidden.has(f.k))
    const sort = st.sort || (T.sort && { k: T.sort[0], dir: T.sort[1] })
    const pages = Math.max(1, Math.ceil(rows.length / st.size)), p = Math.min(st.page, pages - 1)
    const slice = rows.slice(p * st.size, (p + 1) * st.size)
    const head = `<th class="cb"><input type="checkbox" data-act="selall" data-t="${t}" aria-label="Select all"></th>` + cols.map((f) => `<th class="${isNum(f) ? 'n' : ''}" data-act="sort" data-t="${t}" data-k="${f.k}" data-tip="${esc((f.help ? f.help + '\n' : '') + 'Click to sort')}">${esc(f.label)}${sort?.k === f.k ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : ''}</th>`).join('')
    const body = slice.map((r) => `<tr class="${S.flash === r.id ? 'flash' : ''}"><td class="cb"><input type="checkbox" data-act="sel" data-t="${t}" data-id="${r.id}" ${st.sel.has(r.id) ? 'checked' : ''} aria-label="Select"></td>${cols.map((f) => f.k === T.title ? `<td class="nm"><button data-act="row" data-t="${t}" data-id="${r.id}">${esc(r[f.k])}</button></td>` : `<td class="${isNum(f) ? 'n' : ''}" ${cellAttrs(t, f, r)}>${Z.fmt(r[f.k], f, r)}</td>`).join('')}</tr>`).join('')
    const pg = Array.from({ length: Math.min(pages, 7) }, (_, i) => `<button ${i === p ? 'aria-current="page"' : ''} data-act="page" data-t="${t}" data-p="${i}">${i + 1}</button>`).join('')
    return `<div class="grid"><div class="gscroll"><table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td colspan="${cols.length + 1}" style="height:120px"></td></tr>`}</tbody></table></div>
      <div class="gfoot">${rows.length} rows<span class="sp"></span>Showing ${rows.length ? p * st.size + 1 : 0} to ${Math.min(rows.length, (p + 1) * st.size)} of ${rows.length}<button class="drop" style="height:26px" data-act="sizemenu" data-t="${t}">${st.size} a page ${ic('caret-down')}</button><div class="pg">${pg}</div></div></div>`
  },
  list(t, rows) {
    const T = D.tables[t], f2 = T.fields.filter((f) => !f.hide && f.k !== T.title)
    const bf = fieldOf(t, T.board), df = fieldOf(t, T.date)
    return `<section class="box lv"><div class="items">${rows.slice(0, 80).map((r) => `<div class="it" data-act="row" data-t="${t}" data-id="${r.id}"><div><div class="ti">${esc(r[T.title])}</div><div class="su">${f2.slice(0, 3).map((f) => plain(r[f.k], f)).filter(Boolean).map(esc).join(' · ')}</div></div><div style="display:flex;gap:8px;align-items:center">${bf ? Z.fmt(r[bf.k], bf) : ''}${df ? `<span class="dt">${Z.fmt(r[df.k], df)}</span>` : ''}</div></div>`).join('')}</div></section>`
  },
  card(t, rows) {
    const T = D.tables[t], f2 = T.fields.filter((f) => !f.hide && f.k !== T.title).slice(0, 5)
    return `<div class="cards">${rows.slice(0, 60).map((r) => `<div class="cardv" data-act="row" data-t="${t}" data-id="${r.id}"><b>${esc(r[T.title])}</b>${f2.map((f) => `<span>${esc(f.label)}: ${Z.fmt(r[f.k], f, r)}</span>`).join('')}</div>`).join('')}</div>`
  },
  board(t, rows) {
    const T = D.tables[t], st = ts(t), gf = fieldOf(t, st.group), f2 = T.fields.filter((f) => !f.hide && f.k !== T.title && f.k !== gf.k).slice(0, 3)
    return `<div class="board">${gf.choices.map((c) => { const xs = rows.filter((r) => r[gf.k] === c); return `<div class="lane" data-lane="${esc(c)}" data-t="${t}" data-k="${gf.k}"><h3>${Z.chip(c, toneOf(gf, c))}<span class="mute3">${xs.length}</span></h3>${xs.slice(0, 30).map((r) => `<div class="cardv" draggable="true" data-drag="${r.id}" data-act="row" data-t="${t}" data-id="${r.id}" data-tip="Drag to another column to change ${esc(gf.label.toLowerCase())}"><b>${esc(r[T.title])}</b>${f2.map((f) => `<span>${esc(f.label)}: ${Z.fmt(r[f.k], f, r)}</span>`).join('')}</div>`).join('')}${xs.length > 30 ? `<span class="mute3" style="font-size:12px;padding:4px">+${xs.length - 30} more</span>` : ''}</div>` }).join('')}</div>`
  },
  calendar(t, rows) {
    const T = D.tables[t], st = ts(t), df = fieldOf(t, T.date), bf = fieldOf(t, T.board)
    const [y, mo] = st.month.split('-').map(Number), first = new Date(y, mo - 1, 1), start = new Date(y, mo - 1, 1 - first.getDay())
    const cells = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const title = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return `<div class="toolbar"><button class="iconbtn" data-act="month" data-t="${t}" data-d="-1" data-tip="Previous month">${ic('caret-left')}</button><b style="font:600 15px var(--display)">${title}</b><button class="iconbtn" data-act="month" data-t="${t}" data-d="1" data-tip="Next month">${ic('caret-right')}</button><span class="mute3" style="font-size:12px">by ${esc(df.label.toLowerCase())}</span></div>
      <div class="cal">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="dh">${d}</div>`).join('')}${cells.map((d) => { const k = iso(d), evs = rows.filter((r) => r[df.k] === k); return `<div class="d ${d.getMonth() !== mo - 1 ? 'off' : ''} ${k === D.today ? 'today' : ''}"><span class="num">${d.getDate()}</span>${evs.slice(0, 3).map((r) => { const tone = bf ? toneOf(bf, r[bf.k]) : 'acc'; return `<span class="ev ell chip ${tone}" style="height:auto;display:block" data-act="row" data-t="${t}" data-id="${r.id}" data-tip="${esc(r[T.title])}">${esc(r[T.title])}</span>` }).join('')}${evs.length > 3 ? `<span class="mute3">+${evs.length - 3}</span>` : ''}</div>` }).join('')}</div>`
  },
  timeline(t, rows) {
    const T = D.tables[t], { start, end } = T.span, bf = fieldOf(t, T.board)
    const rs = rows.filter((r) => r[start] && r[end]).slice(0, 40)
    if (!rs.length) return '<div class="mute">Nothing with dates.</div>'
    const lo = Math.min(...rs.map((r) => T12(r[start]))), hi = Math.max(...rs.map((r) => T12(r[end])), T12(D.today))
    const pos = (iso) => ((T12(iso) - lo) / (hi - lo || 1)) * 100
    const marks = Array.from({ length: 6 }, (_, i) => new Date(lo + ((hi - lo) * i) / 5).toISOString().slice(0, 10))
    return `<div class="tl"><div class="tl-head"><span style="padding:0 12px">${esc(T.one[0].toUpperCase() + T.one.slice(1))}</span><div class="ticks">${marks.map((m) => `<span style="left:${pos(m)}%">${Z.day(m)}</span>`).join('')}</div></div>
      ${rs.map((r) => `<div class="tl-row"><button class="nm ell" style="text-align:left" data-act="row" data-t="${t}" data-id="${r.id}">${esc(r[T.title])}</button><div class="track"><span class="todayline" style="left:${pos(D.today)}%"></span><span class="span" style="left:${pos(r[start])}%;width:${Math.max(0.8, pos(r[end]) - pos(r[start]))}%;background:${bf ? toneColor(toneOf(bf, r[bf.k])) : 'var(--accent)'}" data-act="row" data-t="${t}" data-id="${r.id}" data-tip="${esc(r[T.title])}\n${Z.day(r[start])} → ${Z.day(r[end])}"></span></div></div>`).join('')}</div>`
  },
  chart(t, rows) {
    const st = ts(t), f = fieldOf(t, st.chartBy)
    const parts = f.choices.map((c) => ({ label: c, value: rows.filter((r) => r[f.k] === c).length, color: toneColor(toneOf(f, c)) }))
    return Z.box(`${esc(D.tables[t].name)} by ${esc(f.label.toLowerCase())}`, st.chartType === 'bars' ? Z.chart.bar(parts, { fmt: (v) => Math.round(v) }) : Z.chart.donut(parts, { fmt: (v) => Math.round(v), sub: D.tables[t].name.toLowerCase() }))
  },
  map(t, rows) {
    const T = D.tables[t], st = ts(t), M = T.map, cf = fieldOf(t, st.color)
    const all = T.rows.filter((r) => r[M.lat] != null)
    const W = 900, H = 520, pad = 50
    const lats = all.map((r) => r[M.lat]), lngs = all.map((r) => r[M.lng])
    const b = M.bounds || { s: Math.min(...lats), n: Math.max(...lats), w: Math.min(...lngs), e: Math.max(...lngs) }
    const k = Math.cos(((b.s + b.n) / 2) * Math.PI / 180)
    const sx = (W - 2 * pad) / ((b.e - b.w) * k || 1), sy = (H - 2 * pad) / (b.n - b.s || 1), sc = Math.min(sx, sy)
    const ox = (W - (b.e - b.w) * k * sc) / 2, oy = (H - (b.n - b.s) * sc) / 2
    const proj = (lat, lng) => [ox + (lng - b.w) * k * sc, oy + (b.n - lat) * sc]
    const sf = M.size && fieldOf(t, M.size), smax = sf ? Math.max(...all.map((r) => r[sf.k] || 0)) : 1
    const grid = Array.from({ length: 12 }, (_, i) => `<line x1="${(i * W) / 11}" y1="0" x2="${(i * W) / 11}" y2="${H}" stroke="var(--hair)"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${(i * H) / 6}" x2="${W}" y2="${(i * H) / 6}" stroke="var(--hair)"/>`).join('')
    const pts = rows.filter((r) => r[M.lat] != null).map((r) => {
      const [x, y] = proj(r[M.lat], r[M.lng]), rad = sf ? 4 + 8 * Math.sqrt((r[sf.k] || 0) / (smax || 1)) : 6
      const tip = [r[T.title], ...(M.tip || []).map((k2) => { const f = fieldOf(t, k2); return `${f.label}: ${plain(r[k2], f)}` })].join('\n')
      return `<circle class="pt" cx="${x}" cy="${y}" r="${rad}" fill="${cf ? toneColor(toneOf(cf, r[cf.k])) : 'var(--accent)'}" fill-opacity=".85" stroke="#fffdf9" stroke-width="1.5" data-act="row" data-t="${t}" data-id="${r.id}" data-tip="${esc(tip)}"/>`
    }).join('')
    const legend = cf ? cf.choices.map((c) => `<span><i style="background:${toneColor(toneOf(cf, c))}"></i>${esc(c)} <span class="mute3">${rows.filter((r) => r[cf.k] === c).length}</span></span>`).join('') : ''
    return `<div class="mapwrap"><svg viewBox="0 0 ${W} ${H}" width="100%" style="background:#f3efe6;max-height:calc(100dvh - 330px);min-height:280px" role="img" aria-label="${esc(T.name)} on a map">${grid}${M.base ? M.base(proj, Z) : ''}${pts}${M.layers ? M.layers(proj, Z) : ''}</svg>
      <div class="maplegend">${legend}${M.legend || ''}<span style="flex:1"></span><span class="mute3">${rows.length} on the map · ${sf ? 'size: ' + esc(sf.label.toLowerCase()) + ' · ' : ''}hover a point, click to open</span></div></div>`
  },
}

// ---------- where a value came from
const srcOf = (t, r, f) => {
  const s = S.srcs[`${t}.${r.id}.${f.k}`]
  if (s) return `${s.who}, ${s.when}`
  return typeof f.src === 'function' ? f.src(r) : f.src || 'Entered in the window'
}

// ---------- the row panel
const sidePanel = () => {
  if (!S.panel) return ''
  if (S.panel.form) return formPanel(S.panel.form)
  const { t, id, open } = S.panel, T = D.tables[t], r = Z.row(t, id)
  if (!r) return ''
  const rows = shown(t), i = rows.findIndex((x) => x.id === id)
  const fields = T.fields.map((f) => `<div class="fr"><dt data-tip="${esc(f.help || '')}">${esc(f.label)}</dt><dd data-act="src" data-k="${f.k}" data-tip="${esc(srcOf(t, r, f))}\nClick for the source">${Z.fmt(r[f.k], f, r)}</dd>${open === f.k ? srcBlock(t, r, f) : ''}</div>`).join('')
  const tasks = S.tasks.filter((x) => x.row?.[0] === t && x.row[1] === id)
  const needs = S.needs.filter((x) => x.row?.[0] === t && x.row[1] === id && !x.done)
  const lines = S.journal.filter((j) => j.row === id)
  const links = (T.links || []).map((L) => { const xs = D.tables[L.t].rows.filter((x) => L.by(r, x)); return xs.length ? `<div class="sec-t">${esc(L.label)} <span class="mute3">${xs.length}</span></div><div class="items" style="border:1px solid var(--line);border-radius:10px">${xs.slice(0, 6).map((x) => `<div class="it" style="grid-template-columns:minmax(0,1fr) auto;cursor:pointer" data-act="row" data-t="${L.t}" data-id="${x.id}"><div class="ti" style="font-size:13px">${esc(x[D.tables[L.t].title])}</div><span class="dt">${(L.show || []).map((k) => Z.fmt(x[k], fieldOf(L.t, k), x)).join(' ')}</span></div>`).join('')}</div>` : '' }).join('')
  return `<div class="scrim" data-act="close"></div><aside class="side" aria-label="${esc(r[T.title])}"><div class="side-h">${ic(D.modules.find((m) => m.tables.includes(t))?.icon || 'table')} ${esc(T.name)}<span class="sp"></span>
    <button class="iconbtn" data-act="step" data-d="-1" ${i <= 0 ? 'disabled' : ''} data-tip="Previous">${ic('caret-up')}</button><button class="iconbtn" data-act="step" data-d="1" ${i < 0 || i >= rows.length - 1 ? 'disabled' : ''} data-tip="Next">${ic('caret-down')}</button><button class="iconbtn" data-act="close" data-tip="Close (Esc)">${ic('x')}</button></div>
    <div class="side-b"><h2>${esc(r[T.title])}</h2>${T.sub ? `<div class="sub">${T.sub(r)}</div>` : ''}
      ${needs.map((n) => `<div class="callout">${ic('sparkle')} <b>${esc(n.agent)}:</b> ${n.title}<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${n.acts.map((a, j) => `<button class="btn sm ${a.pri ? 'pri' : ''}" data-act="need" data-id="${n.id}" data-i="${j}">${esc(a.label)}</button>`).join('')}</div></div>`).join('')}
      ${T.detail ? T.detail(r, Z) : ''}
      <div class="sec-t">Fields <span class="mute3" style="font-weight:400">· click a value to see where it came from</span></div><dl class="fields">${fields}</dl>
      ${links}
      ${tasks.length ? `<div class="sec-t">Tasks</div><div class="items" style="border:1px solid var(--line);border-radius:10px">${tasks.map(taskItem).join('')}</div>` : ''}
      ${lines.length ? `<div class="sec-t">History</div><ul class="lines">${lines.map((j) => `<li><span class="who">${esc(j.who)}</span><span>${j.words}</span><time>${j.at}</time></li>`).join('')}</ul>` : ''}
    </div></aside>`
}
const srcBlock = (t, r, f) => {
  const s = S.srcs[`${t}.${r.id}.${f.k}`], editing = S.panel.edit === f.k
  const words = s ? s.who : typeof f.src === 'function' ? f.src(r) : f.src || 'Entered in the window'
  return `<div class="src"><div class="who">${Z.chip(s ? 'You said' : f.computed ? 'Computed' : 'Read', s ? 'acc' : f.computed ? 'o3' : 'o1')}<span>${esc(words)}</span></div><span class="mute3">${s ? s.when : f.computed ? 'Updates when its inputs change' : D.srcWhen || 'Last read this morning'}</span>
    ${f.computed ? '' : editing ? `<form data-correct style="display:flex;gap:6px"><input name="v" value="${esc(r[f.k] ?? '')}" data-keep="correct" ${f.choices ? `list="ch-${f.k}"` : ''}>${f.choices ? `<datalist id="ch-${f.k}">${f.choices.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>` : ''}<button class="btn sm pri">Save</button></form>` : `<div><button class="btn sm" data-act="correct" data-k="${f.k}">Correct it</button></div>`}</div>`
}
const formPanel = (t) => {
  const T = D.tables[t]
  return `<div class="scrim" data-act="close"></div><aside class="side"><div class="side-h">${ic('plus')} New ${esc(T.one)}<span class="sp"></span><button class="iconbtn" data-act="close">${ic('x')}</button></div>
    <form class="side-b" data-newrow="${t}"><h2>New ${esc(T.one)}</h2><div class="fields">${T.fields.filter((f) => !f.computed && !f.hide).map((f) => `<label class="fr"><dt>${esc(f.label)}</dt><dd style="cursor:auto">${f.choices ? `<select name="${f.k}" style="width:100%;border:1px solid var(--line);border-radius:6px;padding:4px">${f.choices.map((c) => `<option>${esc(c)}</option>`).join('')}</select>` : `<input name="${f.k}" type="${f.kind === 'date' ? 'date' : isNum(f) ? 'number' : 'text'}" style="width:100%;border:1px solid var(--line);border-radius:6px;padding:4px 8px" ${f.k === T.title ? 'required data-keep="newtitle"' : ''}>`}</dd></label>`).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:16px"><button class="btn pri">Add ${esc(T.one)}</button><button type="button" class="btn" data-act="close">Cancel</button></div></form></aside>`
}

// ---------- the assistant
const face = (busy) => `<svg class="face" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="${busy ? '#e8a47e' : '#d9a184'}"/><circle cx="14" cy="14" r="13" fill="url(#fs)" opacity=".0"/><ellipse cx="10" cy="13" rx="2" ry="2.6" fill="#1d2230"/><ellipse cx="18" cy="13" rx="2" ry="2.6" fill="#1d2230"/><circle cx="10.6" cy="12.2" r=".7" fill="#fff"/><circle cx="18.6" cy="12.2" r=".7" fill="#fff"/><circle cx="7.5" cy="17.5" r="1.8" fill="#f2a0a8" opacity=".7"/><circle cx="20.5" cy="17.5" r="1.8" fill="#f2a0a8" opacity=".7"/><path d="M11.5 18.5q2.5 2 5 0" stroke="#1d2230" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`
const chatPanel = () => {
  const cards = S.needs.filter(roleOk).filter((n) => !n.done).slice(0, 3)
  const busy = Object.keys(S.running).length > 0
  return `<aside class="chat" aria-label="${esc(D.assistant)}"><div class="chat-h"><button class="iconbtn" data-act="chat" data-tip="Fold">${ic('sidebar-simple')}</button>${face(busy)}<b>${esc(D.assistant)}</b><button class="iconbtn" data-act="newchat" data-tip="New conversation">${ic('pencil-simple')}</button><button class="iconbtn" data-act="go" data-at="activity" data-tip="What changed">${ic('bell')}</button></div>
    <div class="feed" id="feed"><div class="msg z brief">${D.brief(Z, S.role)}</div>
      ${cards.map((n) => `<div class="acard"><div class="ah">${ic('robot')} ${esc(n.agent)}<span class="sp"></span><span class="chip ${D.levels[n.level]?.tone || 'acc'}" style="height:18px">${n.level === 'A' ? 'Done, for a look' : 'Needs approval'}</span></div><div class="ab"><b style="font-weight:500">${n.title}</b>${n.quote ? `<div class="wa">${esc(n.quote)}<small>${esc(n.quoteFrom || '')}</small></div>` : ''}<div class="acts">${n.acts.map((a, j) => `<button class="btn sm ${a.pri ? 'pri' : ''}" data-act="need" data-id="${n.id}" data-i="${j}">${esc(a.label)}</button>`).join('')}</div></div></div>`).join('')}
      ${S.msgs.map((m) => `<div class="msg ${m.me ? 'me' : 'z'}">${m.html}</div>`).join('')}</div>
    <div class="sugg">${D.ask.filter(roleOk).filter((a) => !S.asked.has(a.q)).slice(0, 3).map((a) => `<button data-act="ask" data-i="${D.ask.indexOf(a)}">${esc(a.q)}</button>`).join('')}</div>
    <form class="compose" data-ask><input name="q" data-keep="ask" placeholder="Message ${esc(D.assistant)}, or @ an agent" autocomplete="off"><div class="row"><button type="button" class="iconbtn" data-act="attach" data-tip="Add a file">${ic('plus')}</button><button class="send" aria-label="Send">${ic('arrow-up')}</button></div></form></aside>`
}
const answer = (i, typed) => {
  const a = D.ask[i]
  S.asked.add(a.q)
  S.msgs.push({ me: true, html: esc(typed || a.q) }, { html: `<span class="mute3">${ic('sparkle')} Reading ${esc(a.reads)}…</span>` })
  S.chat = true
  Z.render(); scrollFeed()
  setTimeout(() => { S.msgs.pop(); S.msgs.push({ html: a.a(Z) }); Z.render(); scrollFeed() }, 700)
}
const scrollFeed = () => { const f = $('#feed'); if (f) f.scrollTop = f.scrollHeight }

// ---------- running an agent
const runAgent = (id) => {
  const a = D.agents.find((x) => x.id === id)
  if (S.running[id]) return
  const run = { at: clock(), lines: [], live: true }
  ;(S.runs[id] ??= []).unshift(run)
  S.running[id] = true
  S.agent = id
  Z.render()
  let i = 0
  const step = () => {
    if (i < a.steps.length) { run.lines.push({ t: a.steps[i++] }); Z.render(); return setTimeout(step, 550) }
    const snap = snapshot()
    const out = a.run(Z) || {}
    for (const n of out.needs || []) S.needs.unshift({ id: `${id}-${S.tick}-${Math.random().toString(36).slice(2, 6)}`, agent: a.name, module: a.module, level: a.level, date: 'Just now', ...n })
    for (const t of out.tasks || []) S.tasks.unshift({ id: `t-${Math.random().toString(36).slice(2, 7)}`, by: a.name, state: 'todo', due: D.today, ...t })
    D.after?.(Z)
    run.lines.push({ t: '✓ ' + (out.text || 'Done'), ok: true })
    run.text = out.text
    run.live = false
    delete S.running[id]
    log(a.name, out.text || 'ran', { snap, mod: a.module, row: out.row })
    if (out.row) S.flash = out.row
    Z.toast(`${esc(a.name)}: ${esc(out.text || 'done')}${out.needs?.length ? ' · it needs you on Home' : ''}`, true)
    Z.render()
  }
  setTimeout(step, 450)
}

// ---------- menus
const menu = (el, items) => {
  const r = el.getBoundingClientRect()
  S.menu = { x: Math.min(r.left, innerWidth - 230), y: r.bottom + 4, items }
  Z.render()
}
const menuHtml = () => S.menu ? `<div class="menu" style="left:${S.menu.x}px;top:${S.menu.y}px" role="menu">${S.menu.items.map((it, i) => it === '-' ? '<hr>' : it.h ? `<div class="h">${esc(it.h)}</div>` : `<button role="menuitem" data-act="mi" data-i="${i}"><span class="ck">${it.on ? '✓' : ''}</span>${it.icon ? ic(it.icon) : ''}${esc(it.label)}</button>`).join('')}</div>` : ''

// ---------- render
Z.render = () => {
  const keep = document.activeElement?.dataset?.keep, pos = document.activeElement?.selectionStart
  const scroll = $('.page')?.scrollTop, feedScroll = $('#feed')?.scrollTop
  let page
  if (S.route.at === 'home') page = home()
  else if (S.route.at === 'agents') page = `<div class="wrap" style="max-width:none">${agentsPage()}</div>`
  else if (S.route.at === 'tasks') page = tasksPage()
  else if (S.route.at === 'activity') page = activityPage()
  else if (S.route.at === 'settings') page = settingsPage()
  else if (S.route.at === 'brain') page = brainPage()
  else page = modulePage()
  $('#app').innerHTML = `<div class="strip">${ic('flask')}<span><b>Interactive prototype</b> · every name and number is made up<span class="hide-sm"> · nothing leaves this tab</span></span><span class="sp"></span><a href="./">All demos</a><a href="#" data-act="reset">Start over</a></div>
    <div class="win ${S.chat ? 'chatopen' : 'nochat'} ${S.railFold ? 'railfold' : ''}">${rail()}<div class="main">${bar()}<div class="page">${page}</div>${sidePanel()}${S.why ? whyPanel() : ''}</div>${chatPanel()}</div>
    <button class="fab" data-act="chat" aria-label="Open ${esc(D.assistant)}">${ic('chat-circle-dots')}</button>
    ${menuHtml()}${S.toast ? `<div class="toast">${S.toast.words}${S.toast.undo ? '<button data-act="undo">Undo</button>' : ''}</div>` : ''}<div id="tip"></div>`
  const p = $('.page'); if (p && scroll) p.scrollTop = scroll
  const f = $('#feed'); if (f && feedScroll != null) f.scrollTop = feedScroll
  const af = $('#afeed'); if (af) af.scrollTop = af.scrollHeight
  if (keep) { const el = document.querySelector(`[data-keep="${keep}"]`); if (el) { el.focus(); try { el.setSelectionRange(pos, pos) } catch {} } }
  S.flash = null
}
const whyPanel = () => `<div class="scrim" data-act="close"></div><aside class="side"><div class="side-h">${ic('shield-check')} Where the data lives<span class="sp"></span><button class="iconbtn" data-act="close">${ic('x')}</button></div><div class="side-b">${D.why}</div></aside>`

// ---------- events
const tip = (el) => {
  const t = $('#tip'); if (!t) return
  if (!el) return t.classList.remove('on')
  t.textContent = el.dataset.tip
  const r = el.getBoundingClientRect()
  t.classList.add('on')
  const w = t.offsetWidth, h = t.offsetHeight
  let x = el.dataset.tipside === 'r' ? r.right + 8 : r.left + r.width / 2 - w / 2, y = el.dataset.tipside === 'r' ? r.top + r.height / 2 - h / 2 : r.top - h - 8
  if (y < 34) y = r.bottom + 8
  t.style.left = Math.max(8, Math.min(innerWidth - w - 8, x)) + 'px'
  t.style.top = y + 'px'
}
document.addEventListener('mouseover', (e) => {
  let el = e.target.closest('[data-tip]')
  if (el && !el.dataset.tip) el = null
  // text cut short shows itself in full on hover
  if (!el) { const c = e.target.closest('td,.ell,.ti'); if (c && c.scrollWidth > c.clientWidth + 1) { c.dataset.tip = c.textContent.trim(); el = c } }
  if (el && el.closest('.ri') && !S.railFold && innerWidth > 980) el = null
  tip(el)
})
document.addEventListener('scroll', () => tip(null), true)

const act = {
  go: (el) => go(el.dataset.at),
  mod: (el) => { const m = D.modules.find((x) => x.id === el.dataset.m); go('module', { mod: m.id, tab: m.overview ? 'overview' : m.tables[0] }) },
  tab: (el) => { S.route.tab = el.dataset.k; S.panel = null; Z.render() },
  back: () => { S.hist.pop(); const prev = S.hist.pop(); prev ? go(prev.at, prev) : go('home') },
  row: (el) => { S.panel = { t: el.dataset.t, id: el.dataset.id }; S.found = ''; Z.render() },
  close: () => { S.panel = null; S.why = false; Z.render() },
  step: (el) => { const rows = shown(S.panel.t), i = rows.findIndex((x) => x.id === S.panel.id), n = rows[i + +el.dataset.d]; if (n) { S.panel = { t: S.panel.t, id: n.id }; Z.render() } },
  src: (el) => { S.panel.open = S.panel.open === el.dataset.k ? null : el.dataset.k; S.panel.edit = null; Z.render() },
  correct: (el) => { S.panel.edit = el.dataset.k; Z.render() },
  why: () => { S.why = true; Z.render() },
  chat: () => { S.chat = !S.chat; Z.render() },
  railfold: () => { S.railFold = !S.railFold; Z.render() },
  newchat: () => { S.msgs = []; S.asked.clear(); Z.render() },
  attach: () => Z.toast('In the live Zazoo you drop a file here and it is read into the right table.') || Z.render(),
  nomod: () => { Z.toast(`In the live Zazoo you describe what to keep track of and ${esc(D.assistant)} builds the module.`); Z.render() },
  reset: () => location.reload(),
  toneeds: () => { S.route.at !== 'home' ? go('home') : 0; $('#needs')?.scrollIntoView({ behavior: 'smooth' }) },
  needsmode: (el) => menu(el, [{ label: 'By agent', icon: 'robot', on: S.needsMode !== 'list', run: () => (S.needsMode = 'agent') }, { label: 'List', icon: 'list', on: S.needsMode === 'list', run: () => (S.needsMode = 'list') }]),
  opneed: (el) => { S.openNeed = S.openNeed === el.dataset.id ? null : el.dataset.id; Z.render() },
  need: (el) => {
    const n = S.needs.find((x) => x.id === el.dataset.id), a = n.acts[+el.dataset.i]
    const snap = snapshot()
    const words = a.run ? a.run(Z, n) : a.label
    n.done = true; n.justDone = true; n.doneWords = a.done || 'Done'
    for (const t of a.tasks?.(Z) || []) S.tasks.unshift({ id: `t-${Math.random().toString(36).slice(2, 7)}`, by: Z.you(), state: 'todo', due: D.today, ...t })
    D.after?.(Z)
    log(Z.you(), words, { snap, mod: n.module, row: n.row?.[1] })
    if (n.row) S.flash = n.row[1]
    Z.toast(esc(words), true); Z.render()
  },
  ttab: (el) => { S.taskTab = el.dataset.k; Z.render() },
  tlist: (el) => { S.tlist = el.dataset.k; Z.render() },
  tview: (el) => { S.tview = el.dataset.k; Z.render() },
  asay: (el) => agentSay(S.agent || D.agents.filter(roleOk).find((a) => S.route.at !== 'module' || a.module === S.route.mod).id, el.dataset.q),
  role: (el) => { S.role = el.dataset.id; Z.toast(`You are ${esc(D.you(S.role))} now`); Z.render() },
  tnext: (el) => {
    const t = S.tasks.find((x) => x.id === el.dataset.id), to = el.dataset.to
    if (to === 'chase') { Z.change(Z.you(), `chased: ${esc(t.title)}`, () => {}); Z.toast(`${esc(D.assistant)} drafted a chaser; it is in your outbox for a look`, true); return Z.render() }
    Z.change(Z.you(), `${to === 'doing' ? 'started' : 'finished'}: ${esc(t.title)}`, () => (t.state = to), { row: t.row?.[1] })
    if (to === 'done') Z.toast(`Done: ${esc(t.title)}`, true)
    Z.render()
  },
  tdone: (el) => { const t = S.tasks.find((x) => x.id === el.dataset.id); Z.change(Z.you(), `${t.state === 'done' ? 'reopened' : 'finished'}: ${esc(t.title)}`, () => (t.state = t.state === 'done' ? 'todo' : 'done')); Z.render() },
  agent: (el) => { S.agent = el.dataset.id; if (S.route.at !== 'agents' && !(S.route.at === 'module' && S.route.tab === 'agents')) go('agents'); else Z.render() },
  toggle: (el) => { const a = D.agents.find((x) => x.id === el.dataset.id); Z.change(Z.you(), `turned ${S.on[a.id] ? 'off' : 'on'} ${esc(a.name)}`, () => (S.on[a.id] = !S.on[a.id]), { mod: a.module }); Z.toast(`${esc(a.name)} is ${S.on[a.id] ? 'on: it runs ' + esc(a.when.toLowerCase()) : 'off'}`, true); Z.render() },
  run: (el) => runAgent(el.dataset.id),
  undo: () => { const j = S.journal.find((x) => x.snap && !x.undone); if (j) { restore(j.snap); j.undone = true; log(Z.you(), `undid: ${j.words}`); Z.toast('Undone. Everything is as it was.') } Z.render() },
  ask: (el) => answer(+el.dataset.i),
  list: (el) => { const st = ts(el.dataset.t); st.list = +el.dataset.i; st.page = 0; Z.render() },
  savelist: (el) => { const t = el.dataset.t, st = ts(el.dataset.t), T = D.tables[t], snap = { q: st.q, filter: Object.fromEntries(Object.entries(st.filter).map(([k, s]) => [k, new Set(s)])) }; T.lists = [...listsOf(t), { name: `My list ${(T.mine = (T.mine || 0) + 1)}`, where: (r) => Object.entries(snap.filter).every(([k, s]) => !s.size || s.has(r[k])) && (!snap.q || T.fields.some((f) => plain(r[f.k], f).toLowerCase().includes(snap.q.toLowerCase()))) }]; st.list = T.lists.length; st.q = ''; st.filter = {}; st.sort = null; Z.toast(`Saved as ${esc(T.lists.at(-1).name)}`); Z.render() },
  cancel: (el) => { const st = ts(el.dataset.t), T = D.tables[el.dataset.t]; Object.assign(st, { q: '', filter: {}, sort: null, view: T.view || 'table' }); Z.render() },
  new: (el) => { S.panel = { form: el.dataset.t }; Z.render() },
  sort: (el) => { const st = ts(el.dataset.t), k = el.dataset.k; st.sort = { k, dir: st.sort?.k === k && st.sort.dir === 'asc' ? 'desc' : 'asc' }; Z.render() },
  page: (el) => { ts(el.dataset.t).page = +el.dataset.p; Z.render() },
  sel: (el) => { const s = ts(el.dataset.t).sel; s.has(el.dataset.id) ? s.delete(el.dataset.id) : s.add(el.dataset.id); Z.render() },
  selall: (el) => { const st = ts(el.dataset.t); st.sel.size ? st.sel.clear() : shown(el.dataset.t).slice(0, st.size).forEach((r) => st.sel.add(r.id)); Z.render() },
  selclear: (el) => { ts(el.dataset.t).sel.clear(); Z.render() },
  month: (el) => { const st = ts(el.dataset.t), [y, m] = st.month.split('-').map(Number), d = new Date(y, m - 1 + +el.dataset.d, 1); st.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; Z.render() },
  viewmenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, viewsOf(t).map((v) => ({ label: VIEWS[v][1], icon: VIEWS[v][0], on: st.view === v, run: () => (st.view = v) }))) },
  groupmenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, D.tables[t].fields.filter((f) => f.choices).map((f) => ({ label: f.label, on: st.group === f.k, run: () => (st.group = f.k) }))) },
  colormenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, D.tables[t].fields.filter((f) => f.choices).map((f) => ({ label: f.label, on: st.color === f.k, run: () => (st.color = f.k) }))) },
  chartmenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, [{ h: 'Chart' }, { label: 'Bars', on: st.chartType === 'bars', run: () => (st.chartType = 'bars') }, { label: 'Donut', on: st.chartType === 'donut', run: () => (st.chartType = 'donut') }, '-', { h: 'By' }, ...D.tables[t].fields.filter((f) => f.choices).map((f) => ({ label: f.label, on: st.chartBy === f.k, run: () => (st.chartBy = f.k) }))]) },
  sizemenu: (el) => { const st = ts(el.dataset.t); menu(el, [25, 50, 100].map((n) => ({ label: `${n} a page`, on: st.size === n, run: () => { st.size = n; st.page = 0 } }))) },
  filtermenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, D.tables[t].fields.filter((f) => f.choices).flatMap((f) => [{ h: f.label }, ...f.choices.map((c) => ({ label: c, on: st.filter[f.k]?.has(c), keep: true, run: () => { const s = (st.filter[f.k] ??= new Set()); s.has(c) ? s.delete(c) : s.add(c); st.page = 0 } }))])) },
  moremenu: (el) => { const t = el.dataset.t, st = ts(t); menu(el, [{ h: 'Columns' }, ...D.tables[t].fields.filter((f) => !f.hide && f.k !== D.tables[t].title).map((f) => ({ label: f.label, on: !st.hidden.has(f.k), keep: true, run: () => (st.hidden.has(f.k) ? st.hidden.delete(f.k) : st.hidden.add(f.k)) })), '-', { label: 'Export as CSV', icon: 'download-simple', run: () => csv(t) }]) },
  wsmenu: (el) => menu(el, [...(D.roles ? [{ h: 'Signed in as' }, ...D.roles.map((r) => ({ label: r.name, on: S.role === r.id, run: () => { S.role = r.id; S.msgs = []; S.asked.clear(); S.route = { at: 'home' } } })), '-'] : []), { label: 'Where the data lives', icon: 'shield-check', run: () => (S.why = true) }, { label: 'All demos', icon: 'squares-four', run: () => (location.href = './') }, { label: 'Start over', icon: 'arrow-counter-clockwise', run: () => location.reload() }]),
  mi: (el) => { const it = S.menu.items[+el.dataset.i]; it.run?.(); if (it.keep) { it.on = !it.on } else S.menu = null; Z.render() },
}
const csv = (t) => {
  const T = D.tables[t], rows = shown(t), q = (s) => `"${String(s).replace(/"/g, '""')}"`
  const text = [T.fields.map((f) => q(f.label)).join(','), ...rows.map((r) => T.fields.map((f) => q(plain(r[f.k], f))).join(','))].join('\n')
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: `${T.name.toLowerCase().replace(/\W+/g, '-')}.csv` })
  a.click()
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]')
  if (S.menu && !e.target.closest('.menu')) { S.menu = null; if (!el) return Z.render() }
  if (S.found && !e.target.closest('.search')) { S.found = ''; if (!el) return Z.render() }
  if (!el || el.disabled) return
  const a = el.dataset.act
  if (a === 'sel' || a === 'selall') { act[a](el); return }
  if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault()
  if (a === 'row' && e.target.closest('[data-act=sel]')) return
  ;(act[a] || D.acts?.[a])?.(el, Z)
  tip(null)
})
document.addEventListener('input', (e) => {
  const d = e.target.dataset
  if (d.q != null) { const st = ts(d.q); st.q = e.target.value; st.page = 0; Z.render() }
  if (d.find != null) { S.found = e.target.value; Z.render() }
  if (d.w != null) D.onInput?.(e.target, Z)
})
document.addEventListener('change', (e) => { if (e.target.dataset.w != null || e.target.dataset.mat != null) D.onChange?.(e.target, Z) })
document.addEventListener('submit', (e) => {
  e.preventDefault()
  const f = e.target
  if (f.matches('[data-ask]')) {
    const q = new FormData(f).get('q').trim()
    if (!q) return
    const w = q.toLowerCase()
    let best = -1, score = 0
    D.ask.forEach((a, i) => { const s = a.keys.filter((k) => w.includes(k)).length; if (s > score) { score = s; best = i } })
    if (best >= 0) return answer(best, q)
    S.msgs.push({ me: true, html: esc(q) }, { html: `In the live Zazoo this goes to the model, which reads ${esc(D.brand.name)}'s tables to answer. This prototype knows a few answers: try one of the suggestions.` })
    Z.render(); scrollFeed()
  } else if (f.matches('[data-agent]')) {
    const q = new FormData(f).get('q').trim(); if (q) agentSay(f.dataset.agent, q)
  } else if (f.matches('[data-note]')) {
    const q = new FormData(f).get('q').trim(), mod = f.dataset.note
    if (!q) return
    Z.change(Z.you(), `noted on ${esc(D.modules.find((m) => m.id === mod).name)}: ${esc(q)}`, () => S.notes.unshift({ mod, who: Z.you(), at: clock(), text: q }), { mod })
    Z.render()
  } else if (f.matches('[data-correct]')) {
    const { t, id, edit } = S.panel, fd = fieldOf(t, edit), raw = new FormData(f).get('v')
    const v = isNum(fd) ? Number(raw) : raw
    Z.change(Z.you(), `corrected ${esc(fd.label.toLowerCase())} on ${esc(titleOf(t, Z.row(t, id)))}: ${esc(plain(v, fd))}`, () => { Z.set(t, id, { [edit]: v }); S.srcs[`${t}.${id}.${edit}`] = { who: `${Z.you()} said so`, when: 'just now' } }, { row: id })
    S.panel.edit = null
    Z.toast('Corrected. What you say stands: no connection or agent writes over it.', true)
    Z.render()
  } else if (f.matches('[data-newrow]')) {
    const t = f.dataset.newrow, T = D.tables[t], fd = new FormData(f), id = 'n' + Math.random().toString(36).slice(2, 7)
    const r = { id }
    T.fields.forEach((x) => { const v = fd.get(x.k); if (v != null && v !== '') r[x.k] = isNum(x) ? Number(v) : v })
    T.fill?.(r, Z)
    Z.change(Z.you(), `added ${esc(T.one)} ${esc(r[T.title])}`, () => T.rows.unshift(r), { row: id })
    S.panel = { t, id }
    Z.toast(`Added. ${D.agents.some((a) => a.module === D.modules.find((m) => m.tables.includes(t))?.id) ? 'The module\'s agents will pick it up.' : ''}`, true)
    Z.render()
  }
})
// a board card dropped in another column changes its value
document.addEventListener('dragstart', (e) => { const c = e.target.closest?.('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); tip(null) } })
document.addEventListener('dragover', (e) => { const l = e.target.closest?.('.lane'); if (l) { e.preventDefault(); document.querySelectorAll('.lane.over').forEach((x) => x !== l && x.classList.remove('over')); l.classList.add('over') } })
document.addEventListener('drop', (e) => {
  const l = e.target.closest?.('.lane'); if (!l) return
  e.preventDefault()
  const id = e.dataTransfer.getData('text/plain'), { t, k, lane } = l.dataset
  if (t === '__tasks') {
    const tk = S.tasks.find((x) => x.id === id)
    if (!tk || tk.state === lane) return Z.render()
    const name = TSTATES.find((x) => x[0] === lane)[1]
    Z.change(Z.you(), `moved ${esc(tk.title)} to ${name}`, () => (tk.state = lane))
    Z.toast(`${esc(tk.title)} → ${name}`, true)
    return Z.render()
  }
  const r = Z.row(t, id)
  if (!r || r[k] === lane) return Z.render()
  Z.change(Z.you(), `moved ${esc(r[D.tables[t].title])} to ${esc(lane)}`, () => (r[k] = lane), { row: id })
  Z.toast(`${esc(r[D.tables[t].title])} → ${esc(lane)}`, true)
  Z.render()
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (S.menu) S.menu = null; else if (S.panel || S.why) { S.panel = null; S.why = false } else return; Z.render() }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (S.route.at !== 'home') go('home'); $('[data-find]')?.focus() }
  if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); act.railfold() }
})
// history for Back

Z.boot = (demo) => {
  D = demo
  D.assistant ??= 'Zazoo'
  S = { route: { at: 'home' }, hist: [], ts: {}, panel: null, journal: [], needs: D.needs.map((n) => ({ ...n })), tasks: D.tasks.map((t) => ({ ...t })), msgs: [], asked: new Set(), runs: {}, running: {}, on: Object.fromEntries(D.agents.map((a) => [a.id, a.on !== false])), srcs: {}, tick: 0, chat: innerWidth > 980, needsMode: 'agent', taskTab: 'today', tlist: 'all', tview: 'board', amsgs: {}, notes: (D.notes || []).map((n) => ({ at: 'Earlier', ...n })), found: '', role: D.roles?.[0].id }
  for (const j of D.journal || []) log(j.who, j.words, { mod: j.mod })
  D.after?.(Z)
  document.title = `${D.brand.name} · Zazoo demo`
  // Back walks the places the person went
  const render = Z.render
  Z.render = () => { const last = S.hist[S.hist.length - 1]; const now = JSON.stringify(S.route); if (!last || JSON.stringify(last) !== now) S.hist.push(clone(S.route)); render() }
  Z.render()
}
