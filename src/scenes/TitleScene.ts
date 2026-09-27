/**
 * TitleScene — the main menu.
 *
 * An animated Emberfall-at-night backdrop, a drifting ember field, the logo,
 * and the main menu itself. Every entry is wired to a real destination so the
 * menu is never a dead end, even while later scenes are still being built.
 */

import Phaser from 'phaser';
import { GAME_CODENAME, GAME_VERSION } from '../config/constants';
import { palette } from '../config/palette';
import { WaystoneGlyph } from '../gfx/WaystoneGlyph';
import { MenuList } from '../ui/MenuList';
import { SCENES } from './registry';

interface MenuEntry {
  label: string;
  action: () => void;
  enabled: () => boolean;
  hint: string;
}

export class TitleScene extends Phaser.Scene {
  private glyph!: WaystoneGlyph;
  private menu!: MenuList;
  private clock = 0;
  private continueEntry!: MenuEntry;
  private t = 0;

  constructor() {
    super({ key: SCENES.TITLE });
  }

  create(): void {
    this.t = 0;
    this.cameras.main.setBackgroundColor(palette.voidBlack);
    const { width, height } = this.scale;

    this.paintSky();

    // Embers drifting up past the logo.
    this.add.particles(0, 0, 'px', {
      x: { min: -20, max: width + 20 },
      y: { min: height + 10, max: height + 30 },
      lifespan: { min: 4200, max: 7600 },
      speedY: { min: -26, max: -10 },
      speedX: { min: -7, max: 7 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 0.7, end: 0 },
      quantity: 1,
      frequency: 210,
      blendMode: 'ADD',
    });

    // Horizon silhouette — a treeline + the village on a ridge.
    this.paintHorizon();

    // A waystone on the ridge, slowly turning.
    this.glyph = new WaystoneGlyph(this, width * 0.5, height * 0.42, 'ember', 40);

    this.paintLogo(width, height);

    this.continueEntry = {
      label: 'Continue',
      action: () => this.startNewGame(),
      enabled: () => false,
      hint: 'No saved journals found',
    };

    const entries: MenuEntry[] = [
      this.continueEntry,
      { label: 'New Game', action: () => this.startNewGame(), enabled: () => true, hint: 'Begin the road north' },
      { label: 'Load Game', action: () => this.toast('Load Game — coming in a future build'), enabled: () => true, hint: 'Read an old journal' },
      { label: 'Options', action: () => this.toast('Options — coming in a future build'), enabled: () => true, hint: 'Sound and text' },
      { label: 'Credits', action: () => this.toast('Credits — coming in a future build'), enabled: () => true, hint: 'Who made this' },
    ];

    this.menu = new MenuList(this, {
      x: 12,
      y: Math.round(height * 0.6),
      entries: entries.map((e) => ({ label: e.label, hint: e.hint, enabled: e.enabled() })),
      onSelect: (i) => entries[i].action(),
      onHover: (i) => entries[i].hint,
    });

    // Footer.
    this.add
      .text(width - 12, height - 10, `${GAME_CODENAME} v${GAME_VERSION}`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '10px',
        color: palette.stone,
      })
      .setOrigin(1, 1);

    this.add
      .text(12, height - 10, 'a game by Gab  ·  landscape recommended', {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '10px',
        color: palette.stone,
      })
      .setOrigin(0, 1);

    // --- input ---
    const kb = this.input.keyboard;
    if (kb) {
      kb.on('keydown-UP', () => this.menu.move(-1));
      kb.on('keydown-DOWN', () => this.menu.move(1));
      kb.on('keydown-W', () => this.menu.move(-1));
      kb.on('keydown-S', () => this.menu.move(1));
      kb.on('keydown-ENTER', () => this.menu.activate());
      kb.on('keydown-SPACE', () => this.menu.activate());
    }

