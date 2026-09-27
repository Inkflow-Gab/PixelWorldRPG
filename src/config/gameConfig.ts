/**
 * Global Phaser game configuration.
 *
 * Kept in its own module so the scene list and renderer settings can be
 * unit-referenced and tweaked without touching the bootstrap.
 */

import Phaser from 'phaser';
import { sceneRegistry } from '../scenes/registry';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { palette } from './palette';

export function gameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: palette.voidBlack,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    render: {
      // Nearest-neighbour keeps the pixel art crisp at every zoom level.
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      powerPreference: 'high-performance',
      transparent: false,
    },
    dom: {
      createContainer: false,
    },
    audio: {
      disableWebAudio: false,
      noAudio: false,
    },
    input: {
      activePointers: 4,
      touch: { capture: true },
      smoothFactor: 0.0,
      mouse: { preventDefaultWheel: true },
    },
    disableContextMenu: true,
    scene: sceneRegistry(),
  };
}
