# Task: Website Interactions (full interactive redesign)

Status: **IN PROGRESS.** 2026-07-18: the homepage now implements the day-in-the-life storyboard (hero ecosystem, dictionary family with 6 unique animal Zazoos, governance castle with guardians and the robot vignette, four chapter books incl. the behavior-based Difference stories and the Mountain, and the night scene), with eye tracking and personality quirks in `assets/menagerie.js`. Remaining scope: training + consulting pages, page transitions, richer 2.5D parallax layers, and the polish list below.

## Goal

Redesign the entire zazoo website as a highly interactive experience, on par with the interactive reference kit (claude.ai/design project `7fd94b1d-b389-4212-847b-fea39fe31572`, `ui_kits/website/index.html`), but expressed entirely in the zazoo felt/linen language, and replace every static companion placement with **2.5D interactive Zazoos, each a unique animal, never repeated**.

## Scope

### 1. 2.5D interactive Zazoo menagerie (the centerpiece)

- Every companion placement across the platform gets a **unique animal Zazoo**. No two placements reuse the same animal. Candidate cast (extend as needed): owl (wisdom, leadership), fox (sales), beaver (engineering), octopus (operations), elephant (memory), penguin (finance), hummingbird (speed/notifications), red panda (creativity), tortoise (compliance/patience), dolphin (communication).
- **2.5D construction:** layered SVG/CSS (body, head, eyes, accessories on separate depth layers) with parallax response to pointer position and device tilt; subtle scale/shadow shifts to sell depth. No WebGL requirement; must degrade to the current flat felt characters.
- **Interactions per Zazoo:** eyes track the cursor; hover triggers a personality gesture (owl head-tilt, fox tail-flick); click opens its "superpowers" card (reuse family-selector info pattern); idle life = blink + bob (existing keyframes).
- **Continuity rules:** keep the felt material, the suit, the pastel spot, and the warm smile. Animals change; the brand's warmth does not. All motion honors `prefers-reduced-motion`.

### 2. Interactive patterns to port from the reference kit (zazoo-themed)

Already shipped in the current site (keep, polish):
- Sticky translucent nav with active state, mobile menu
- Selector wheel (training journey), tab filters (programs), chip selector + answer card (consulting blockers)
- Hover-lift cards, scroll reveal, email capture with done state

To add in this task:
- **SPA-style page transitions** (View Transitions API; fall back to fade) so Platform/Consulting/Training feel like one continuous world
- **Stats band with count-up on first view** (landing "big picture" numbers)
- **Testimonial/quote selector cards** (only once real testimonials exist; never fabricate)
- **Video moment** with a play button that scales on hover (hero or Aeva section) once a real demo video exists
- **Newsletter/community block** (dark panel, benefits list + single field) in the footer region
- **Directional hover fills on buttons**; magnetic hover on the primary CTA (pointer-following within ~8px)
- **Scroll-driven flow diagram**: the Insight→Learning pipeline animates each step as it enters the viewport, with a Zazoo walking the steps

### 3. Emotional continuity requirements

Follow `docs/experience-guide.md` throughout. Specific to this task:
- Interactivity must always be an act of the companion's care, not spectacle. Every animation answers: "what is the Zazoo doing for the visitor right now?"
- The menagerie must feel like a family portrait, not a zoo: shared proportions, shared felt texture, shared suit, one smile.
- Performance budget: < 150KB JS total, LCP < 2.0s on 4G, zero layout shift from character loading (reserve aspect-ratio boxes).
- Accessibility: every interactive Zazoo is keyboard-operable, labelled, and useful without a pointer.

## Definition of done

- All three pages redesigned with the interaction set above, verified on desktop and mobile viewports.
- At least 8 unique animal Zazoos live, zero repeats across pages, each with tracking eyes + gesture + superpowers card.
- Reduced-motion pass, keyboard pass, and Lighthouse (Performance and Accessibility both 90+) recorded in this file.
- `docs/experience-guide.md` updated with the menagerie roster and 2.5D motion rules.
