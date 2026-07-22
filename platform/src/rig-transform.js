export function centeredCharacterTransform({ drift = 0, lift = 0 } = {}) {
  return {
    pivot: { x: 200, y: 230 },
    position: { x: 200 + drift * 140, y: 230 - lift * 120 },
  };
}

export function resolveEyeVisibility(eyeOpen = 1, blink = 0) {
  const openness = Math.min(1, Math.max(0, eyeOpen));
  const closure = Math.min(1, Math.max(0, blink));
  return {
    eye: Number((openness * (1 - closure)).toFixed(3)),
    lid: Number(Math.max(closure, 1 - openness).toFixed(3)),
  };
}
