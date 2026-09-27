/**
 * Procedurally-drawn Waystone glyph.
 *
 * The loading screen and the teleporting Waystones share this visual, so it is
 * generated in code rather than loaded from disk: it stays crisp at any zoom,
 * costs nothing to download, and can be re-tinted per-region (ember for
 * normal stones, rift-purple for corrupted ones, frost-blue for sealed ones).
 */

import Phaser from 'phaser';
import { palette } from '../config/palette';

export type GlyphRune = 'ember' | 'rift' | 'frost' | 'dormant';

interface GlyphOptions {
  radius?: number;
  lineWidth?: number;
  color?: string;
  accent?: string;
  runes?: GlyphRune[];
  spokes?: number;
  /** Deterministic variation seed so repeated glyphs aren't identical. */
  seed?: number;
}

const TINTS: Record<GlyphRune, { core: string; glow: string }> = {
  ember: { core: palette.ember, glow: palette.emberBright },
  rift: { core: palette.rift, glow: palette.riftBright },
  frost: { core: palette.frost, glow: palette.frostBright },
  dormant: { core: palette.stone, glow: palette.stoneLight },
};

/** Tiny deterministic PRNG so a given seed always yields the same glyph. */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draws a layered waystone sigil into a Graphics object centred on (0, 0).
 * Layers, outside in: outer rune ring, tick marks, inner ring, spokes, core gem.
 */
export function drawWaystoneGlyph(
  g: Phaser.GameObjects.Graphics,
  rune: GlyphRune = 'ember',
  opts: GlyphOptions = {},
): void {
  const R = opts.radius ?? 40;
  const lw = opts.lineWidth ?? 2;
  const color = opts.color ?? TINTS[rune].core;
  const accent = opts.accent ?? TINTS[rune].glow;
  const rnd = mulberry(opts.seed ?? 1);

  g.clear();

  // Outer ring.
  g.lineStyle(lw, Phaser.Display.Color.HexStringToColor(color).color, 0.95);
  g.strokeCircle(0, 0, R);

  // Tick marks around the outer ring — varied lengths read as carved runes.
  const ticks = 12;
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
    const long = rnd() > 0.55;
    const r0 = R - (long ? 7 : 4);
    const r1 = R - 1;
    g.lineStyle(long ? lw : Math.max(1, lw - 1), Phaser.Display.Color.HexStringToColor(accent).color, long ? 0.9 : 0.5);
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    g.strokePath();
  }

  // Inner ring.
  g.lineStyle(Math.max(1, lw - 1), Phaser.Display.Color.HexStringToColor(color).color, 0.8);
  g.strokeCircle(0, 0, R * 0.62);

  // Spokes connecting the rings.
  const spokes = opts.spokes ?? 6;
  g.lineStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 0.55);
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    g.beginPath();
    g.moveTo(Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62);
    g.lineTo(Math.cos(a) * (R - 8), Math.sin(a) * (R - 8));
    g.strokePath();
  }

  // Core: a soft additive glow plus a hard diamond gem.
  g.fillStyle(Phaser.Display.Color.HexStringToColor(accent).color, 0.18);
  g.fillCircle(0, 0, R * 0.5);
  g.fillStyle(Phaser.Display.Color.HexStringToColor(accent).color, 0.32);
  g.fillCircle(0, 0, R * 0.26);
  g.fillStyle(Phaser.Display.Color.HexStringToColor(palette.emberWhite).color, 0.95);
  g.beginPath();
  g.moveTo(0, -R * 0.3);
  g.lineTo(R * 0.18, 0);
  g.lineTo(0, R * 0.3);
  g.lineTo(-R * 0.18, 0);
  g.closePath();
  g.fillPath();
}

/**
 * A self-animating waystone glyph: rings counter-rotate, the core pulses, and
 * it can switch runes when its state changes (dormant → ember → rift).
 */
export class WaystoneGlyph {
  readonly container: Phaser.GameObjects.Container;
  private outer: Phaser.GameObjects.Graphics;
  private inner: Phaser.GameObjects.Graphics;
  private core: Phaser.GameObjects.Graphics;
  private halo: Phaser.GameObjects.Graphics;
  private rune: GlyphRune;
  private readonly radius: number;
  private pulse = 0;
  private chargeT = 0;
  private charging = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    rune: GlyphRune = 'ember',
    radius = 40,
  ) {
    this.rune = rune;
    this.radius = radius;

    this.halo = scene.add.graphics();
    this.outer = scene.add.graphics();
    this.inner = scene.add.graphics();
    this.core = scene.add.graphics();

    drawWaystoneGlyph(this.outer, rune, { radius, lineWidth: 2, seed: 7 });
    drawWaystoneGlyph(this.inner, rune, { radius: radius * 0.72, lineWidth: 1, seed: 21, spokes: 3 });

    this.container = scene.add.container(x, y, [this.halo, this.outer, this.inner, this.core]);
  }

  setRune(rune: GlyphRune): void {
    if (rune === this.rune) return;
    this.rune = rune;
    drawWaystoneGlyph(this.outer, rune, { radius: this.radius, lineWidth: 2, seed: 7 });
    drawWaystoneGlyph(this.inner, rune, {
      radius: this.radius * 0.72,
      lineWidth: 1,
      seed: 21,
      spokes: 3,
    });
  }

  /** 0..1 — drives the charge sweep used while a player teleports. */
  setCharge(t: number): void {
    this.chargeT = Phaser.Math.Clamp(t, 0, 1);
    this.charging = t > 0 && t < 1;
  }

  update(dt: number): void {
    this.pulse += dt;
    const t = this.charging ? this.chargeT : 0;

    this.outer.rotation += dt * 0.00042;
    this.inner.rotation -= dt * 0.00078;

    const breathe = 1 + Math.sin(this.pulse * 0.0022) * 0.07;
    const charge = t * 0.9;

    // Halo: a soft ring that swells while charging.
    const tint = Phaser.Display.Color.HexStringToColor(TINTS[this.rune].glow);
    this.halo.clear();
    this.halo.lineStyle(2, tint.color, 0.1 + t * 0.5);
    this.halo.strokeCircle(0, 0, this.radius * (1.05 + charge * 0.5));
    this.halo.lineStyle(1, tint.color, 0.06 + t * 0.35);
    this.halo.strokeCircle(0, 0, this.radius * (1.18 + charge * 0.7));

    // Core gem: pulses gently, then blazes while charging.
    const coreR = this.radius * 0.34 * breathe * (1 + charge * 1.3);
    this.core.clear();
    this.core.fillStyle(tint.color, 0.14 + charge * 0.4);
    this.core.fillCircle(0, 0, coreR * 2.1);
    this.core.fillStyle(tint.color, 0.4 + charge * 0.4);
    this.core.fillCircle(0, 0, coreR);
    this.core.fillStyle(Phaser.Display.Color.HexStringToColor(palette.emberWhite).color, 0.9);
    this.core.beginPath();
    this.core.moveTo(0, -coreR);
    this.core.lineTo(coreR * 0.62, 0);
    this.core.lineTo(0, coreR);
    this.core.lineTo(-coreR * 0.62, 0);
    this.core.closePath();
    this.core.fillPath();
  }

  destroy(fromScene?: boolean): void {
    this.container.destroy(fromScene);
  }
}
