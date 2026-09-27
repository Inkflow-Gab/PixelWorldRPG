/**
 * BootScene — the game's loading animation.
 *
 * Responsibilities:
 *  1. Paint an immediately-visible animated Waystone so there is never a blank
 *     frame while the (large) asset set downloads.
 *  2. Bind the progress bar to *real* loader progress.
 *  3. Rotate lore tips while the player waits.
 *  4. Generate the runtime textures the rest of the game needs (bitmaps, UI
 *     panels, particle sparks) so no scene has to wait on the network.
 *  5. Hand off to the title screen.
 *
 * It deliberately does almost all of its work in `create()` rather than
 * `preload()` so the animation is alive during the download.
 */

import Phaser from 'phaser';
import { GAME_CODENAME, GAME_SUBTITLE, GAME_TITLE, GAME_VERSION } from '../config/constants';
import { palette } from '../config/palette';
import { pickTips } from '../data/lore';
import { WaystoneGlyph } from '../gfx/WaystoneGlyph';
import { buildAllTextures } from '../gfx/textureFactory';
import { buildLoadQueue } from '../assets/manifest';
import { SCENES } from './registry';

const TIP_MS = 4200;

export class BootScene extends Phaser.Scene {
  private glyph!: WaystoneGlyph;
  private progressFill!: Phaser.GameObjects.Graphics;
  private progressLabel!: Phaser.GameObjects.Text;
  private tipText!: Phaser.GameObjects.Text;
  private tips: string[] = [];
  private tipIndex = 0;
  private tipTimer = 0;
  private tipFade = 0;
  private smoothed = 0;
  private ready = false;
  private totalItems = 1;
  private failed: string[] = [];

  constructor() {
    super({ key: SCENES.BOOT });
  }

  create(): void {
    this.tips = pickTips(6).map((t) => t.text);

    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2 - Math.min(18, height * 0.04);

    // ---- Backdrop -------------------------------------------------------
    this.cameras.main.setBackgroundColor(palette.voidBlack);

    const bg = this.add.graphics();
    this.paintBackdrop(bg, width, height);

    // Drifting embers give the static backdrop life while loading.
    this.add.particles(0, 0, 'px', {
      x: { min: 0, max: width },
      y: { min: height, max: height + 40 },
      lifespan: { min: 3600, max: 6400 },
      speedY: { min: -34, max: -14 },
      speedX: { min: -9, max: 9 },
      scale: { start: 1.1, end: 0 },
      alpha: { start: 0.85, end: 0 },
      quantity: 1,
      frequency: 190,
      blendMode: 'ADD',
    });

    // ---- The Waystone ---------------------------------------------------
    this.glyph = new WaystoneGlyph(this, cx, cy - 16, 'ember', 46);

    // ---- Title lockup ---------------------------------------------------
    const titleY = cy + 74;
    const titleSize = Phaser.Math.Clamp(Math.round(height * 0.108), 20, 42);

    this.add
      .text(cx, titleY, GAME_TITLE, {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: `${titleSize}px`,
        color: palette.emberPale,
        letterSpacing: 6,
      })
      .setOrigin(0.5)
      .setShadow(0, 0, palette.ember, 18, false, true);

    this.add
      .text(cx, titleY + titleSize * 0.82, GAME_SUBTITLE, {
        fontFamily: 'Georgia, serif',
        fontSize: `${Math.max(9, Math.round(titleSize * 0.36))}px`,
        color: palette.stonePale,
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    // ---- Progress -------------------------------------------------------
    const barW = Math.min(300, width * 0.52);
    const barY = cy + 116;
    const barH = 5;

    const barBg = this.add.graphics();
    barBg.fillStyle(Phaser.Display.Color.HexStringToColor(palette.stoneDark).color, 0.85);
    barBg.fillRoundedRect(cx - barW / 2, barY, barW, barH, 2);
    barBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(palette.stone).color, 0.9);
    barBg.strokeRoundedRect(cx - barW / 2, barY, barW, barH, 2);

    this.progressFill = this.add.graphics();
    this.drawProgress(0);

    this.progressLabel = this.add
      .text(cx, barY + barH + 14, '0%', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '11px',
        color: palette.stonePale,
      })
      .setOrigin(0.5);

    // ---- Lore tips ------------------------------------------------------
    this.tipText = this.add
      .text(cx, barY + barH + 44, '', {
        fontFamily: 'Georgia, serif',
        fontSize: `${Math.max(9, Math.round(height * 0.032))}px`,
        color: palette.paperDim,
        align: 'center',
        wordWrap: { width: Math.min(420, width * 0.78) },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0);

    this.showTip(0, true);

    // ---- Beta stamp + creator credit ------------------------------------
    this.add
      .text(width - 12, height - 10, `${GAME_CODENAME} v${GAME_VERSION}`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '10px',
        color: palette.stone,
      })
      .setOrigin(1, 1);

    this.add
      .text(12, height - 10, 'a game by Gab', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '10px',
        color: palette.stone,
      })
      .setOrigin(0, 1);

