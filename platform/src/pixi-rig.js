import { Application, Assets, Container, Graphics, Sprite, Text } from 'https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.mjs';
import { SPECIES, buildLayerManifest, getSpecies, resolveAppearance, SUIT_FILES, SUIT_ASPECT, TIE_FILES } from './rig.js';
import { centeredCharacterTransform } from './rig-transform.js';

const INK = 0x27231f;
const CHEEK = 0xd9897d;

// Species whose nose is a defining feature get to keep their real photo
// nose asset instead of the generic miniature dot (rhino's snout carries
// its horn; future species like elephant would list their trunk here too).
const SPECIAL_NOSE_SPECIES = new Set(['rhino']);

// Layers that vanish while hiding: face, wardrobe and held items. The plain
// egg body, ears and arms are deliberately excluded — they stay visible and
// just squeeze down, per the "vertically squeezed body" spec (not a body
// that disappears entirely).
const HIDE_FADE_LAYERS = [
  'suit', 'collar', 'tie', 'artifact', 'spectacles', 'muzzle',
  'cheek-left', 'cheek-right', 'eye-left', 'eye-right', 'pupil-left', 'pupil-right',
  'nose', 'horn', 'mouth', 'brow-left', 'brow-right', 'lid-left', 'lid-right',
  'ear-left', 'ear-right', 'arm-left', 'arm-right', 'action-prop', 'species-back',
];

function miniNoseLayer(ref) {
  return new Graphics().ellipse(ref.x, ref.y - 3, 5, 4).fill({ color: INK, alpha: .78 });
}

function cheekLayer(eye, side) {
  if (!eye) return new Graphics();
  const direction = side === 'left' ? -1 : 1;
  const x = eye.x + direction * eye.w * 0.25;
  const y = eye.y + eye.h * 0.95;
  const g = new Graphics().ellipse(x, y, eye.w * 0.5, eye.h * 0.28).fill({ color: CHEEK, alpha: .55 });
  g.__cheekShape = { x, y, rx: eye.w * 0.5, ry: eye.h * 0.28 };
  return g;
}

// Pale pink at rest, warming toward coral as the warmth channel rises —
// mirrors the color-temperature blush from the reference cat avatar
// (relationship-os's ZazooAvatar.tsx) instead of a single fixed tint.
const CHEEK_COOL = { r: 0xf2, g: 0xc7, b: 0xc0 };
const CHEEK_WARM = { r: 0xd9, g: 0x60, b: 0x4a };
function cheekColor(warm) {
  const t = Math.max(0, Math.min(1, warm));
  const r = Math.round(CHEEK_COOL.r + (CHEEK_WARM.r - CHEEK_COOL.r) * t);
  const g = Math.round(CHEEK_COOL.g + (CHEEK_WARM.g - CHEEK_COOL.g) * t);
  const b = Math.round(CHEEK_COOL.b + (CHEEK_WARM.b - CHEEK_COOL.b) * t);
  return (r << 16) | (g << 8) | b;
}

// Rough hue keywords found in Set 4's suit ids (e.g. "dusty_terracotta_white",
// "deep_sky_black") mapped to an approximate sleeve tint — suits are photo
// sheets with no single stored color, so this is a best-effort match rather
// than a pixel-accurate sample.
const SUIT_TINT_KEYWORDS = [
  ['black', 0x2b2b2b], ['charcoal', 0x3c3f42], ['navy', 0x27374a], ['indigo', 0x33305c],
  ['purple', 0x4d3763], ['violet', 0x5b4270], ['magenta', 0x7a3450], ['pink', 0x8a4a5e],
  ['rose', 0x8a4a5e], ['crimson', 0x7a2f34], ['rust', 0x8a4a30], ['terracotta', 0x93553a],
  ['amber', 0x8a6a30], ['gold', 0x8a7530], ['sky', 0x35586e], ['blue', 0x2f4a63],
  ['cyan', 0x2f5f63], ['forest', 0x38503c], ['moss', 0x4b5a3c], ['olive', 0x53512f],
  ['gray', 0x54524c],
];
const ARM_HAND_COLOR = 0xe9dcc4;
const ARM_HAND_SHADE = 0xb99e78;

function standardArmGraphics(tint) {
  const w = 70, sleeveH = 92, handH = 40;
  const g = new Graphics();
  g.moveTo(w * 0.5 - 25, 4)
    .quadraticCurveTo(w * 0.5 - 27, sleeveH * 0.5, w * 0.5 - 17, sleeveH)
    .lineTo(w * 0.5 + 17, sleeveH)
    .quadraticCurveTo(w * 0.5 + 27, sleeveH * 0.5, w * 0.5 + 25, 4)
    .quadraticCurveTo(w * 0.5, -6, w * 0.5 - 25, 4)
    .closePath()
    .fill({ color: tint });
  g.ellipse(w * 0.5, sleeveH * 0.7, 14, 20).fill({ color: 0x000000, alpha: .06 });
  // A simple cream/beige hand with a few curled-finger creases (not a
  // detailed photo hand — just enough to read as a relaxed, closed fist).
  g.ellipse(w * 0.5, sleeveH + handH * 0.42, 19, handH * 0.46).fill({ color: ARM_HAND_COLOR });
  for (const dx of [-9, 0, 9]) {
    g.moveTo(w * 0.5 + dx - 6, sleeveH + handH * 0.72)
      .quadraticCurveTo(w * 0.5 + dx, sleeveH + handH * 0.98, w * 0.5 + dx + 6, sleeveH + handH * 0.74)
      .stroke({ color: ARM_HAND_SHADE, width: 2, alpha: .6, cap: 'round' });
  }
  return g;
}

