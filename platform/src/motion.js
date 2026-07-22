const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

export function evaluateMotion({ pose, gesture, seconds, reducedMotion = false, cameFromHiding = false }) {
  const energy = 0.72 + pose.energy * 0.58;
  // Omnipresent (runs under every emotion, always on unless an action
  // explicitly overrides scale like sneaking/hiding) and its rhythm/depth
  // come straight from the emotion's own breath.hz/breath.depth — a sleepy
  // Zazoo breathes slow and deep, a celebrating one fast and shallow. Still
  // "minimal" per spec (evident jumps are a separate, much bigger squash),
  // just no longer so subtle it read as absent.
  const breathAmplitude = reducedMotion ? 0.008 : 0.022 * pose.breath.depth;
  const breath = Math.sin(seconds * Math.PI * 2 * pose.breath.hz * energy) * breathAmplitude;
  const result = {
    breath,
    squash: pose.channels.squash ?? 0,
    lift: 0,
    drift: 0,
    roll: 0,
    tilt: pose.channels.headTilt ?? 0,
    // Chest rises taller and narrows slightly on the in-breath (and the
    // reverse on the out-breath) rather than uniformly "puffing up" on both
    // axes at once — reads as an actual breath, not a pulse.
    scaleX: 1 - breath * 0.22,
    scaleY: 1 + breath,
    shadowScale: 1,
    shadowOpacity: 0.22,
    wrap: 0,
    armLift: 0,
    jiggle: 0,
  };

  if (pose.action === 'meditating') {
    result.lift = reducedMotion ? 0 : 0.07 + Math.sin(seconds * 1.1) * 0.015;
    result.shadowScale = 0.86;
  }

  if (pose.action === 'sneaking') {
    result.drift = reducedMotion ? 0 : Math.sin(seconds * 2.2) * 0.018;
    result.lift = reducedMotion ? 0 : Math.max(0, Math.sin(seconds * 4.4)) * 0.014;
    // A full 45° lean, not a subtle head-tilt — roll applies at full strength
    // to the whole character (unlike `tilt`, which pixi-rig dampens to .35x
    // since it's meant for small head-only tilts).
    result.roll = reducedMotion ? 0 : 45;
    result.scaleX = 0.74;
    result.scaleY = 1.08;
  }

  if (pose.action === 'hiding') {
    // A simple vertical squeeze down to half height — no spin, no separate
    // "wrap into a shell" animation. `wrap` still fades facial features,
    // wardrobe and accessories out to invisible as it reaches 1.
    const progress = smooth(seconds / 0.6);
    result.wrap = progress;
    result.scaleX = 1 + progress * 0.14;
    result.scaleY = 1 - progress * 0.5;
    result.shadowScale = 1 + progress * 0.1;
  }

  if (cameFromHiding && pose.action !== 'hiding') {
    // Coming back out of hiding pops back open rather than snapping instantly
    // — a brief stretch-past-normal overshoot as the body un-squeezes and its
    // features/wardrobe fade back in.
    const t = smooth(seconds / 0.5);
    result.wrap = 1 - t;
    result.scaleY = 0.5 + t * 0.5 + Math.sin(t * Math.PI) * 0.08;
    result.scaleX = 1.14 - t * 0.14;
  }

  if (!gesture || reducedMotion) return result;

  const p = clamp(gesture.progress);
  if (gesture.name === 'hop') {
    if (p < 0.18) {
      // Crouch-and-load: body squishes down and widens before liftoff.
      result.squash = Math.max(result.squash, smooth(p / 0.18) * 0.42);
    } else {
      const flight = (p - 0.18) / 0.82;
      result.lift = Math.sin(flight * Math.PI) * 0.76;
      result.drift = Math.sin(flight * Math.PI) * 0.035;
      // Stretch tall in mid-air, then squash again on landing.
      result.squash = Math.sin(flight * Math.PI * 2) * -0.16;
      result.armLift = Math.sin(flight * Math.PI);
      result.shadowScale = 1 - result.lift * 0.42;
      result.shadowOpacity = 0.22 - result.lift * 0.09;
    }
  } else if (gesture.name === 'nodOnce') {
    result.tilt += Math.sin(p * Math.PI * 2) * 7 * (1 - p);
  } else if (gesture.name === 'specAdjust') {
    result.jiggle = Math.sin(p * Math.PI * 7) * (1 - p) * 4;
  } else if (gesture.name === 'yawn') {
    result.squash = Math.sin(p * Math.PI) * 0.08;
  }

  return result;
}
