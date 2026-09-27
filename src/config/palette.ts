/**
 * The game's colour language.
 *
 * Pixel art in this project is CC0 art from a single artist, which gives us a
 * small, consistent base palette. These are the *UI / UI-adjacent* colours we
 * derive for ember, frost, rift and stone motifs, so UI, FX, and VFX tinting
 * all speak the same visual language.
 */

export const palette = {
  // Backdrops
  voidBlack: '#0a0710',
  nightDeep: '#120c1c',
  nightMid: '#1d1226',

  // Ember (the hero motif)
  emberDark: '#7a2f10',
  ember: '#ff8a3c',
  emberBright: '#ffb457',
  emberPale: '#ffd9a0',
  emberWhite: '#fff4de',

  // Rift / corruption
  riftDark: '#2a0a2e',
  rift: '#7b1f6b',
  riftBright: '#d64bd0',
  riftPale: '#ff9bf0',

  // Frost
  frostDark: '#1d4a63',
  frost: '#4aa8d8',
  frostBright: '#9fe4ff',
  frostPale: '#e6f8ff',

  // Stone / UI neutral
  stoneDark: '#1a1620',
  stone: '#3a3444',
  stoneLight: '#6b6377',
  stonePale: '#a89fb3',

  // Verdant (nature)
  verdantDark: '#2c4a1c',
  verdant: '#5b8f3a',
  verdantBright: '#8fc95a',

  // Text
  ink: '#120e18',
  paper: '#e8dfd0',
  paperDim: '#b8ad9c',

  // Semantic
  hp: '#d4453f',
  hpDark: '#7a1f1c',
  mp: '#3f7fd4',
  mpDark: '#1c3a7a',
  xp: '#d4a63f',
  xpDark: '#7a5f1c',
  gold: '#e0b040',
  goldDark: '#8a6a18',

  // Rarity
  rarityCommon: '#b8ad9c',
  rarityFine: '#5b8f3a',
  rarityRare: '#4aa8d8',
  rarityEpic: '#a05bd8',
  rarityRelic: '#ffb457',
} as const;

export type PaletteKey = keyof typeof palette;

/** Elemental colours, shared by skills, VFX tinting and the codex. */
export const ELEMENT_COLORS = {
  ember: palette.ember,
  frost: palette.frost,
  verdant: palette.verdant,
  shadow: palette.rift,
  light: palette.emberPale,
  physical: palette.stonePale,
} as const;

export type ElementKey = keyof typeof ELEMENT_COLORS;
