export const EMOTIONS = Object.freeze([
  'calm',
  'curious',
  'thinking',
  'listening',
  'happy',
  'proud',
  'unsure',
  'concerned',
  'comforting',
  'celebrating',
  'sleepy',
]);

export const ACTIONS = Object.freeze([
  'idle', 'meditating', 'sneaking', 'hiding',
  'reading', 'writing', 'researching', 'usingComputer', 'pickingPlacing',
]);

const BASE = {
  eyeOpen: 1,
  eyes: 0.72,
  pupil: 0.72,
  brow: 0,
  smile: 0.18,
  mouthOpen: 0,
  cheeks: 0.08,
  earPerk: 0,
  earScale: 1,
  headTilt: 0,
  headDrop: 0,
  posture: 0.72,
  warmth: 0.45,
  confidence: 0.72,
  tailWag: 0,
  squash: 0,
};

const EMOTION_POSES = {
  calm: { breath: [0.2, 0.34], blink: [4.8, 0.7] },
  curious: { channels: { eyes: 1.02, pupil: 0.92, earPerk: 0.75, earScale: 1.22, headTilt: 9 }, breath: [0.24, 0.4], blink: [7, 0.65] },
  thinking: { channels: { eyeOpen: 0.78, eyes: 0.58, brow: -0.6, headTilt: -4, headDrop: 0.08 }, gaze: [0.55, -0.62], breath: [0.14, 0.62], blink: [5.8, 0.75] },
  listening: { channels: { eyes: 0.88, brow: 0.24, earPerk: 1.2, earScale: 1.4, headTilt: 4 }, breath: [0.17, 0.38], blink: [5.7, 0.72] },
  happy: { channels: { eyeOpen: 0.66, eyes: 0.86, smile: 0.82, cheeks: 0.9, warmth: 0.9, tailWag: 0.5, earPerk: 0.4 }, breath: [0.25, 0.46], blink: [4.3, 0.62] },
  proud: { channels: { smile: 0.48, brow: 0.18, posture: 1, confidence: 1 }, breath: [0.16, 0.58], blink: [5.3, 0.72] },
  unsure: { channels: { brow: 0.7, headTilt: -7, headDrop: 0.2, confidence: 0.3 }, gaze: [-0.55, 0.14], breath: [0.34, 0.26], blink: [2.7, 0.48], doubleBlink: true },
  concerned: { channels: { brow: 1, smile: -0.55, cheeks: 0, warmth: 0.16, headDrop: 0.12, posture: 0.62 }, breath: [0.27, 0.3], blink: [3.7, 0.66] },
  comforting: { channels: { eyeOpen: 0.5, smile: 0.65, cheeks: 0.72, warmth: 1, posture: 0.78 }, breath: [0.13, 0.82], blink: [6.2, 0.85] },
  celebrating: { channels: { eyeOpen: 1, eyes: 1.16, pupil: 0.92, smile: 1, mouthOpen: 0.8, cheeks: 1, warmth: 1, earPerk: 1.3, earScale: 1.3, tailWag: 1, posture: 0.96 }, breath: [0.42, 0.56], blink: [3.2, 0.52] },
  sleepy: { channels: { eyeOpen: 0.3, eyes: 0.6, brow: -0.18, headTilt: 6, headDrop: 0.2, earPerk: -0.65, posture: 0.42 }, breath: [0.1, 0.72], blink: [7.5, 0.3] },
};

const ACTION_POSES = {
  idle: {},
  meditating: { channels: { eyeOpen: 0.05, posture: 1 }, breath: [0.07, 1.2], saccades: false, blink: [Infinity, 0] },
  sneaking: { channels: { squash: 0.3, posture: 0.2, earPerk: 0.86, earScale: 1.12, pupil: 0.92, headTilt: 7 }, saccadeAmount: 1 },
  hiding: { suspendLife: true },
  // Desk/work actions: minimalistic hand-only animations (see pixi-rig.js's
  // arm-pivot targets for the actual hand poses) paired with a gaze/posture
  // that reads as "looking down at what the hands are doing".
  reading: { channels: { headTilt: -8, headDrop: 0.14, eyeOpen: 0.82, brow: -0.1 }, gaze: [0, 0.45], breath: [0.16, 0.5], blink: [5.4, 0.7], saccadeAmount: 0.12 },
  researching: { channels: { headTilt: -11, headDrop: 0.2, eyeOpen: 0.8, brow: -0.3 }, gaze: [0, 0.4], breath: [0.2, 0.46], blink: [4.6, 0.72], saccadeAmount: 0.3 },
  writing: { channels: { headTilt: -9, headDrop: 0.16, eyeOpen: 0.8 }, gaze: [0.1, 0.5], breath: [0.16, 0.5], blink: [5.6, 0.7], saccadeAmount: 0.1 },
  usingComputer: { channels: { headTilt: -4, headDrop: 0.06, eyeOpen: 0.9 }, gaze: [0, 0.1], breath: [0.18, 0.44], blink: [6, 0.66], saccadeAmount: 0.15 },
  pickingPlacing: { channels: { headTilt: 5, headDrop: 0.08, posture: 0.7 }, gaze: [0.2, 0.2], breath: [0.22, 0.5], blink: [5.2, 0.68], saccadeAmount: 0.4 },
};

