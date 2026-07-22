import ENGINE_RIGS from '../assets/generated/v3/engine_rigs.js';
import SUITS_MANIFEST from '../assets/generated/v3/suits_manifest.js';

const TIE_COLORS = ['beige', 'black', 'brown', 'charcoal', 'denim', 'forest', 'gray', 'mint', 'mustard', 'ochre', 'olive', 'pine', 'powder', 'rust', 'sage', 'sienna', 'slate', 'tan', 'white'];

export const ACCESSORIES = Object.freeze(['none', ...TIE_COLORS]);
// Every option here is a necktie in a different color — label it as a tie
// (not just the bare color name) so it's clear what's being selected.
export const ACCESSORY_LABELS = Object.freeze(Object.fromEntries(TIE_COLORS.map((id) => [id, `Tie · ${id[0].toUpperCase() + id.slice(1)}`])));
export const ARTIFACTS = Object.freeze(['none', 'carrot', 'bamboo', 'flower', 'honey']);

export const SUITS_META = SUITS_MANIFEST;
export const SUITS = Object.freeze(['none', ...SUITS_MANIFEST.map((suit) => suit.id)]);
export const SUIT_LABELS = Object.freeze(Object.fromEntries(SUITS_MANIFEST.map((suit) => [suit.id, suit.name])));
export const SUIT_FILES = Object.freeze(Object.fromEntries(SUITS_MANIFEST.map((suit) => [suit.id, suit.file])));
// Natural width/height ratio of each suit's own crop — different sheets
// (Set 1-4) were drawn at different proportions, so suits render at a
// fixed width but their OWN aspect ratio (see pixi-rig.js's suit case)
// instead of being force-stretched into one box and looking squished.
export const SUIT_ASPECT = Object.freeze(Object.fromEntries(SUITS_MANIFEST.map((suit) => [suit.id, suit.w / suit.h])));
export const TIE_FILES = Object.freeze(Object.fromEntries(TIE_COLORS.map((id) => [id, `accessories/tie_${id}.png`])));

const PHOTO_META = {
  hippo:    { name: 'Hippo',    body: 0xb7b3ae },
  koala:    { name: 'Koala',    body: 0x9b9b94 },
  otter:    { name: 'Otter',    body: 0x8a94a0 },
  rhino:    { name: 'Rhino',    body: 0xb9b6b0 },
  beaver:   { name: 'Beaver',   body: 0x9a7a58 },
  pig:      { name: 'Pig',      body: 0xe3b8b4 },
  parrot:   { name: 'Parrot',   body: 0x5f95c2 },
  bluebird: { name: 'Bluebird', body: 0x6f95bd },
  owl:      { name: 'Owl',      body: 0xb98a54 },
  flamingo: { name: 'Flamingo', body: 0xe6a3ad },
  peacock:  { name: 'Peacock',  body: 0x5f9bab },
  cardinal: { name: 'Cardinal', body: 0xc65a3d },
  penguin:  { name: 'Penguin',  body: 0x45494c },
  sloth:    { name: 'Sloth',    body: 0xab9a80 },
};

const PHOTO_SPECIES = Object.entries(ENGINE_RIGS).map(([id, rig]) => ({
  id,
  name: PHOTO_META[id]?.name ?? id,
  kind: rig.kind,
  body: PHOTO_META[id]?.body ?? 0xa8a29a,
  secondary: PHOTO_META[id]?.body ?? 0xa8a29a,
  ear: PHOTO_META[id]?.body ?? 0xa8a29a,
  photo: true,
  photoKind: rig.kind,
  photoLayers: rig.layers,
}));

export const SPECIES = Object.freeze(PHOTO_SPECIES);

const speciesById = new Map(SPECIES.map((species) => [species.id, species]));

export function getSpecies(id) {
  return speciesById.get(id) ?? SPECIES[0];
}

export function resolveAppearance(input = {}) {
  return {
    suit: SUITS.includes(input.suit) ? input.suit : 'none',
    accessory: ACCESSORIES.includes(input.accessory) ? input.accessory : 'none',
    artifact: ARTIFACTS.includes(input.artifact) ? input.artifact : 'none',
    spectacles: Boolean(input.spectacles),
  };
}

export function buildLayerManifest({ species = SPECIES[0].id, appearance: inputAppearance = {} } = {}) {
  const character = getSpecies(species);
  const appearance = resolveAppearance(inputAppearance);
  const layers = [
    { name: 'shadow', z: 0, group: 'world' },
    { name: 'species-back', z: 4, group: 'species', kind: character.kind },
    // Ears paint BEHIND the body/head photo, like real attached ears (a
    // dangling/rabbit ear, a crest) rather than a sticker glued on top. The
    // procedurally-drawn fallback ears (bird triangles, default mammal
    // ellipses) are sized/positioned in pixi-rig.js to clear the head
    // photo's actual silhouette so they still read as visible from behind.
    { name: 'ear-left', z: 6, group: 'species', kind: character.kind },
    { name: 'ear-right', z: 7, group: 'species', kind: character.kind },
    { name: 'body', z: 10, group: 'body' },
    { name: 'felt-texture', z: 11, group: 'body' },
    { name: 'body-shading', z: 12, group: 'body' },
    { name: 'markings', z: 14, group: 'species', kind: character.kind },
  ];

  if (appearance.suit !== 'none' || character.photo) {
    layers.push({ name: 'suit', z: 20, group: 'wardrobe', value: appearance.suit });
  }
  layers.push({ name: 'collar', z: 24, group: 'wardrobe' });
  if (appearance.accessory !== 'none') layers.push({ name: 'tie', z: 28, group: 'wardrobe', value: appearance.accessory });
  if (appearance.artifact !== 'none') layers.push({ name: 'artifact', z: 32, group: 'artifact', value: appearance.artifact });

  layers.push(
    { name: 'arm-left', z: 34, group: 'body' },
    { name: 'arm-right', z: 35, group: 'body' },
    { name: 'action-prop', z: 36, group: 'action' },
    { name: 'muzzle', z: 40, group: 'face', kind: character.kind },
    { name: 'cheek-left', z: 44, group: 'face' },
    { name: 'cheek-right', z: 45, group: 'face' },
    { name: 'eye-left', z: 50, group: 'face' },
    { name: 'eye-right', z: 51, group: 'face' },
    { name: 'pupil-left', z: 54, group: 'face' },
    { name: 'pupil-right', z: 55, group: 'face' },
    { name: 'nose', z: 58, group: 'face' },
    { name: 'horn', z: 58.5, group: 'face' },
    { name: 'mouth', z: 59, group: 'face' },
  );

  layers.push({ name: 'spectacles', z: 62, group: 'artifact' });
  layers.push({ name: 'hide-shell', z: 65, group: 'action' });
  layers.push(
    { name: 'brow-left', z: 70, group: 'face' },
    { name: 'brow-right', z: 71, group: 'face' },
    { name: 'lid-left', z: 80, group: 'face' },
    { name: 'lid-right', z: 81, group: 'face' },
  );
  return layers;
}