function eggPath(graphics, color, alpha = 1) {
  return graphics
    .moveTo(200, 48)
    .bezierCurveTo(127, 48, 82, 118, 76, 225)
    .bezierCurveTo(70, 333, 118, 406, 200, 410)
    .bezierCurveTo(282, 406, 330, 333, 324, 225)
    .bezierCurveTo(318, 118, 273, 48, 200, 48)
    .closePath()
    .fill({ color, alpha });
}

function ellipse(color, x, y, width, height, alpha = 1) {
  return new Graphics().ellipse(x, y, width, height).fill({ color, alpha });
}

function strokePath(draw, color = INK, width = 4, alpha = 1) {
  return draw.stroke({ color, width, alpha, cap: 'round', join: 'round' });
}

function artifactLayer(value) {
  const g = new Graphics();
  if (value === 'carrot') {
    g.poly([164, 300, 208, 365, 229, 283]).fill({ color: 0xd9813d });
    strokePath(g.moveTo(211, 291).lineTo(225, 261).moveTo(215, 287).lineTo(246, 274).moveTo(214, 286).lineTo(238, 250), 0x71825d, 8);
  } else if (value === 'bamboo') {
    strokePath(g.moveTo(177, 354).lineTo(226, 268), 0x7c9659, 14);
    g.ellipse(224, 279, 22, 9).fill({ color: 0x6f8c50 }); g.ellipse(184, 330, 20, 8).fill({ color: 0x6f8c50 });
  } else if (value === 'flower') {
    strokePath(g.moveTo(200, 354).lineTo(202, 295), 0x668359, 6);
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) g.circle(202 + Math.cos(a) * 18, 284 + Math.sin(a) * 18, 13).fill({ color: 0xe7c060 });
    g.circle(202, 284, 10).fill({ color: 0xa46b3d });
  } else if (value === 'honey') {
    g.roundRect(165, 302, 70, 55, 16).fill({ color: 0xb97836 });
    g.roundRect(157, 294, 86, 14, 7).fill({ color: 0x7d5839 });
    g.circle(200, 328, 15).fill({ color: 0xe9c354 });
  }
  return g;
}

function spectaclesLayer(eyeL, eyeR) {
  const g = new Graphics();
  if (!eyeL || !eyeR) return g;
  const cxL = eyeL.x, cxR = eyeR.x;
  const cy = (eyeL.y + eyeR.y) / 2;
  // Size lenses to just wrap each eye so the frames stay within the face area
  // regardless of species. Long temple arms previously extended 32px outside the
  // lens edge and past the body silhouette — they're now tiny nubs (8px) that
  // fold inward and stay comfortably inside the face boundary.
  const radius = Math.max(Math.min(eyeL.w, eyeL.h) * 0.6, 16);
  g.circle(cxL, cy, radius).stroke({ color: 0x504940, width: 4.5, alpha: .88 });
  g.circle(cxR, cy, radius).stroke({ color: 0x504940, width: 4.5, alpha: .88 });
  strokePath(g.moveTo(cxL + radius * .65, cy - 1).lineTo(cxR - radius * .65, cy - 1), 0x504940, 4, .88);
  strokePath(g.moveTo(cxL - radius, cy - 3).lineTo(cxL - radius - 8, cy - 5).moveTo(cxR + radius, cy - 3).lineTo(cxR + radius + 8, cy - 5), 0x504940, 3.5, .72);
  return g;
}

function defaultEarLayer(color, side) {
  // Draw at (0,0) so ear.scale.set() in update() scales around the ear's own
  // center — drawing at absolute (x,y) with container at origin caused scale
  // to displace the shapes by x*(scale-1) during listening/curious perking.
  const x = side === 'left' ? 134 : 266;
  const y = 166;
  const g = new Graphics();
  g.ellipse(0, 0, 30, 38).fill({ color });
  g.ellipse(0, 3, 16, 22).fill({ color: 0xffffff, alpha: .22 });
  g.position.set(x, y);
  return g;
}

function birdEarLayer(color, side) {
  // Same fix as defaultEarLayer — draw centered at (0,0), position with set().
  const direction = side === 'left' ? -1 : 1;
  const x = side === 'left' ? 130 : 270;
  const y = 152;
  const g = new Graphics();
  g.poly([0, -22, direction * 16, 22, -direction * 10, 20]).fill({ color });
  g.position.set(x, y);
  return g;
}

function browLayer(eye) {
  if (!eye) return new Graphics();
  const w = eye.w * 0.62;
  const thick = Math.max(3.5, eye.h * 0.09);
  const g = new Graphics();
  strokePath(g.moveTo(-w * 0.5, 3).quadraticCurveTo(0, -5, w * 0.5, 3), INK, thick, 0.82);
  const browY = eye.y - eye.h * 0.72;
  g.position.set(eye.x, browY);
  g.__browBaseY = browY;
  return g;
}

