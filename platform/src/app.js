import { ACTIONS, EMOTIONS, createDirector, stepSpring } from './engine.js';
import { evaluateMotion } from './motion.js';
import { PixiZazooRig } from './pixi-rig.js';
import { ACCESSORIES, ACCESSORY_LABELS, ARTIFACTS, SPECIES, SUITS, SUIT_LABELS, buildLayerManifest, getSpecies } from './rig.js';

const $ = (selector) => document.querySelector(selector);
const els = {
  stage: $('#stage'), host: $('#pixi-host'), label: $('#performance-label'), crew: $('#crew-list'), count: $('#crew-count'),
  emotion: $('#emotion-select'), actions: $('#action-controls'), attention: $('#attention-controls'),
  api: $('#api-code'), copy: $('#copy-button'), reset: $('#reset-button'), warmth: $('#warmth-range'), confidence: $('#confidence-range'), energy: $('#energy-range'),
  suit: $('#suit-select'), accessory: $('#accessory-select'), artifact: $('#artifact-select'), spectacles: $('#spectacles-toggle'),
  layerList: $('#layer-list'), layerFilter: $('#layer-filter'), zoomIn: $('#zoom-in-button'), zoomOut: $('#zoom-out-button'), zoomReset: $('#zoom-reset-button'),
  gridToggle: $('#grid-toggle-button'), annotateToggle: $('#annotate-toggle-button'), annotateClear: $('#annotate-clear-button'),
  annotateCanvas: $('#annotate-canvas'),
};

// Layer-manifest groups bucketed into the two filters the layer panel offers.
// Everything wardrobe/held-item related reads as "Accessory" (suit, collar,
// tie, held artifact, spectacles); everything else — body, ears, face, tail,
// arms, shadow — reads as "Body".
const ACCESSORY_GROUPS = new Set(['wardrobe', 'artifact']);
const ACTION_LABELS = { meditating: 'Meditate', usingComputer: 'Using Computer', pickingPlacing: 'Pick & Place' };

let selectedSpecies = SPECIES[0];
let appearance = { suit: SUITS[1], accessory: ACCESSORIES[1], artifact: 'none', spectacles: false };
let settings = { emotion: 'calm', action: 'idle', warmth: .45, confidence: .72, energy: .5, attention: 'cursor', petting: false, talking: false };
let rig;
let actionStartedAt = performance.now();
let previousTime = performance.now();
let blink = 0;
let nextBlinkAt = performance.now() + 2600;
let saccade = { x: 0, y: 0 };
let nextSaccadeAt = performance.now() + 900;
let cursor = { x: 0, y: 0 };
let zoomLevel = 1;
let cameFromHiding = false;
let selectedLayer = null;
let gridOn = false;
let annotateOn = false;
let layerFilter = 'all';
const springs = Object.fromEntries(['eyeOpen', 'cheeks', 'brow', 'earScale', 'headTilt', 'warmth', 'smile'].map((key) => [key, { value: key === 'eyeOpen' || key === 'earScale' ? 1 : 0, velocity: 0 }]));
const director = createDirector();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function title(value) { return value[0].toUpperCase() + value.slice(1); }
function options(values, labels = {}) { return values.map((value) => `<option value="${value}">${labels[value] ?? title(value)}</option>`).join(''); }

// A bare-animal thumbnail composited from the same layer photos the live rig
// uses (body, ears/crest, arms/wings, eyes, nose/beak) instead of just the
// body crop alone — so the picker shows the whole creature, not a headless
// torso. Wardrobe (suit/tie) is intentionally left off so every card reads
// consistently regardless of the current outfit.
const THUMB_PARTS = ['body', 'armL', 'armR', 'wingL', 'wingR', 'tail', 'earL', 'earR', 'crestL', 'crestR', 'eyepatchL', 'eyepatchR', 'eyeL', 'eyeR', 'nose', 'beak', 'horn'];
function crewThumbHTML(species) {
  const L = species.photoLayers;
  return THUMB_PARTS.filter((name) => L[name]).map((name) => {
    const p = L[name];
    const left = ((p.x - p.w / 2) / 400) * 100;
    const top = ((p.y - p.h / 2) / 440) * 100;
    const w = (p.w / 400) * 100;
    const h = (p.h / 440) * 100;
    const rot = p.rot ?? 0;
    return `<img src="./${p.file}" style="position:absolute;left:${left}%;top:${top}%;width:${w}%;height:${h}%;transform:rotate(${rot}deg);" alt="" />`;
  }).join('');
}