    // Tap/click anywhere on the left column to pick a row (mobile friendly).
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const row = this.menu.hitTest(p.x, p.y);
      if (row >= 0) {
        this.menu.setIndex(row);
        this.menu.activate();
      }
    });

    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.layout, this);
    });

    this.menu.setIndex(1);
  }

  // ------------------------------------------------------------------ art

  private paintSky(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    const bands = 30;
    const top = Phaser.Display.Color.HexStringToColor(palette.voidBlack);
    const mid = Phaser.Display.Color.HexStringToColor(palette.nightDeep);
    const low = Phaser.Display.Color.HexStringToColor('#3a1f2e');

    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const c = t < 0.6
        ? Phaser.Display.Color.Interpolate.ColorWithColor(top, mid, 100, Math.round((t / 0.6) * 100))
        : Phaser.Display.Color.Interpolate.ColorWithColor(mid, low, 100, Math.round(((t - 0.6) / 0.4) * 100));
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(0, Math.floor((i * height) / bands), width, Math.ceil(height / bands) + 1);
    }

    // Stars, denser at the top.
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.55;
      const a = (1 - y / (height * 0.55)) * (0.25 + Math.random() * 0.6);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.paper).color, a);
      g.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }

    // The moon, low and cold — the story's framing device.
    const mx = width * 0.78;
    const my = height * 0.2;
    const mr = Math.max(9, Math.min(width, height) * 0.045);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.frostPale).color, 0.1);
    g.fillCircle(mx, my, mr * 2.2);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.frostPale).color, 0.92);
    g.fillCircle(mx, my, mr);
    g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.frostDark).color, 0.25);
    g.fillCircle(mx - mr * 0.3, my - mr * 0.2, mr * 0.28);
    g.fillCircle(mx + mr * 0.25, my + mr * 0.3, mr * 0.18);
  }

  private paintHorizon(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    const ridgeY = height * 0.5;

    // Two layers of hills for depth.
    const layers: Array<[number, string, number]> = [
      [ridgeY, '#241a2c', 0.85],
      [ridgeY + 14, '#160f1e', 1],
    ];

    for (const [baseY, color, alpha] of layers) {
      g.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, alpha);
      g.beginPath();
      g.moveTo(0, height);
      g.lineTo(0, baseY);
      // Deterministic pseudo-random ridge so it doesn't re-shuffle on resize.
      let seed = 7;
      const rnd = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
      };
      const steps = 22;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const y = baseY - 10 + Math.sin(i * 0.9) * 6 + rnd() * 9;
        g.lineTo(x, y);
      }
      g.lineTo(width, height);
      g.closePath();
      g.fillPath();
    }

    // Village lights along the near ridge.
    for (let i = 0; i < 14; i++) {
      const x = ((i * 37) % 100) / 100 * width;
      const y = ridgeY + 12 + ((i * 13) % 7);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.emberBright).color, 0.75);
      g.fillRect(Math.floor(x), Math.floor(y), 1, 1);
      g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.ember).color, 0.12);
      g.fillRect(Math.floor(x) - 2, Math.floor(y) - 2, 5, 5);
    }
  }

  private paintLogo(width: number, height: number): void {
    const size = Phaser.Math.Clamp(Math.round(height * 0.14), 26, 54);
    const y = height * 0.2;

    if (this.textures.exists('ui:logo')) {
      const img = this.add.image(width / 2, y, 'ui:logo');
      const scale = (width * 0.62) / img.width;
      img.setScale(Math.min(1, scale));
    } else {
      this.add
        .text(width / 2, y, 'EMBERWAKE', {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: `${size}px`,
          color: palette.emberPale,
          letterSpacing: 8,
        })
        .setOrigin(0.5)
        .setShadow(0, 0, palette.ember, 22, false, true);
    }

    this.add
      .text(width / 2, y + size * 0.62, 'The Last Waystone', {
        fontFamily: 'Georgia, serif',
        fontSize: `${Math.max(9, Math.round(size * 0.3))}px`,
        color: palette.stonePale,
        letterSpacing: 4,
      })
      .setOrigin(0.5);
  }

  // ---------------------------------------------------------------- logic

  private startNewGame(): void {
    this.cameras.main.fadeOut(220, 10, 7, 16);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.WORLD, { mode: 'new' });
    });
  }

  private toast(message: string): void {
    const { width, height } = this.scale;
    const t = this.add
      .text(width / 2, height - 26, message, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '11px',
        color: palette.emberBright,
        backgroundColor: 'rgba(8,6,16,0.85)',
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1600, () => {
      this.tweens.add({
        targets: t,
        alpha: 0,
        duration: 260,
        onComplete: () => t.destroy(),
      });
    });
  }

  private layout(): void {
    // Menus re-anchor to the new viewport; the backdrop is cheap to rebuild.
    this.scene.restart();
  }

  override update(_time: number, delta: number): void {
    this.clock += delta;
    this.glyph.update(delta);

    // Slow breathing on the logo lockup.
    this.t += delta;
    const title = this.children.list.find(
      (c) => c instanceof Phaser.GameObjects.Text && c.text.includes('EMBERWAKE'),
    ) as Phaser.GameObjects.Text | undefined;
    if (title) {
      title.setAlpha(0.94 + Math.sin(this.clock * 0.0012) * 0.06);
    }

    if (this.menu) this.menu.update(delta);
  }
}