function actionPropGraphics(action) {
  const g = new Graphics();
  if (action === 'writing') {
    // Notebook — left hand holds it at ~(182, 300)
    g.roundRect(128, 266, 60, 52, 4).fill({ color: 0xf2eedd });
    g.roundRect(128, 266, 60, 52, 4).stroke({ color: 0x9a8868, width: 1.5, alpha: 0.88 });
    g.roundRect(128, 266, 9, 52, 3).fill({ color: 0x8a7858 });
    for (let i = 0; i < 5; i++) {
      g.moveTo(142, 275 + i * 9).lineTo(184, 275 + i * 9).stroke({ color: 0x9ab8c8, width: 1, alpha: 0.45 });
    }
    // Pen — right hand (avg position ~218, 287 with scribble)
    g.roundRect(215, 274, 5, 27, 2).fill({ color: 0x1a1a62 });
    g.poly([215, 301, 220, 301, 217, 313]).fill({ color: 0xc8a038 });
    g.roundRect(216.5, 276, 1.5, 19, 1).fill({ color: 0xe0d08a, alpha: 0.85 });
  } else if (action === 'usingComputer') {
    // Keyboard — hands rest at (180, 303) and (220, 303)
    g.roundRect(146, 308, 112, 22, 5).fill({ color: 0xdbd8d0 });
    g.roundRect(146, 308, 112, 22, 5).stroke({ color: 0xaaa69e, width: 1.5, alpha: 0.9 });
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 9; col++) {
        g.roundRect(151 + col * 11.4, 311 + row * 8, 9, 6, 1.5).fill({ color: 0xeeeae0 });
      }
    }
    g.roundRect(168, 325, 68, 5, 2).fill({ color: 0xeeeae0 });
  } else if (action === 'pickingPlacing') {
    // Paper stack — right arm reaches to pick/place here
    for (let i = 2; i >= 0; i--) {
      g.roundRect(224 + i * 3, 288 - i * 2, 48, 33, 2)
        .fill({ color: i === 0 ? 0xfafaf8 : i === 1 ? 0xf2eee0 : 0xe8e4d2 });
      g.roundRect(224 + i * 3, 288 - i * 2, 48, 33, 2)
        .stroke({ color: 0xb4aa90, width: 1.2, alpha: 0.85 });
    }
    for (let j = 0; j < 4; j++) {
      g.moveTo(228, 296 + j * 7).lineTo(268, 296 + j * 7).stroke({ color: 0xb0b8ca, width: 0.8, alpha: 0.45 });
    }
  } else if (action === 'researching') {
    // Magnifying glass — right hand is raised at ~(218, 268)
    const mx = 208, my = 246, mr = 23;
    g.moveTo(mx + mr * 0.64, my + mr * 0.64).lineTo(220, 270)
      .stroke({ color: 0x7a6a50, width: 7, alpha: 0.9, cap: 'round' });
    g.circle(mx, my, mr).stroke({ color: 0x4c4238, width: 4.5, alpha: 0.9 });
    g.circle(mx, my, mr - 2.5).fill({ color: 0xd0e8f5, alpha: 0.18 });
    g.ellipse(mx - 7, my - 8, 6, 4).fill({ color: 0xffffff, alpha: 0.44 });
  }
  return g;
}

// Arm sprites are drawn shoulder-to-hand with their rotation pivot near the
// shoulder (the "central body" end), so by default the hand end is the free
// end that swings. Some poses (holding something, meditating) need the
// opposite: the hand stays put at a fixed grip point and the shoulder end
// sweeps to reach it. applyHandPivot flips the sprite's anchor to its hand
// end, pins that point at `target`, then solves for the rotation that puts
// the sprite's own shoulder point back at its real shoulder attachment.
const ARTIFACT_GRIP = { carrot: { x: 208, y: 300 }, bamboo: { x: 202, y: 315 }, flower: { x: 201, y: 318 }, honey: { x: 200, y: 302 } };

function applyHandPivot(sprite, target) {
  if (!sprite?.__pivotFrac || !sprite.__basePos) return;
  const [px, py] = sprite.__pivotFrac;
  const hx = 1 - px, hy = 1 - py;
  sprite.anchor.set(hx, hy);
  sprite.position.set(target.x, target.y);
  const localDx = (px - hx) * sprite.__texW;
  const localDy = (py - hy) * sprite.__texH;
  const localAngle = Math.atan2(localDy, localDx);
  const shoulder = sprite.__basePos;
  const worldAngle = Math.atan2(shoulder.y - target.y, shoulder.x - target.x);
  sprite.rotation = worldAngle - localAngle;
}

function releaseHandPivot(sprite) {
  if (!sprite?.__pivotFrac) return;
  sprite.anchor.set(sprite.__pivotFrac[0], sprite.__pivotFrac[1]);
}

// The hand end's resting world position — computed once and cached — used as
// the default fixed pivot target so the paw/wingtip never drifts or "floats"
// disconnected from the body; only the shoulder end sweeps around it.
function handRestWorld(sprite) {
  if (sprite.__handRestWorld) return sprite.__handRestWorld;
  if (!sprite?.__pivotFrac || !sprite.__basePos) return sprite?.__basePos ?? { x: 0, y: 0 };
  const [px, py] = sprite.__pivotFrac;
  const hx = 1 - px, hy = 1 - py;
  const dx = (hx - px) * sprite.__texW;
  const dy = (hy - py) * sprite.__texH;
  const rot = sprite.__baseRot ?? 0;
  const cos = Math.cos(rot), sin = Math.sin(rot);
  sprite.__handRestWorld = { x: sprite.__basePos.x + dx * cos - dy * sin, y: sprite.__basePos.y + dx * sin + dy * cos };
  return sprite.__handRestWorld;
}

function hideShellLayer(color) {
  const g = eggPath(new Graphics(), color);
  g.moveTo(104, 279).bezierCurveTo(153, 301, 247, 301, 296, 279).stroke({ color: 0xffffff, width: 3, alpha: .12 });
  g.moveTo(200, 297).lineTo(200, 395).stroke({ color: INK, width: 2, alpha: .16 });
  g.alpha = 0;
  return g;
}