function mountControls() {
  els.emotion.innerHTML = options(EMOTIONS);
  els.actions.innerHTML = ACTIONS.map((value) => `<button type="button" data-value="${value}" class="${value === 'idle' ? 'active' : ''}">${ACTION_LABELS[value] ?? title(value)}</button>`).join('')
    + `<button type="button" data-toggle="talking">Talk</button>`;
  els.suit.innerHTML = options(SUITS, SUIT_LABELS);
  els.accessory.innerHTML = options(ACCESSORIES, ACCESSORY_LABELS);
  els.artifact.innerHTML = options(ARTIFACTS);
  els.suit.value = appearance.suit;
  els.accessory.value = appearance.accessory;
  els.artifact.value = appearance.artifact;
  els.crew.innerHTML = SPECIES.map((species) => `<button type="button" class="crew-card ${species.id === selectedSpecies.id ? 'active' : ''}" data-id="${species.id}" aria-label="Choose ${species.name}"><span class="crew-thumb">${crewThumbHTML(species)}</span><span class="species-name">${species.name}</span></button>`).join('');
  updateCopy();
}

function renderLayerList() {
  if (!els.layerList || !rig) return;
  const groupByName = new Map(buildLayerManifest({ species: selectedSpecies.id, appearance }).map((layer) => [layer.name, layer.group]));
  const names = [...rig.layers.keys()].filter((name) => {
    if (layerFilter === 'all') return true;
    const bucket = ACCESSORY_GROUPS.has(groupByName.get(name)) ? 'accessory' : 'body';
    return bucket === layerFilter;
  });
  els.layerList.innerHTML = names.map((name) => `<button type="button" data-layer="${name}" class="${name === selectedLayer ? 'active' : ''}">${name}</button>`).join('');
}

function selectSpecies(id) {
  selectedSpecies = getSpecies(id);
  rig?.rebuild({ species: selectedSpecies.id, appearance });
  els.host.setAttribute('aria-label', `${selectedSpecies.name}, a fully layered felt Zazoo character`);
  [...els.crew.children].forEach((card) => card.classList.toggle('active', card.dataset.id === id));
  const index = SPECIES.findIndex((species) => species.id === selectedSpecies.id);
  els.count.textContent = `${String(index + 1).padStart(2, '0')} / ${SPECIES.length}`;
  selectedLayer = null;
  rig?.highlightLayer(null);
  renderLayerList();
}

function setAppearance(next = {}) {
  appearance = { ...appearance, ...next };
  rig?.rebuild({ species: selectedSpecies.id, appearance });
  els.suit.value = appearance.suit;
  els.accessory.value = appearance.accessory;
  els.artifact.value = appearance.artifact;
  els.spectacles.checked = appearance.spectacles;
  updateCopy();
  selectedLayer = null;
  rig?.highlightLayer(null);
  renderLayerList();
  return appearance;
}

function updateCopy() {
  els.label.textContent = `${title(settings.emotion)} · ${title(settings.action)}`;
  els.api.textContent = `perform({ emotion: '${settings.emotion}', action: '${settings.action}', artifact: '${appearance.artifact}', accessory: '${appearance.accessory}' })`;
}