    // ---- Kick off the real load -----------------------------------------
    this.load.on(Phaser.Loader.Events.PROGRESS, this.onProgress, this);
    this.load.on(Phaser.Loader.Events.COMPLETE, this.onComplete, this);
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onFileError, this);

    this.load.once(Phaser.Loader.Events.START, () => {
      // Procedural textures first, so no queued file can be a dependency.
      buildAllTextures(this);
      this.enqueueAssets();
    });

    this.load.start();
  }

  /**
   * Queue every manifest entry.
   *
   * A missing file is a warning, not a hard failure: a partially-prepared
   * `public/assets` should still boot into the title screen so the rest of the
   * game stays testable. CI's `assets:verify` is what guarantees completeness.
   */
  private enqueueAssets(): void {
    const queue = buildLoadQueue();
    this.totalItems = queue.length;

    for (const item of queue) {
      if (item.type === 'audio') {
        this.load.audio(item.key, item.url);
      } else if (item.sheet && item.frameWidth && item.frameHeight) {
        this.load.spritesheet(item.key, item.url, {
          frameWidth: item.frameWidth,
          frameHeight: item.frameHeight,
        });
      } else {
        this.load.image(item.key, item.url);
      }
    }
  }

  // ---------------------------------------------------------------- helpers

  private paintBackdrop(g: Phaser.GameObjects.Graphics, w: number, h: number): void {
    // A vertical night gradient, faked with stacked translucent bands so we
    // never need a full-screen image.
    const bands = 26;
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.HexStringToColor(palette.nightMid),
        Phaser.Display.Color.HexStringToColor(palette.voidBlack),
        100,
        Math.round(t * 100),
      );
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(0, Math.floor((i * h) / bands), w, Math.ceil(h / bands) + 1);
    }

    // Warm pool of light behind the glyph.
    const glowR = Math.min(w, h) * 0.42;
    for (let i = 6; i >= 1; i--) {
      g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.emberDark).color, 0.035 * i * 0.5);
      g.fillCircle(w / 2, h / 2 - 16, (glowR * i) / 6);
    }

    // Vignette.
    for (let i = 0; i < 10; i++) {
      g.lineStyle(Math.max(2, h * 0.03), Phaser.Display.Color.HexStringToColor(palette.voidBlack).color, 0.06);
      g.strokeRect(-h * 0.03 * i, -h * 0.03 * i, w + h * 0.06 * i, h + h * 0.06 * i);
    }
  }

  private drawProgress(t: number): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const barW = Math.min(300, width * 0.52);
    const barY = height / 2 - Math.min(18, height * 0.04) + 116;
    const barH = 5;

    this.progressFill.clear();
    if (t <= 0.001) return;

    const fillW = Math.max(2, barW * t);
    const ember = Phaser.Display.Color.HexStringToColor(palette.ember).color;
    const bright = Phaser.Display.Color.HexStringToColor(palette.emberBright).color;

    this.progressFill.fillStyle(ember, 0.85);
    this.progressFill.fillRoundedRect(cx - barW / 2, barY, fillW, barH, 2);
    this.progressFill.fillStyle(bright, 0.95);
    this.progressFill.fillRoundedRect(cx - barW / 2, barY, Math.max(1, fillW * 0.35), barH, 2);
  }

  private showTip(index: number, immediate = false): void {
    if (!this.tips.length) return;
    this.tipText.setText(this.tips[index % this.tips.length]);
    this.tipText.setAlpha(immediate ? 1 : 0);
    this.tipFade = immediate ? 1 : 0;
  }

  // ------------------------------------------------------------- callbacks

  private onProgress(value: number): void {
    this.smoothed = value;
  }

  private onFileError(file: Phaser.Loader.File): void {
    this.failed.push(file.key);
  }

  private onComplete(): void {
    this.smoothed = 1;
    this.ready = true;

    if (this.failed.length) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Emberwake] ${this.failed.length}/${this.totalItems} assets failed to load. ` +
          `Run \`npm run assets\` to prepare public/assets/.`,
        this.failed,
      );
    }
  }

  // ---------------------------------------------------------------- update

  override update(_time: number, delta: number): void {
    this.glyph.update(delta);

    // Ease the bar toward real progress so it never jumps backwards.
    const target = this.smoothed;
    this.smoothed += (target - this.smoothed) * 0.25;
    this.drawProgress(this.smoothed);
    this.progressLabel.setText(`${Math.round(this.smoothed * 100)}%`);

    // Lore tip rotation.
    this.tipTimer += delta;
    if (this.tipFade < 1) {
      this.tipFade = Math.min(1, this.tipFade + delta / 520);
      this.tipText.setAlpha(this.tipFade);
    }
    if (this.tipTimer > TIP_MS) {
      this.tipTimer = 0;
      this.tipIndex++;
      this.showTip(this.tipIndex);
    }

    if (this.ready && this.smoothed > 0.995) {
      this.ready = false;
      this.time.delayedCall(420, () => this.scene.start(SCENES.TITLE));
    }
  }
}
