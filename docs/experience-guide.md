# Zazoo Experience Guide

How the zazoo website is implemented, and how to keep its empathy and emotional feel consistent across every surface (web today; platform, app, decks, and docs tomorrow).

---

## 1. The emotional thesis

Zazoo is not "an AI tool." It is **a companion whose only purpose is your success**. Every design and copy decision flows from that:

- **Warmth over slickness.** Felt textures, linen backgrounds, soft shadows. The interface should feel like something sitting gently on a table, not glowing in a server room.
- **Calm over hype.** No exclamation marks, no "10x productivity," no countdown timers. The companion speaks quietly and confidently: "I've handled the scheduling for Thursday."
- **Companionship over capability.** We never lead with model names, parameter counts, or feature matrices. We lead with what the companion *takes off your plate* and how that *feels*.
- **Trust before autonomy.** Every promise of capability is paired with a promise of control: permissions, audit trails, human approvals. Trust copy is never in the footer; it is a first-class section.

The emotional arc of every page: **recognition** (you see your own friction), **relief** (someone is beside you), **confidence** (it operates within rules you set), **invitation** (start small, start free).

## 2. Design tokens (source of truth)

All tokens live in `assets/zazoo.css` and mirror the Zazoo design-system project on claude.ai/design.

| Layer | Tokens | Emotional job |
|---|---|---|
| Linen neutrals | `--linen-50 … 400` | Paper, warmth, calm ground |
| Teal brand | `--teal-100 … 900` | Depth, trust, "the adult in the room" |
| Coral accent | `--coral-100 / 500 / 600` | Warm invitation; used ONLY for the primary action |
| Companion pastels | `--sage / mist / heather` | Each character's home color; softness and individuality |
| Ink | `--ink / -soft / -faint` | Honest, readable, never pure black |

Rules:

- One coral CTA per viewport. Coral is the "hand extended" color; if everything is coral, nothing is inviting.
- Dark sections (`--surface-brand`, teal-700) are the "belief" moments: flow, program elements, quotes, final CTA. Use at most 2 to 3 per page so they land as emphasis, not wallpaper.
- Shadows are always teal-tinted (`--shadow-card`, `--shadow-raised`), never gray or black. Felt sits gently on the table.

## 3. Typography

- `Baloo 2` (display): rounded, friendly authority. Headlines, buttons, numbers, the wordmark.
- `Nunito Sans` (body): plain-spoken clarity.
- Scale lives in `--text-*` tokens. Headlines use `text-wrap: pretty`. Body copy stays under ~65ch.

Voice pairing rule: a Baloo headline may be playful ("Small hurdles. Giant ambitions.") only when the Nunito body under it is concrete and honest. Whimsy in the display layer, substance in the body layer, never the reverse.

## 4. The companions

The five Zazoos (Aeva, Pip, Sol, Mira, Odo) are rendered by `assets/zazoo.js` (`Zazoo.charSVG`) as inline SVG: felt egg body, business suit, blink and bob animations.

Emotional rules:

- **A companion is always doing something for someone.** Never use a character as pure decoration; pair it with a role, a message bubble, or a superpower list.
- **Companions live in their pastel "spot"** (`.spot` + their `--*-100` color). The spot is their home; it makes them feel placed, not pasted.
- **They blink.** The blink (and gentle bob) is the "alive" tell. Never remove it except under `prefers-reduced-motion`, which both animations respect.
- **Stagger their delays** (`data-delay`) when several appear together, so they read as individuals, not clones.
- Speech is always warm first person, concrete, and short: what was done, what needs the human. See "Voice" below.

## 5. Voice

From the brand guideline (`guidelines/brand-voice.html` in the design project):

- DO: "I've handled the scheduling for Thursday." / "Inbox at zero. Two things need you."
- DON'T: "Supercharge your productivity 10x!" / "TASK COMPLETED SUCCESSFULLY"

Site-wide copy rules applied in this implementation:

- Short declarative sentences. Periods, not exclamation marks. No em-dashes.
- "You/your" always outnumbers "we/our" on a page.
- Every claim of power is followed by a claim of restraint ("Always helpful. Never in control.").
- The consulting page deliberately does NOT sell Zazoo; it sells readiness, systems, and judgment. The platform sells itself by how the advice feels.

## 6. Interaction principles

All interactivity is vanilla JS in `assets/zazoo.js` plus small per-page scripts. Patterns ported from the interactive reference kit, re-skinned in zazoo theme:

| Pattern | Where | Emotional job |
|---|---|---|
| Family selector (hover to preview, click to lock) | Landing | "Choose your companion" is the core product metaphor; choosing should feel like play |
| Journey wheel (SVG segments) | Training | The 6-month journey is one whole; the wheel makes progression tangible |
| Program tabs (All / Running now / Coming next) | Training | Honesty: what exists now vs. what is coming is never blurred |
| Blocker chips + answer card | Consulting | Recognition first: the visitor names their pain before we pitch anything |
| Scroll reveal (`.reveal` + IntersectionObserver) | All pages | Content arrives gently, like being handed something, not thrown |
| Card hover lift | All pages | Felt objects respond to touch |
| Email capture with honest done state | All pages | One field, one promise; the done state confirms without confetti |

Motion rules:

- Durations 150 to 250ms with `--ease-soft`; character idle loops are slow (3.4s bob, 4.6s blink).
- Everything collapses gracefully under `prefers-reduced-motion: reduce` (reveal, bob, blink, fades all gated).
- Motion always answers a user action or entrance; nothing loops for attention except the characters' idle life.

## 7. Page architecture

```
index.html       Platform: hero (Aeva) → big picture → family selector → hurdles
                 → trust → flow (dark) → Aeva feature → teams → comparison → values → CTA (dark)
training.html    Hero (Pip+Odo) + stats → journey wheel → program elements (dark)
                 → programs current/next → CTA
consulting.html  Hero (Aeva+Mira) → three practices → system anatomy (dark)
                 → blocker selector → trends → approach → belief quote (dark) → CTA
assets/zazoo.css Tokens + components (single stylesheet, no build step)
assets/zazoo.js  Characters + shared interactions (no framework, no CDN dependency)
```

Performance choices (the "optimization" in this pass): the original kit shipped React + ReactDOM + Babel-standalone from CDN and compiled JSX in the browser on every load. This implementation is static HTML + one CSS file + one JS file, no build step, no external JS. Only external request is Google Fonts.

## 8. Extending to new surfaces

When building anything new under the zazoo brand (platform UI, decks, emails):

1. Start from the tokens, never from hex values.
2. Give every surface one companion with a job, in its spot color.
3. Write the companion's line first ("I've prepared the agenda"), design around it.
4. Pair every capability statement with a control statement.
5. End with one coral action. Everything else is teal or quiet.
6. Read the final copy aloud. If it sounds like a press release, rewrite it; if it sounds like a kind, competent colleague, ship it.