function perform(next = {}) {
  const priorAction = settings.action;
  const appearanceKeys = ['suit', 'accessory', 'artifact', 'spectacles'];
  const appearanceChange = Object.fromEntries(Object.entries(next).filter(([key]) => appearanceKeys.includes(key)));
  const performanceChange = Object.fromEntries(Object.entries(next).filter(([key]) => !appearanceKeys.includes(key)));
  if (Object.keys(appearanceChange).length) setAppearance(appearanceChange);
  settings = { ...settings, ...performanceChange };
  if (settings.action !== priorAction) {
    actionStartedAt = performance.now();
    if (priorAction === 'hiding' && settings.action !== 'hiding') {
      cameFromHiding = true;
      setTimeout(() => { cameFromHiding = false; }, 650);
    }
  }
  director.perform(settings);
  els.emotion.value = settings.emotion;
  [...els.actions.children].forEach((button) => {
    if (button.dataset.toggle === 'talking') button.classList.toggle('active', settings.talking);
    else button.classList.toggle('active', button.dataset.value === settings.action);
  });
  [...els.attention.children].forEach((button) => button.classList.toggle('active', button.dataset.value === settings.attention));
  for (const key of ['warmth', 'confidence', 'energy']) {
    const input = els[key];
    input.value = Math.round(settings[key] * 100);
    input.style.setProperty('--fill', `${input.value}%`);
    $(`#${key}-output`).value = input.value;
  }
  updateCopy();
  return director.snapshot().pose;
}

function gestureAt(snapshot, time) {
  if (!snapshot.gesture) return null;
  return { name: snapshot.gesture.name, progress: Math.min(1, (time - snapshot.gesture.startedAt) / snapshot.gesture.duration) };
}

function animate(time) {
  const dt = Math.min(.05, (time - previousTime) / 1000);
  previousTime = time;
  director.tick();
  const snapshot = director.snapshot();
  const rawPose = snapshot.pose;
  const energyHz = 1.2 + rawPose.energy * 1.2;
  for (const key of Object.keys(springs)) springs[key] = stepSpring(springs[key], rawPose.channels[key] ?? 0, dt, key === 'eyeOpen' ? 2.5 : energyHz);
  const pose = { ...rawPose, channels: { ...rawPose.channels, ...Object.fromEntries(Object.entries(springs).map(([key, value]) => [key, value.value])) } };

  if (!pose.suspendLife && time >= nextBlinkAt) {
    blink = 1;
    const cadence = Number.isFinite(pose.blink.every) ? pose.blink.every : 30;
    nextBlinkAt = time + cadence * (760 + Math.random() * 420);
    setTimeout(() => { blink = 0; }, 110 / Math.max(.3, pose.blink.speed));
  }
  if (pose.saccades && time >= nextSaccadeAt) {
    saccade = { x: (Math.random() - .5) * pose.saccadeAmount, y: (Math.random() - .5) * pose.saccadeAmount };
    nextSaccadeAt = time + 850 + Math.random() * 1900;
  }

  let gx = pose.gaze[0], gy = pose.gaze[1];
  if (pose.attention === 'user') { gx = 0; gy = 0; }
  if (pose.attention === 'cursor') { gx = cursor.x; gy = cursor.y; }
  if (pose.attention === 'away') { gx = 0; gy = .82; }
  gx = Math.max(-1, Math.min(1, gx + saccade.x)); gy = Math.max(-1, Math.min(1, gy + saccade.y));
  const seconds = (time - actionStartedAt) / 1000;
  const motion = evaluateMotion({ pose, gesture: gestureAt(snapshot, time), seconds, reducedMotion, cameFromHiding });
  rig?.update({ pose, motion, gaze: { x: gx, y: gy }, blink, seconds });
  requestAnimationFrame(animate);
}

function setupAnnotationCanvas() {
  const canvas = els.annotateCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const rect = els.stage.getBoundingClientRect();
    const prev = canvas.width ? canvas.toDataURL() : null;
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#e0483d';
    ctx.lineWidth = 3;
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = prev;
    }
  };
  new ResizeObserver(resize).observe(els.stage);
  resize();
  let drawing = false;
  canvas.addEventListener('pointerdown', (event) => {
    if (!annotateOn) return;
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    ctx.stroke();
  });
  const stop = () => { drawing = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
}

