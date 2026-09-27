/**
 * Scene registry — the single source of truth for scene order and classes.
 *
 * Kept separate so `main.ts` doesn't need to import every scene, and so tests
 * can assert on the scene list without booting the game.
 *
 * Phaser starts only the *first* scene in the list automatically (the rest run
 * only if they carry `active: true`), so Boot is listed first and the rest
 * launch themselves via `scene.start()`.
 */

import type Phaser from 'phaser';
import { BootScene } from './BootScene';
import { TitleScene } from './TitleScene';
import { WorldScene } from './WorldScene';

export const SCENES = {
  BOOT: 'Boot',
  TITLE: 'Title',
  WORLD: 'World',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];

export function sceneRegistry(): Phaser.Scene[] {
  return [new BootScene(), new TitleScene(), new WorldScene()];
}
