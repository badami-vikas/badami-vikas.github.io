# Zazoo Brand & Experience Guide

How the zazoo website is implemented, and how to keep its empathy and emotional feel consistent across every surface (web today; platform, app, decks, and docs tomorrow).

---

## 0. The one core principle

**The website shouldn't feel like scrolling through sections. It should feel like following a Zazoo through its day.**

Every animation must answer one question: *"What is my Zazoo doing while I'm busy?"* That question is the emotional thread of the entire homepage, and of every surface we build. If an animation doesn't answer it, cut the animation.

The visitor's first thought must be: *"This thing has already started working for me."* Not waiting. Not listening. Already helping.

## 1. The emotional thesis

Zazoo is not "an AI tool." It is **a companion whose only ambition is yours**.

- **Warmth over slickness.** Felt textures, linen backgrounds, soft teal-tinted shadows.
- **Calm over hype.** Nothing feels like notifications. Everything feels like companionship.
- **Behavior over features.** We never compare feature lists. A Zazoo is defined by how it behaves, so we show tiny animated stories people recognize from daily work.
- **Trust before autonomy.** Governance is a castle, not a firewall. Safety, not cybersecurity.

The homepage arc is a day in a Zazoo's life: **she is already working** (hero) → **you learn what she is** (dictionary) → **you see what protects you** (castle) → **you read her little books** (values, process, difference, impact) → **night falls, she rests, and dreams of your climb** (final scene) → **you invite one home** (CTA).

## 2. Appeal: the Pixar rule

Every Zazoo has a recognizable personality expressed in **micro-behaviors that never advance the product**. Pixar calls this "appeal": small, repeatable quirks that make audiences emotionally attach.

| Zazoo | Quirk |
|---|---|
| Aeva | Pauses for a second before every important decision. |
| Lina | Hums while researching. |
| Nori | Neatly straightens objects before moving on. |
| Bomi | Gets visibly excited when a tricky automation clicks. |
| Jia | Waves enthusiastically after sending a thoughtful follow-up. |
| Neva | Doodles in the margins when a meeting runs long. |

Aeva also yawns, stretches, glances at the visitor, and returns to work. She's happy because she's helping. The goal: visitors leave remembering not just that "Aeva schedules meetings" but that **"Aeva smiled at me before going back to work."** We are not selling software; we are introducing a companion people want beside them.