function bindEvents() {
  els.crew.addEventListener('click', (event) => { const card = event.target.closest('.crew-card'); if (card) selectSpecies(card.dataset.id); });
  els.emotion.addEventListener('change', () => perform({ emotion: els.emotion.value }));
  els.actions.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.toggle === 'talking') perform({ talking: !settings.talking });
    else perform({ action: button.dataset.value });
  });
  els.attention.addEventListener('click', (event) => { const button = event.target.closest('button'); if (button) perform({ attention: button.dataset.value }); });
  els.suit.addEventListener('change', () => setAppearance({ suit: els.suit.value }));
  els.accessory.addEventListener('change', () => setAppearance({ accessory: els.accessory.value }));
  els.artifact.addEventListener('change', () => setAppearance({ artifact: els.artifact.value }));
  els.spectacles.addEventListener('change', () => setAppearance({ spectacles: els.spectacles.checked }));
  for (const key of ['warmth', 'confidence', 'energy']) els[key].addEventListener('input', () => perform({ [key]: Number(els[key].value) / 100 }));
  els.layerList?.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const name = button.dataset.layer;
    selectedLayer = selectedLayer === name ? null : name;
    rig?.highlightLayer(selectedLayer);
    renderLayerList();
  });
  els.layerFilter?.addEventListener('change', () => { layerFilter = els.layerFilter.value; renderLayerList(); });
  els.zoomIn?.addEventListener('click', () => { zoomLevel = Math.min(2.2, zoomLevel + .15); rig?.setZoom(zoomLevel); els.zoomReset.textContent = `${Math.round(zoomLevel * 100)}%`; });
  els.zoomOut?.addEventListener('click', () => { zoomLevel = Math.max(.5, zoomLevel - .15); rig?.setZoom(zoomLevel); els.zoomReset.textContent = `${Math.round(zoomLevel * 100)}%`; });
  els.zoomReset?.addEventListener('click', () => { zoomLevel = 1; rig?.setZoom(zoomLevel); els.zoomReset.textContent = '100%'; });
  els.gridToggle?.addEventListener('click', () => { gridOn = !gridOn; rig?.setGrid(gridOn); els.gridToggle.classList.toggle('active', gridOn); });
  els.annotateToggle?.addEventListener('click', () => {
    annotateOn = !annotateOn;
    els.annotateToggle.classList.toggle('active', annotateOn);
    els.annotateCanvas?.classList.toggle('active', annotateOn);
  });
  els.annotateClear?.addEventListener('click', () => {
    const ctx = els.annotateCanvas?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, els.annotateCanvas.width, els.annotateCanvas.height);
  });
  setupAnnotationCanvas();
  els.stage.addEventListener('pointermove', (event) => {
    const rect = els.stage.getBoundingClientRect();
    cursor = { x: ((event.clientX - rect.left) / rect.width - .5) * 2, y: ((event.clientY - rect.top) / rect.height - .5) * 2 };
  });
  els.host.addEventListener('pointerdown', (event) => { els.host.setPointerCapture(event.pointerId); perform({ petting: true }); });
  els.host.addEventListener('pointerup', () => perform({ petting: false }));
  els.host.addEventListener('pointercancel', () => perform({ petting: false }));
  els.reset.addEventListener('click', () => {
    setAppearance({ suit: SUITS[1], accessory: ACCESSORIES[1], artifact: 'none', spectacles: false });
    perform({ emotion: 'calm', action: 'idle', warmth: .45, confidence: .72, energy: .5, attention: 'cursor', petting: false, talking: false });
  });
  els.copy.addEventListener('click', async () => {
    await navigator.clipboard?.writeText(els.api.textContent);
    els.copy.textContent = 'Copied'; setTimeout(() => { els.copy.textContent = 'Copy'; }, 1200);
  });
}

mountControls();
bindEvents();
rig = await PixiZazooRig.create(els.host, { species: selectedSpecies.id, appearance });
selectSpecies(selectedSpecies.id);
perform(settings);
window.zazoo = Object.freeze({ perform, setAppearance, get state() { return { ...director.snapshot(), appearance, species: selectedSpecies.id }; }, species: SPECIES });
requestAnimationFrame(animate);
