/**
 * WorldScene — the overworld shell.
 *
 * Milestone M1 stub: establishes the camera, lighting model and safe-area HUD
 * frame that every overworld feature (player, NPCs, waystones, encounters)
 * will hang off. Deliberately renders a placeholder floor so the scene can be
 * entered and verified before the map pipeline lands.
 */

import Phaser from 'phaser';
import { DEPTH, TILE_SIZE, WORLD_ZOOM } from '../config/constants';
import { palette } from '../config/palette';
import { SCENES } from './registry';

export interface WorldLaunchData {
  mode: 'new' | 'load';
  slot?: number;
  regionId?: string;
  spawnId?: string;
}

export class WorldScene extends Phaser.Scene {
  private started = 0;

  constructor() {
    super({ key: SCENES.WORLD });
  }

  create(data: WorldLaunchData): void {
    this.started = this.time.now;
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#141a12');
    this.cameras.main.setZoom(WORLD_ZOOM);
    this.cameras.main.centerOn(width / WORLD_ZOOM / 2, height / WORLD_ZOOM / 2);

    this.paintPlaceholderGround();

    this.add
      .text(width / 2, 26, 'EMBERFALL', {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: palette.emberPale,
        letterSpacing: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.IN_WORLD_UI)
      .setShadow(0, 1, '#000', 3);

    this.add
      .text(
        width / 2,
        46,
        data.mode === 'new'
          ? 'The Shattering left five veils. You have a lantern and a name.'
          : 'Reading your journal…',
        {
          fontFamily: 'Georgia, serif',
          fontSize: '10px',
          color: palette.paperDim,
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.IN_WORLD_UI);

    this.add
      .text(
        width / 2,
        height - 20,
        'Overworld shell online — map pipeline next',
        {
          fontFamily: 'ui-monospace, monospace',
          fontSize: '10px',
          color: palette.stone,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.IN_WORLD_UI);

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start(SCENES.TITLE));
  }

  /** Chequered floor so camera motion and zoom are visible immediately. */
  private paintPlaceholderGround(): void {
    const g = this.add.graphics().setDepth(DEPTH.GROUND);
    const tiles = 40;
    const a = Phaser.Display.Color.HexStringToColor('#20301c').color;
    const b = Phaser.Display.Color.HexStringToColor('#1a2817').color;
    for (let y = 0; y < tiles; y++) {
      for (let x = 0; x < tiles; x++) {
        g.fillStyle((x + y) % 2 === 0 ? a : b, 1);
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  override update(): void {
    // Gentle drift so the placeholder doesn't feel frozen.
    const t = (this.time.now - this.started) * 0.004;
    this.cameras.main.setScroll(
      Math.cos(t) * 20,
      Math.sin(t * 0.8) * 12,
    );
  }
}