Implementation: `assets/menagerie.js` (`initQuirks` emits periodic quirk emotes; `initEyeTracking` makes pupils follow the visitor's cursor, so a paused Zazoo genuinely "looks at you"). All of it collapses under `prefers-reduced-motion`.

## 3. The menagerie

Every Zazoo is a **unique animal**. No two placements reuse the same animal. All share the felt material, the suit, the blush, the smile: animals change, warmth doesn't.

### The family (dictionary scene)
| Animal | Name | Role | Workspace behavior |
|---|---|---|---|
| 🦉 Owl | Aeva | Chief of staff | Planning, prioritization, decision making, keeps everyone moving |
| 🦊 Fox | Lina | Research companion | Constantly reading, highlighting ideas, connecting information |
| 🐘 Elephant | Nori | Operations | Approvals, processes, vendors, moving things along |
| 🦫 Beaver | Bomi | Builder | Constructing automations, connecting workflows, fixing things |
| 🦢 Swan | Jia | Relationships | Follow-ups, meeting prep, birthdays, customer care |
| 🐬 Dolphin | Neva | Creativity | Sketches, mood boards, presentations, possibilities |

### The guardians (governance castle)
Owl Judge (weighs requests against your rules), Elephant Security (opens only allowed doors), Dog Gatekeeper (checks badges), Bear Auditor (writes everything down).

### The outsider
A small grey robot with red eyes plays "some AI" in governance and Difference scenes. It is never menacing and never harmed. It is gently escorted out: *"Sorry. Not authorized."* No violence. No fear.

Rendering: `Menagerie.animalSVG(kind, size, {delay, prop})` in `assets/menagerie.js`. Props (book, wrench, ledger, letter, brush, calendar, key, scales, lantern, coffee, umbrella, plant) show what a companion is doing right now; a Zazoo is always doing something for someone.

## 4. The homepage scenes (canonical storyboard)

1. **Hero, "Your Zazoo never stops."** A living circular workspace: papers filing, calendars updating, emails sorting, ideas lighting up, all orbiting Aeva, who works at the centre. A ticker shows what she's doing right now; speech bubbles surface small cared-for moments ("Vendor replied." "I've already reminded them." "Thanks, Nori. Found it."). Copy stays minimal; the animation tells the story.
2. **Dictionary.** Oxford-style entry. *Zazoo /za·zoo/ noun. An asymmetrical leap in capability.* Origin, purpose, impact, and the quote "A Zazoo's only ambition is yours." Beside it, the whole family works; hovering pauses everyone else while the chosen companion stops, looks into your eyes, and introduces itself with real numbers from its week.
3. **Governance castle.** Beautiful doors, warm windows, guardians at their posts. The robot vignette loops: approach, gentle refusal, doors close, calm returns. Mirrored statements: Always available / Only when permitted. Always learning / Only what you allow. Always transparent / Nothing hidden. Always helpful / Never overreaching.
4. **Four little books.** Values (storybook: one illustration, one sentence per value), Process (tiny footprints across Insight → Decision → Delegation → Execution → Learning, stopping to wait for the human at Decision), Difference (see §5), Impact (hundreds / thousands / millions).
5. **Night falls.** Privacy Mode enabled. Aeva walks home, hangs up her badge, looks at your photo, sleeps, and dreams: clearing stones, holding the lantern, building bridges, while you climb impossible mountains. **She never climbs the mountain. She makes the climb possible.** Morning. Alarm. Smile. Back to work.

## 5. The Zazoo Difference (behavior, not features)

Never a comparison table. A collection of tiny recognizable stories, each "Some AI…" vs "A Zazoo…", each with one caption:

- The forgotten promise. *Some AI ends with the conversation. A Zazoo begins with it.*
- Memory. *Some AI remembers conversations. A Zazoo remembers journeys.*
- Interruptions. *Some AI creates more information. A Zazoo protects your attention.*
- Teamwork. *Some AI works alone. Zazoos work together.*
- The human pause. *Capability includes judgment.*
- The new idea. *Some AI answers questions. A Zazoo notices opportunities.*
- Growth. *Some AI is updated. A Zazoo grows.*
- Success. *Your success is your Zazoo's success.*
- Signature visual: **The Mountain.** Left, a climber carrying everything. Right, the same mountain, climbing light, Zazoos holding ropes, clearing rocks, lighting the path. *The greatest achievements don't come from carrying more. They come from never climbing alone.*

**The uniquely-Zazoo differentiator: companions improve one another.** Zazoos have a culture: they ask each other for help, review each other's work, cover for one another, learn from one another, and celebrate shared wins. Show it in passing moments (Lina thanking Nori; Bomi checking a change with Aeva). Competitors compare benchmarks; we show a supportive team working for one person's success.

## 6. Design tokens

All tokens live in `assets/zazoo.css` and mirror the Zazoo design-system project on claude.ai/design.

| Layer | Tokens | Emotional job |
|---|---|---|
| Linen neutrals | `--linen-50 … 400` | Paper, warmth, calm ground |
| Teal brand | `--teal-100 … 900` | Depth, trust |
| Coral accent | `--coral-*` | The hand extended; ONLY for the primary action |
| Companion pastels | `--sage / mist / heather / warmwood` | Each character's home color |
| Night | `--night-900 / 700 / glow` | The final scene: rest, privacy, warm windows |
| Ink | `--ink / -soft / -faint` | Honest, readable, never pure black |

Rules: one coral CTA per viewport; dark teal sections are "belief" moments (max 2 to 3 per page); shadows always teal-tinted; the night palette appears only in the closing scene.

## 7. Typography and voice

`Baloo 2` for display (rounded, friendly authority), `Nunito Sans` for body. Headlines may be playful only when the body under them is concrete. Companion speech is warm first person, short, concrete: "I've handled the scheduling for Thursday." Never "TASK COMPLETED SUCCESSFULLY", never "10x your productivity!". No em-dashes. "You/your" outnumbers "we/our" on every page.

## 8. Motion rules

- Idle life is slow: 3.4s bob, 4.6s blink, 70s ecosystem orbit. UI transitions 150 to 250ms with `--ease-soft`.
- Motion always answers the core question ("what is my Zazoo doing?") or a user action. Nothing loops for attention except the companions' idle life.
- Hover pauses, never accelerates: attention makes the world stop and look back at you.
- Everything honors `prefers-reduced-motion: reduce` (orbits, bobs, blinks, robot loop, quirk emotes, eye tracking all gated).
- Performance: no frameworks, no scroll listeners (IntersectionObserver + rAF-throttled pointer tracking only), animations restricted to transform/opacity.

## 9. Page architecture

```
index.html       The day of a Zazoo: hero ecosystem → dictionary → castle
                 → four books (values/process/difference/impact) → night → CTA
training.html    Hero + stats → journey wheel → program elements → programs → CTA
consulting.html  Hero → practices → system anatomy → blockers → trends → approach → belief → CTA
assets/zazoo.css Tokens + components
assets/zazoo.js  Legacy egg companions (training/consulting) + shared interactions
assets/menagerie.js  Animal companions, guardians, robot, eye tracking, quirks
```

## 10. Extending to new surfaces

1. Start from the tokens, never hex values.
2. Give every surface one companion, a unique animal, with a job and a prop.
3. Write the companion's line first; design around it.
4. Pair every capability statement with a control statement.
5. One coral action; everything else teal or quiet.
6. Add one quirk that doesn't advance the product. That's the part people remember.
7. Read the copy aloud. Kind, competent colleague: ship. Press release: rewrite.
