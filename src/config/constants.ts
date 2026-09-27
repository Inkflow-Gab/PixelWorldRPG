/**
 * Game-wide tuning constants.
 *
 * The design resolution is the *baseline* virtual viewport. FitManager widens or
 * tallens this at runtime to match the device, so nothing in the game should
 * assume exactly this size — only the relative proportions.
 */

export const GAME_VERSION = '0.1.0';
export const GAME_CODENAME = 'BETA';
export const GAME_TITLE = 'EMBERWAKE';
export const GAME_SUBTITLE = 'The Last Waystone';

/** Baseline virtual viewport (16:9). FitManager adapts from here. */
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;

/** World tile size in world pixels. */
export const TILE_SIZE = 32;

/** Base camera zoom for the overworld on a reference 360px-tall viewport. */
export const WORLD_ZOOM = 2;
export const BATTLE_ZOOM = 1;
export const UI_ZOOM = 1;

/** Phaser depth bands. Keep them spaced so subsystems can interleave. */
export const DEPTH = {
  GROUND: 0,
  DECAL: 10,
  OVERWORLD_ENTITY: 20,
  OVERWORLD_SORTED: 30,
  WEATHER: 40,
  WEATHER_UI: 50,
  IN_WORLD_UI: 60,
  OVERLAY: 100,
  DIALOGUE: 110,
  MENU: 120,
  TRANSITION: 200,
  TOAST: 210,
  DEBUG: 250,
} as const;

/** Gameplay tuning. */
export const TUNING = {
  playerSpeed: 118,
  npcSpeed: 42,
  enemySpeed: 58,
  interactRadius: 26,
  interactFacing: 44,
  waystoneRadius: 30,
  waystoneChargeMs: 1200,
  respawnDelayMs: 8000,
  saveVersion: 1,
} as const;