export class PixiZazooRig {
  static async create(host, options = {}) {
    const app = new Application();
    await app.init({ preference: 'webgl', resizeTo: host, backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1) });
    host.replaceChildren(app.canvas);
    const plateTextures = new Map();
    // 'beak' used to be excluded here by mistake, which meant no bird ever
    // actually loaded its beak texture — the 'mouth' case would silently
    // fall back to an empty Graphics. eyeL/eyeR/suit/tie/nose are genuinely
    // handled through other code paths (own drawing, suitSprite, tieSprite,
    // miniNoseLayer); armL/armR/wingL/wingR are unused now that every
    // species uses the same procedurally-drawn standardized arm.
    const UNUSED_LAYERS = new Set(['eyeL', 'eyeR', 'suit', 'tie', 'armL', 'armR', 'wingL', 'wingR']);
    await Promise.all(SPECIES.flatMap((species) =>
      Object.entries(species.photoLayers)
        .filter(([name]) => !UNUSED_LAYERS.has(name))
        .map(([name, layer]) =>
          Assets.load(`./${layer.file}`).then((loaded) => plateTextures.set(`${species.id}:${name}`, loaded)))));
    await Promise.all(Object.entries(SUIT_FILES).map(([id, file]) =>
      Assets.load(`./assets/generated/v3/${file}`).then((loaded) => plateTextures.set(`suit:${id}`, loaded))));
    await Promise.all(Object.entries(TIE_FILES).map(([id, file]) =>
      Assets.load(`./assets/generated/v3/${file}`).then((loaded) => plateTextures.set(`tie:${id}`, loaded))));
    return new PixiZazooRig(app, { ...options, plateTextures });
  }

  constructor(app, { species = SPECIES[0].id, appearance = {}, plateTextures = new Map() } = {}) {
    this.app = app;
    this.plateTextures = plateTextures;
    this.root = new Container();
    this.character = new Container();
    this.layers = new Map();
    this.overlay = new Container();
    this.zoomFactor = 1;
    this.armTextureCache = new Map();
    this.root.addChild(this.character);
    app.stage.addChild(this.root);
    app.stage.addChild(this.overlay);
    this.rebuild({ species, appearance });
    app.ticker.add(() => this.layout());
  }

  layout() {
    const width = this.app.screen.width;
    const height = this.app.screen.height;
    const scale = Math.min(width / 480, height / 500) * this.zoomFactor;
    this.root.scale.set(scale);
    this.root.position.set((width - 400 * scale) / 2, (height - 440 * scale) / 2 + 6 * scale);
    this.renderGrid();
  }

  setZoom(factor) {
    this.zoomFactor = Math.min(2.2, Math.max(0.5, factor));
    this.layout();
  }

  // Draws a black outline around a named layer's current on-screen bounds —
  // used by the layer-list panel so clicking an entry shows exactly what it
  // corresponds to on the canvas.
  highlightLayer(name) {
    this.overlay.removeChildren();
    if (!name) return;
    const display = this.layers.get(name);
    if (!display) return;
    const bounds = display.getBounds();
    const g = new Graphics().rect(bounds.x, bounds.y, bounds.width, bounds.height).stroke({ color: 0x000000, width: 2, alpha: .9 });
    this.overlay.addChild(g);
  }

  // A reference coordinate grid, in the character's own model-space units
  // (the same 400x440 box every layer's x/y is authored in) — lets the user
  // point at exact coordinates when describing a positioning issue. Lives
  // directly on the stage (NOT inside `this.root`, which is what zoom scales)
  // so line weight and label text stay a constant on-screen size regardless
  // of zoom, and new rows/columns are drawn in as needed to cover whatever
  // extra canvas area a zoom-out reveals.
  setGrid(enabled) {
    this.gridEnabled = enabled;
    if (!enabled) {
      this.gridLayer?.removeChildren();
      return;
    }
    this.renderGrid();
  }

  renderGrid() {
    if (!this.gridEnabled) return;
    if (!this.gridLayer) {
      this.gridLayer = new Container();
      this.app.stage.addChildAt(this.gridLayer, 0);
    }
    this.gridLayer.removeChildren();
    const { width, height } = this.app.screen;
    const scale = this.root.scale.x || 1;
    const originX = this.root.position.x;
    const originY = this.root.position.y;
    const step = 40;
    const minX = Math.floor(-originX / scale / step) * step;
    const maxX = Math.ceil((width - originX) / scale / step) * step;
    const minY = Math.floor(-originY / scale / step) * step;
    const maxY = Math.ceil((height - originY) / scale / step) * step;
    const gfx = new Graphics();
    for (let x = minX; x <= maxX; x += step) {
      const sx = originX + x * scale;
      gfx.moveTo(sx, 0).lineTo(sx, height).stroke({ color: 0xff3b30, width: 1, alpha: .22 });
    }
    for (let y = minY; y <= maxY; y += step) {
      const sy = originY + y * scale;
      gfx.moveTo(0, sy).lineTo(width, sy).stroke({ color: 0xff3b30, width: 1, alpha: .22 });
    }
    this.gridLayer.addChild(gfx);
    for (let x = minX; x <= maxX; x += step) {
      const label = new Text({ text: String(x), style: { fontSize: 9, fill: 0xff3b30 } });
      label.position.set(originX + x * scale + 2, 2);
      this.gridLayer.addChild(label);
    }
    for (let y = minY; y <= maxY; y += step) {
      // Flip Y so 0 is at the character's bottom (y=440 in model space) and
      // values increase upward — standard mathematical coordinate convention.
      const label = new Text({ text: String(440 - y), style: { fontSize: 9, fill: 0xff3b30 } });
      label.position.set(2, originY + y * scale + 2);
      this.gridLayer.addChild(label);
    }
  }

  rebuild({ species = this.species?.id, appearance = this.appearance } = {}) {
    this.species = getSpecies(species);
    this.appearance = resolveAppearance(appearance);
    this.character.removeChildren();
    this.layers.clear();
    for (const layer of buildLayerManifest({ species: this.species.id, appearance: this.appearance })) {
      const display = this.drawLayer(layer);
      display.label = layer.name;
      display.__baseAlpha = display.alpha;
      display.__baseScale = { x: display.scale.x, y: display.scale.y };
      this.layers.set(layer.name, display);
      this.character.addChild(display);
    }
    this.layout();
  }

  photoSprite(textureKey, layer) {
    const texture = this.plateTextures.get(textureKey);
    if (!texture || !layer) return new Graphics();
    const sprite = new Sprite(texture);
    sprite.anchor.set(...(layer.pivot ?? [0.5, 0.5]));
    sprite.position.set(layer.x, layer.y);
    sprite.width = layer.w;
    sprite.height = layer.h;
    sprite.__baseRot = ((layer.rot ?? 0) * Math.PI) / 180;
    sprite.rotation = sprite.__baseRot;
    sprite.__basePos = { x: layer.x, y: layer.y };
    sprite.__pivotFrac = layer.pivot ?? [0.5, 0.5];
    sprite.__texW = layer.w;
    sprite.__texH = layer.h;
    return sprite;
  }

  suitSprite(suitId, layer) {
    const texture = this.plateTextures.get(`suit:${suitId}`);
    if (!texture || !layer) return new Graphics();
    // Suit sheets 1-4 were drawn at different natural proportions — force
    // one shared box (like every other layer) would squish whichever set
    // doesn't match rhino's aspect. Instead fix the width (torso-relative,
    // consistent with every other suit) and derive height from the suit's
    // own aspect ratio, anchored at the fixed top/collar line so it never
    // looks stretched, cropped, or floating off the body regardless of set.
    const aspect = SUIT_ASPECT[suitId] ?? layer.w / layer.h;
    const width = layer.w;
    const height = width / aspect;
    const topY = layer.y - layer.h / 2;
    // Clamp bottom to flipped-grid y=20 (Pixi y=420) so suits don't extend
    // below the character's ankle area regardless of their native aspect ratio.
    const maxHeight = 420 - topY;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 0);
    sprite.position.set(layer.x, topY);
    sprite.width = width;
    sprite.height = Math.min(height, maxHeight);
    return sprite;
  }

  deriveSuitTint() {
    const id = this.appearance.suit;
    if (!id || id === 'none') return 0x6b6862;
    for (const [key, color] of SUIT_TINT_KEYWORDS) if (id.includes(key)) return color;
    return 0x54524c;
  }

  // Every species — mammal or bird, whatever art it does or doesn't have —
  // gets the exact same arm rig: a sleeve tinted to roughly match the current
  // suit, ending in a plain cream/beige hand. Standardizes what used to be a
  // per-species mix of real extracted arm photos and (for birds) wing photos,
  // and gives every arm the same shoulder attachment point (x=100/290, y=250)
  // instead of each species' own idiosyncratic photo-derived position.
  standardArmSprite(side) {
    const tint = this.deriveSuitTint();
    if (!this.armTextureCache.has(tint)) this.armTextureCache.set(tint, this.app.renderer.generateTexture(standardArmGraphics(tint)));
    const texture = this.armTextureCache.get(tint);
    const sprite = new Sprite(texture);
    const w = 46, h = 96;
    const x = side === 'left' ? 110 : 280;
    const y = 270;
    const rot = side === 'left' ? -4 : 4;
    sprite.anchor.set(0.5, 0.04);
    sprite.position.set(x, y);
    sprite.width = w;
    sprite.height = h;
    sprite.__baseRot = (rot * Math.PI) / 180;
    sprite.rotation = sprite.__baseRot;
    sprite.__basePos = { x, y };
    sprite.__pivotFrac = [0.5, 0.04];
    sprite.__texW = w;
    sprite.__texH = h;
    return sprite;
  }

  tieSprite(accessoryId, layer) {
    const texture = this.plateTextures.get(`tie:${accessoryId}`);
    if (!texture) return new Graphics();
    const sprite = new Sprite(texture);
    const suit = this.appearance.suit !== 'none' ? this.layers.get('suit') : null;
    if (suit instanceof Sprite) {
      // Anchor the tie to the suit that's actually on screen, not the bare-
      // chest layout position — a narrow strip centered on the suit's own
      // collar so it always sits fully inside the shirt triangle instead of
      // floating above the collar or bleeding past its edges.
      const naturalAspect = texture.width / texture.height;
      const width = Math.min(suit.width * 0.15, suit.height * 0.4 * naturalAspect);
      const height = width / naturalAspect;
      // The tie's top edge is pinned to a fixed point in the character's own
      // model space (not derived from the suit's own top, which sat the knot
      // too high, around y=240) so it starts lower, right at the collar.
      sprite.anchor.set(0.5, 0);
      sprite.position.set(suit.x, 260);
      sprite.width = width;
      sprite.height = height;
      return sprite;
    }
    if (!layer) return new Graphics();
    sprite.anchor.set(...(layer.pivot ?? [0.5, 0.06]));
    sprite.position.set(layer.x, layer.y);
    sprite.width = layer.w;
    sprite.height = layer.h;
    return sprite;
  }

  drawPhotoLayer(layer) {
    const species = this.species;
    const L = species.photoLayers;
    const own = (name) => this.photoSprite(`${species.id}:${name}`, L[name]);
    switch (layer.name) {
      case 'species-back':
        return L.tail ? own('tail') : new Graphics();
      case 'ear-left':
        if (L.earL) return own('earL');
        if (L.crestL) return own('crestL');
        return species.kind === 'bird' ? birdEarLayer(species.body, 'left') : defaultEarLayer(species.body, 'left');
      case 'ear-right':
        if (L.earR) return own('earR');
        if (L.crestR) return own('crestR');
        return species.kind === 'bird' ? birdEarLayer(species.body, 'right') : defaultEarLayer(species.body, 'right');
      case 'body':
        return own('body');
      case 'suit':
        return this.appearance.suit !== 'none' && L.suit ? this.suitSprite(this.appearance.suit, L.suit) : new Graphics();
      case 'arm-left':
        return this.standardArmSprite('left');
      case 'arm-right':
        return this.standardArmSprite('right');
      case 'nose': {
        // Use the real photo nose asset for every species that has one.
        // Birds have no separate nose (beak IS the mouth), rhino/others
        // all get their actual extracted nose at native crop size.
        if (L.nose) {
          const noseSprite = own('nose');
          // Cap to 36px wide so nostrils stay kawaii-small regardless of how
          // large the source crop is.
          if (noseSprite instanceof Sprite && noseSprite.width > 36) {
            const scale = 36 / noseSprite.width;
            noseSprite.width = 36;
            noseSprite.height = noseSprite.height * scale;
          }
          return noseSprite;
        }
        return new Graphics();
      }
      case 'horn':
        return L.horn ? own('horn') : new Graphics();
      case 'mouth': {
        if (L.beak) {
          const sprite = own('beak');
          sprite.__talkMode = 'zoom';
          return sprite;
        }
        if (!L.nose) return new Graphics();
        const { x, y } = L.nose;
        const mouthY = y + 15;
        // Container holds two children: a U-line (rest) and a circle (talking).
        // update() toggles visibility rather than scaling so the line never
        // stretches and the circle only appears while the character is speaking.
        const mouth = new Container();
        mouth.position.set(x, mouthY);
        const line = new Graphics();
        line.moveTo(-7, 0).quadraticCurveTo(0, 8, 7, 0);
        line.stroke({ color: INK, width: 3, alpha: 0.82, cap: 'round', join: 'round' });
        line.__isMouthLine = true;
        mouth.addChild(line);
        // Circle is 2× the old ellipse size (7×5 → 14×10) and hidden until talking.
        const circle = new Graphics();
        circle.ellipse(0, 3, 14, 10).fill({ color: INK, alpha: 0.82 });
        circle.__isMouthCircle = true;
        circle.visible = false;
        mouth.addChild(circle);
        mouth.__talkMode = species.id === 'koala' ? 'zoom' : 'squeeze';
        return mouth;
      }
      case 'eye-left':
        return this.eyeLayer(L.eyeL);
      case 'eye-right':
        return this.eyeLayer(L.eyeR);
      case 'pupil-left':
        return this.pupilLayer(L.eyeL);
      case 'pupil-right':
        return this.pupilLayer(L.eyeR);
      case 'tie':
        return this.appearance.accessory !== 'none' ? this.tieSprite(this.appearance.accessory, L.tie) : new Graphics();
      case 'cheek-left':
        return cheekLayer(L.eyeL, 'left');
      case 'cheek-right':
        return cheekLayer(L.eyeR, 'right');
      // felt-texture/body-shading/markings are leftover layer slots from the
      // original fully-illustrated vector puppet (a fabric weave overlay, an
      // airbrushed shading pass, and per-species markings) that have no
      // photoreal equivalent. They used to accidentally fall through into
      // cheekLayer(), which silently rendered a second, third and fourth
      // left-cheek blush stacked on top of the real one — making the left
      // cheek read as much more visible/pigmented than the right. They're
      // empty here on purpose.
      case 'felt-texture':
      case 'body-shading':
      case 'markings':
      case 'muzzle':
      case 'collar':
        return new Graphics();
      case 'brow-left':
        return browLayer(L.eyeL);
      case 'brow-right':
        return browLayer(L.eyeR);
      case 'lid-left':
      case 'lid-right':
        return new Graphics();
      default:
        return null;
    }
  }

  eyeLayer(eye) {
    if (!eye) return new Graphics();
    const g = new Graphics().ellipse(0, 0, eye.w / 2, eye.h / 2).fill({ color: 0xffffff });
    g.__gazeBase = { x: eye.x, y: eye.y };
    g.__eyeRadius = { rx: eye.w / 2, ry: eye.h / 2 };
    g.position.set(eye.x, eye.y);
    return g;
  }

  pupilLayer(eye) {
    if (!eye) return new Graphics();
    const r = Math.min(eye.w, eye.h) * 0.34;
    // Draw at (0,0) so scale() transforms around the pupil's own center —
    // the old code drew at (eye.x, eye.y) which meant scaling moved the center
    // outward by eye.x * (scale-1), causing the pupil to escape the eye.
    const g = new Graphics()
      .circle(0, 0, r).fill({ color: 0x18140f })
      .ellipse(-r * 0.35, -r * 0.4, r * 0.28, r * 0.36).fill({ color: 0xffffff, alpha: .85 });
    g.position.set(eye.x, eye.y);
    g.__pupilRadius = r;
    g.__eyeBase = { x: eye.x, y: eye.y };
    return g;
  }

  drawLayer(layer) {
    const species = this.species;
    if (layer.name === 'shadow') return ellipse(0x3e382f, 200, 414, 103, 18, .2);
    if (layer.name === 'action-prop') return new Container();
    const photoLayer = this.drawPhotoLayer(layer);
    if (photoLayer) return photoLayer;
    if (layer.name === 'artifact') return artifactLayer(layer.value);
    if (layer.name === 'spectacles') {
      return this.appearance.spectacles
        ? spectaclesLayer(species.photoLayers.eyeL, species.photoLayers.eyeR)
        : new Graphics();
    }
    if (layer.name === 'hide-shell') return hideShellLayer(species.body);
    return new Graphics();
  }

  update({ pose, motion, gaze = { x: 0, y: 0 }, blink = 0, seconds = 0 }) {
    for (const display of this.layers.values()) display.alpha = display.__baseAlpha;
    const transform = centeredCharacterTransform({ drift: motion.drift, lift: motion.lift });
    this.character.pivot.set(transform.pivot.x, transform.pivot.y);
    this.character.position.set(transform.position.x, transform.position.y);
    this.character.rotation = (motion.roll + motion.tilt * .35) * Math.PI / 180;
    // Breathing (motion.scaleX/scaleY) stays a tiny sine pulse; squash is the
    // separate, much larger deformation used for jumps/landings so a hop
    // reads as a real squish-and-stretch while idle breathing stays subtle.
    this.character.scale.set(motion.scaleX * (1 + motion.squash * .22), motion.scaleY * (1 - motion.squash * .3));
    const eyeOpen = Math.max(0.03, Math.min(1, pose.channels.eyeOpen));
    const blinkClosure = Math.min(1, Math.max(0, blink));
    const awayLook = pose.attention === 'away';
    for (const side of ['left', 'right']) {
      const eye = this.layers.get(`eye-${side}`);
      const pupil = this.layers.get(`pupil-${side}`);
      const lid = this.layers.get(`lid-${side}`);
      const brow = this.layers.get(`brow-${side}`);
      // A blink is a vertical squeeze-and-release of the eye/pupil, not a
      // transparency flicker; the white of the eye stays fixed in place —
      // only the pupil shifts to follow gaze.
      const vertical = (.72 + eyeOpen * .28) * (1 - blinkClosure);
      if (eye) {
        eye.alpha = eye.__baseAlpha;
        eye.scale.set(eye.__baseScale.x, eye.__baseScale.y * vertical);
      }
      if (pupil) {
        // Dilates/constricts with the `pupil` emotion channel (e.g. curious,
        // celebrating, sneaking all narrow it slightly) — previously defined
        // but never actually wired into rendering.
        const dilation = Math.max(0.6, Math.min(1.3, pose.channels.pupil ?? 0.72)) / 0.72;
        // Hard rule: the pupil can never visually poke outside the white of
        // the eye — not just its raw travel distance, but its full drawn
        // size at the CURRENT scale (dilation × the same vertical squeeze
        // the eye itself is under). Petting/blinking shrink the eye's own
        // vertical radius via `vertical`; without matching that here the
        // clamp used the eye's full resting size while the eye visually
        // looked much smaller, so the pupil appeared to spill past it.
        const pupilRBase = pupil.__pupilRadius ?? 0;
        const pupilRX = pupilRBase * dilation;
        const pupilRY = pupilRBase * dilation * vertical;
        const rx = Math.max(1, (eye?.__eyeRadius?.rx ?? 12) - pupilRX);
        const ry = Math.max(1, (eye?.__eyeRadius?.ry ?? 12) * vertical - pupilRY);
        const rawX = gaze.x * 8;
        const rawY = gaze.y * (awayLook ? 10 : 6);
        // Base position is the eye center; gaze offset is a delta on top of it.
        // Previously the graphics were drawn AT (eye.x, eye.y) so position.set
        // was effectively a delta — but scale() around (0,0) then moved the
        // drawn center by eye.x*(scale-1) on each dilation change, escaping the
        // eye. Now the circle is at (0,0) and __eyeBase holds the eye center.
        const baseX = pupil.__eyeBase?.x ?? 0;
        const baseY = pupil.__eyeBase?.y ?? 0;
        pupil.position.set(baseX + Math.max(-rx, Math.min(rx, rawX)), baseY + Math.max(-ry, Math.min(ry, rawY)));
        pupil.alpha = pupil.__baseAlpha;
        pupil.scale.set(pupil.__baseScale.x * dilation, pupil.__baseScale.y * dilation * vertical * (awayLook ? 0.55 : 1));
      }
      if (lid) lid.alpha = 0;
      if (brow) {
        brow.rotation = (side === 'left' ? -1 : 1) * pose.channels.brow * .18;
        // Use the stored base Y (set when drawing the brow above the eye) so that
        // the raise/lower delta is added on top of the correct resting position
        // instead of overwriting it with an absolute value relative to (0,0).
        brow.position.y = (brow.__browBaseY ?? brow.position.y) - Math.abs(pose.channels.brow) * 6;
      }
      const cheek = this.layers.get(`cheek-${side}`);
      if (cheek) {
        cheek.alpha = pose.channels.cheeks * pose.channels.warmth * .62;
        cheek.tint = cheekColor(pose.channels.warmth);
      }
    }
    const leftArm = this.layers.get('arm-left');
    const rightArm = this.layers.get('arm-right');
    if (leftArm && rightArm) {
      const armLift = motion.armLift;
      const baseL = leftArm.__basePos ?? { x: 120, y: 319 };
      const baseR = rightArm.__basePos ?? { x: 280, y: 319 };
      const baseRotL = leftArm.__baseRot ?? 0;
      const baseRotR = rightArm.__baseRot ?? 0;
      const meditating = pose.action === 'meditating';
      const reading = pose.action === 'reading';
      const researching = pose.action === 'researching';
      const writing = pose.action === 'writing';
      const usingComputer = pose.action === 'usingComputer';
      const pickingPlacing = pose.action === 'pickingPlacing';
      const deskAction = reading || researching || writing || usingComputer || pickingPlacing;
      const holdingArtifact = !meditating && !deskAction && this.appearance.artifact !== 'none';

      const swing = (arm, base, baseRot, sign) => {
        if (!(arm instanceof Sprite)) {
          // Fallback Graphics arms (species with no real arm/wing asset) have
          // no texture geometry to pivot-flip — keep the old shoulder-pivot.
          releaseHandPivot(arm);
          arm.rotation = baseRot + sign * armLift * 1.8;
          arm.pivot.set(base.x, base.y);
          arm.position.set(base.x, base.y);
          return;
        }
        // Pin the hand/paw at its natural resting point — the fixed, "never
        // floating" outer edge — and let the shoulder sweep around it. A hop
        // still visibly raises the arm by moving the pinned target upward.
        const rest = handRestWorld(arm);
        const target = { x: rest.x + sign * armLift * 14, y: rest.y - Math.abs(armLift) * 46 };
        applyHandPivot(arm, target);
      };

      // Hard rule for reach-y gestures whose target can be far from the
      // arm's natural resting length (picking something up across the body):
      // the shoulder is the ONE fixed pivot and the arm only rotates around
      // it — anchor and position never move from `base`. Hand-pivoting was
      // wrong here because pinning the far-away hand and solving backwards
      // for the shoulder still lands the shoulder exactly on `base` by
      // construction, but the rotation needed to do that can swing the
      // sprite through an angle that no longer lines up with the suit's
      // (static) shoulder seam — reading as the top of the arm "floating"
      // free of the body. A simple bounded rotation around the fixed
      // shoulder avoids that entirely.
      const pivotSwing = (arm, base, baseRot, angleDeg) => {
        releaseHandPivot(arm);
        arm.position.set(base.x, base.y);
        arm.rotation = baseRot + (angleDeg * Math.PI) / 180;
      };

      if (meditating) {
        // Hands clasp together in the lap and stay put; the shoulders sweep
        // to meet them rather than the hands swinging freely from the body.
        applyHandPivot(leftArm, { x: 184, y: 300 });
        applyHandPivot(rightArm, { x: 216, y: 300 });
      } else if (reading) {
        applyHandPivot(leftArm, { x: 178, y: 297 });
        applyHandPivot(rightArm, { x: 222, y: 297 });
      } else if (researching) {
        // Left hand holds reference pages; right raises a magnifying glass
        applyHandPivot(leftArm, { x: 170, y: 298 });
        applyHandPivot(rightArm, { x: 218, y: 268 });
      } else if (writing) {
        // The off-hand holds the paper steady; the writing hand makes a small
        // repeating side-to-side scribble.
        const scribble = Math.sin(seconds * 5) * 7;
        applyHandPivot(leftArm, { x: 182, y: 300 });
        applyHandPivot(rightArm, { x: 218 + scribble, y: 291 + Math.sin(seconds * 10) * 2 });
      } else if (usingComputer) {
        // Both hands rest low and forward as if on a keyboard, each bobbing
        // slightly out of phase with the other — a minimal typing tell.
        const typeL = Math.sin(seconds * 9) * 2;
        const typeR = Math.sin(seconds * 9 + Math.PI) * 2;
        applyHandPivot(leftArm, { x: 180, y: 303 + typeL });
        applyHandPivot(rightArm, { x: 220, y: 303 + typeR });
      } else if (pickingPlacing) {
        // The off-hand stays neutral and close to the body (a short,
        // near hand-pivot target, not a floating reach). The working arm
        // swings from its fixed shoulder through a bounded arc — down and
        // across to "pick up", back to "place down" — on a loop.
        const cycle = (Math.sin(seconds * 1.3) + 1) / 2;
        applyHandPivot(leftArm, { x: 184, y: 300 });
        pivotSwing(rightArm, baseR, baseRotR, 20 + cycle * 55);
      } else if (holdingArtifact) {
        // The holding hand is pinned to the item; the other arm swings normally.
        swing(leftArm, baseL, baseRotL, -1);
        applyHandPivot(rightArm, ARTIFACT_GRIP[this.appearance.artifact] ?? { x: 205, y: 300 });
      } else {
        swing(leftArm, baseL, baseRotL, -1);
        swing(rightArm, baseR, baseRotR, 1);
      }
    }
    // Action props — rebuild when action changes, no per-frame redraws needed
    const propContainer = this.layers.get('action-prop');
    if (propContainer) {
      if (pose.action !== propContainer.__lastAction) {
        propContainer.__lastAction = pose.action;
        propContainer.removeChildren();
        const g = actionPropGraphics(pose.action);
        if (g) propContainer.addChild(g);
      }
    }

    for (const side of ['left', 'right']) {
      const ear = this.layers.get(`ear-${side}`);
      if (!ear) continue;
      const direction = side === 'left' ? -1 : 1;
      const baseRot = ear.__baseRot ?? 0;
      ear.scale.set(ear.__baseScale.x * pose.channels.earScale, ear.__baseScale.y * pose.channels.earScale * (1 + Math.max(0, pose.channels.earPerk) * .16));
      ear.rotation = baseRot + direction * pose.channels.earPerk * .18 + Math.sin(seconds * .7 + (side === 'left' ? 0 : 2.1)) * .008;
    }
    const mouth = this.layers.get('mouth');
    if (mouth?.__talkMode) {
      const talk = pose.talking ? Math.max(0, Math.sin(seconds * 9)) : 0;
      const baseX = mouth.__baseScale?.x ?? 1;
      const baseY = mouth.__baseScale?.y ?? 1;
      if (mouth.__talkMode === 'zoom') {
        const zoom = 1 + talk * 0.32;
        mouth.scale.set(baseX * zoom, baseY * zoom);
      } else {
        // Toggle between U-line (rest) and circle (talking).
        const isTalking = talk > 0.15;
        const line = mouth.children?.find(c => c.__isMouthLine);
        const circle = mouth.children?.find(c => c.__isMouthCircle);
        if (line) line.visible = !isTalking;
        if (circle) {
          circle.visible = isTalking;
          if (isTalking) circle.scale.y = 0.5 + talk * 0.5;
        }
      }
    }
    const tail = this.layers.get('species-back');
    if (tail) {
      const wagBase = tail.__baseRot ?? 0;
      tail.rotation = wagBase + Math.sin(seconds * 6) * pose.channels.tailWag * .35;
    }
    const shadow = this.layers.get('shadow');
    if (shadow) { shadow.scale.x = motion.shadowScale; shadow.alpha = motion.shadowOpacity / .22; shadow.rotation = -this.character.rotation; }
    // Hiding is just the character's body squeezing down while its face,
    // wardrobe and accessories fade to invisible — the plain egg body stays
    // put and visible (no separate "wrapped in a shell" overlay). `wrap` also
    // drives the reverse (de-squeeze) transition when leaving hiding, so it's
    // used directly rather than being re-gated on the current action.
    const hide = motion.wrap;
    const hideShell = this.layers.get('hide-shell');
    if (hideShell) hideShell.alpha = 0;
    for (const name of HIDE_FADE_LAYERS) {
      const display = this.layers.get(name);
      if (display) display.alpha = display.alpha * (1 - hide);
    }
    if (pose.action === 'sneaking') this.character.skew.x = Math.sin(seconds * 2.2) * .025;
    else this.character.skew.x = 0;
  }
}