const GESTURES = {
  celebrating: ['hop', 1280],
  thinking: ['specAdjust', 1000],
  unsure: ['specAdjust', 1000],
  proud: ['nodOnce', 760],
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value)));

export function resolvePerformance(input = {}) {
  const emotion = EMOTIONS.includes(input.emotion) ? input.emotion : 'calm';
  const action = ACTIONS.includes(input.action) ? input.action : 'idle';
  const emotionPose = EMOTION_POSES[emotion];
  const actionPose = ACTION_POSES[action];
  const channels = { ...BASE, ...emotionPose.channels, ...actionPose.channels };

  if (input.warmth != null) channels.warmth = clamp(input.warmth);
  if (input.confidence != null) channels.confidence = clamp(input.confidence);

  if (input.petting) {
    Object.assign(channels, { eyeOpen: 0.12, smile: 1, mouthOpen: 0.45, cheeks: 1, warmth: 1, earPerk: -0.35 });
  }

  return {
    emotion,
    action,
    channels,
    breath: { hz: actionPose.breath?.[0] ?? emotionPose.breath[0], depth: actionPose.breath?.[1] ?? emotionPose.breath[1] },
    blink: { every: actionPose.blink?.[0] ?? emotionPose.blink[0], speed: actionPose.blink?.[1] ?? emotionPose.blink[1] },
    gaze: actionPose.gaze ?? emotionPose.gaze ?? [0, 0],
    saccades: actionPose.saccades ?? true,
    saccadeAmount: actionPose.saccadeAmount ?? 0.24,
    suspendLife: actionPose.suspendLife ?? false,
    attention: ['user', 'cursor', 'away'].includes(input.attention) ? input.attention : 'user',
    energy: clamp(input.energy ?? 0.5),
    petting: Boolean(input.petting),
    talking: Boolean(input.talking),
    doubleBlink: Boolean(emotionPose.doubleBlink),
  };
}

export function stepSpring(state, target, dt, frequency = 2, damping = 1) {
  const safeDt = Math.min(1 / 20, Math.max(0, dt));
  const omega = Math.PI * 2 * frequency;
  const acceleration = (target - state.value) * omega * omega - 2 * damping * omega * state.velocity;
  const velocity = state.velocity + acceleration * safeDt;
  return { value: state.value + velocity * safeDt, velocity };
}

export function createDirector({ now = () => performance.now() } = {}) {
  let input = { emotion: 'calm', action: 'idle' };
  let pose = resolvePerformance(input);
  let gesture = null;
  let expiresAt = null;

  return {
    perform(next = {}) {
      const previousEmotion = pose.emotion;
      input = { ...input, ...next };
      pose = resolvePerformance(input);
      expiresAt = Number.isFinite(next.duration) && next.duration > 0 ? now() + next.duration * 1000 : null;
      if (pose.emotion !== previousEmotion && GESTURES[pose.emotion]) {
        const [name, duration] = GESTURES[pose.emotion];
        gesture = { name, startedAt: now(), duration };
      }
      return pose;
    },
    tick() {
      if (expiresAt != null && now() >= expiresAt) {
        input = { emotion: 'calm', action: 'idle' };
        pose = resolvePerformance(input);
        gesture = null;
        expiresAt = null;
      }
      if (gesture && now() - gesture.startedAt > gesture.duration) gesture = null;
      return pose;
    },
    snapshot() {
      return { pose, gesture, expiresAt };
    },
  };
}
