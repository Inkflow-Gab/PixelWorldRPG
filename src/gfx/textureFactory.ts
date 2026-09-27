/**
 * Runtime texture factory.
 *
 * Pixel-art UI chrome (panels, borders, bars, cursors, particles) is generated
 * procedurally instead of shipped as images. That keeps the download small,
 * guarantees crispness at any zoom, and — importantly — means the game's frame
 * is never blocked waiting on UI art.
 */

import Phaser from 'phaser';
import { palette } from '../config/palette';

type Ctx = CanvasRenderingContext2D;

interface PanelOpts {
  width: number;
  height: number;
  fill?: string;
  fillAlpha?: number;
  border?: string;
  borderWidth?: number;
  radius?: number;
  /** Inner highlight line, gives the "carved" look. */
  bevel?: boolean;
  shadow?: boolean;
}

function make(scene: Phaser.Scene, key: string, w: number, h: number): Ctx {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) throw new Error(`could not create canvas texture ${key}`);
  return tex.getContext() as unknown as Ctx;
}

function commit(scene: Phaser.Scene, key: string): void {
  const tex = scene.textures.get(key);
  if (tex instanceof Phaser.Textures.CanvasTexture) tex.refresh();
}

function roundRectPath(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.lineTo(x + w - rr, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rr);
  c.lineTo(x + w, y + h - rr);
  c.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  c.lineTo(x + rr, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rr);
  c.lineTo(x, y + rr);
  c.quadraticCurveTo(x, y, x + rr, y);
  c.closePath();
}

function makePanel(scene: Phaser.Scene, key: string, o: PanelOpts): void {
  const { width: w, height: h } = o;
  const pad = o.shadow ? 3 : 1;
  const c = make(scene, key, w + pad * 2, h + pad * 2);

  const X = pad;
  const Y = pad;

  if (o.shadow) {
    c.fillStyle = 'rgba(0,0,0,0.5)';
    roundRectPath(c, X + 2, Y + 3, w, h, o.radius ?? 4);
    c.fill();
  }

  c.fillStyle = o.fill ?? palette.stoneDark;
  c.globalAlpha = o.fillAlpha ?? 0.94;
  roundRectPath(c, X, Y, w, h, o.radius ?? 4);
  c.fill();
  c.globalAlpha = 1;

  if (o.bevel !== false) {
    // Top-left highlight.
    c.strokeStyle = 'rgba(255,255,255,0.10)';
    c.lineWidth = 1;
    roundRectPath(c, X + 0.5, Y + 0.5, w - 1, h - 1, o.radius ?? 4);
    c.stroke();
  }

  if (o.border) {
    c.strokeStyle = o.border;
    c.lineWidth = o.borderWidth ?? 1;
    roundRectPath(c, X + 0.5, Y + 0.5, w - 1, h - 1, o.radius ?? 4);
    c.stroke();
  }

  commit(scene, key);
}

function makeBar(scene: Phaser.Scene, key: string, o: PanelOpts): void {
  // A bar is drawn as: dark well, then callers tint a 9-slice fill on top.
  const { width: w, height: h } = o;
  const c = make(scene, key, w, h);

  c.fillStyle = o.fill ?? '#150f1c';
  c.fillRect(0, 0, w, h);

  // Inner shading so the bar reads as recessed even at 1px height.
  c.fillStyle = 'rgba(0,0,0,0.55)';
  c.fillRect(0, 0, w, 1);
  c.fillStyle = 'rgba(255,255,255,0.07)';
  c.fillRect(0, h - 1, w, 1);

  c.strokeStyle = o.border ?? 'rgba(0,0,0,0.85)';
  c.lineWidth = 1;
  c.strokeRect(0.5, 0.5, w - 1, h - 1);

  commit(scene, key);
}

function makeSoftDot(scene: Phaser.Scene, key: string, size: number, color: string): void {
  const c = make(scene, key, size, size);
  const r = size / 2;
  const g = c.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, color);
  g.addColorStop(0.45, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  commit(scene, key);
}

function makeSpark(scene: Phaser.Scene, key: string): void {
  // 3x3 plus-shaped spark — the classic 16-bit particle.
  const c = make(scene, key, 3, 3);
  c.fillStyle = '#ffffff';
  c.fillRect(1, 0, 1, 3);
  c.fillRect(0, 1, 3, 1);
  commit(scene, key);
}

function makePixel(scene: Phaser.Scene, key: string, color = '#ffffff'): void {
  const c = make(scene, key, 2, 2);
  c.fillStyle = color;
  c.fillRect(0, 0, 2, 2);
  commit(scene, key);
}

function makeRing(scene: Phaser.Scene, key: string, size: number, thickness: number, color: string): void {
  const c = make(scene, key, size, size);
  c.strokeStyle = color;
  c.lineWidth = thickness;
  c.beginPath();
  c.arc(size / 2, size / 2, size / 2 - thickness / 2, 0, Math.PI * 2);
  c.stroke();
  commit(scene, key);
}

function makeVignette(scene: Phaser.Scene, key: string, size = 128): void {
  const c = make(scene, key, size, size);
  const g = c.createRadialGradient(size / 2, size / 2, size * 0.32, size / 2, size / 2, size * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,1)');
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  commit(scene, key);
}

function makeWhite(scene: Phaser.Scene, key: string, w = 4, h = 4): void {
  const c = make(scene, key, w, h);
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, h);
  commit(scene, key);
}

function makeScanlines(scene: Phaser.Scene, key: string): void {
  const c = make(scene, key, 4, 4);
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.fillRect(0, 0, 4, 1);
  c.fillStyle = 'rgba(0,0,0,0.10)';
  c.fillRect(0, 2, 4, 1);
  commit(scene, key);
}

function makeCursor(scene: Phaser.Scene, key: string): void {
  // A chunky pointing-hand alternative: a rotating bracket reticle reads
  // better on small screens than a 1px pointer.
  const s = 16;
  const c = make(scene, key, s, s);
  c.strokeStyle = palette.emberPale;
  c.lineWidth = 2;
  const m = 1;
  const len = 5;
  const corners: Array<[number, number, number, number]> = [
    [m, m, 1, 1],
    [s - m, m, -1, 1],
    [m, s - m, 1, -1],
    [s - m, s - m, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    c.beginPath();
    c.moveTo(x + dx * len, y);
    c.lineTo(x, y);
    c.lineTo(x, y + dy * len);
    c.stroke();
  }
  commit(scene, key);
}

function makeArrow(
  scene: Phaser.Scene,
  key: string,
  color: string,
  dir: 'up' | 'down' | 'left' | 'right',
): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = color;
  // A single triangle pointing in `dir`, built in local space then rotated.
  const rot: Record<typeof dir, number> = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
  c.save();
  c.translate(s / 2, s / 2);
  c.rotate(rot[dir]);
  c.beginPath();
  c.moveTo(0, -s / 2 + 1);
  c.lineTo(s / 2 - 2, s / 2 - 3);
  c.lineTo(-(s / 2 - 2), s / 2 - 3);
  c.closePath();
  c.fill();
  c.restore();
  commit(scene, key);
}

function makeButton9(scene: Phaser.Scene, key: string, tint: { hi: string; mid: string; lo: string }): void {
  const s = 24;
  const c = make(scene, key, s, s);
  const g = c.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, tint.hi);
  g.addColorStop(0.5, tint.mid);
  g.addColorStop(1, tint.lo);
  c.fillStyle = g;
  c.fillRect(0, 0, s, s);
  c.fillStyle = 'rgba(255,255,255,0.14)';
  c.fillRect(0, 0, s, 1);
  c.fillStyle = 'rgba(0,0,0,0.28)';
  c.fillRect(0, s - 1, s, 1);
  commit(scene, key);
}

function makeSlash(scene: Phaser.Scene, key: string): void {
  // Crescent slash used by weapon skills.
  const w = 32;
  const h = 32;
  const c = make(scene, key, w, h);
  c.strokeStyle = '#ffffff';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(w * 0.2, h / 2, h * 0.42, -Math.PI * 0.42, Math.PI * 0.42);
  c.stroke();
  c.globalAlpha = 0.5;
  c.lineWidth = 1;
  c.beginPath();
  c.arc(w * 0.2, h / 2, h * 0.48, -Math.PI * 0.36, Math.PI * 0.36);
  c.stroke();
  commit(scene, key);
}

function makeNoise(scene: Phaser.Scene, key: string): void {
  // Deterministic 64x64 blue-noise-ish tile for water shimmer and rift static.
  const s = 64;
  const c = make(scene, key, s, s);
  const img = c.createImageData(s, s);
  let seed = 1337;
  for (let i = 0; i < s * s; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = (seed >> 16) & 0xff;
    img.data[i * 4 + 0] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  commit(scene, key);
}

function makeFireGradient(scene: Phaser.Scene, key: string): void {
  const w = 16;
  const h = 32;
  const c = make(scene, key, w, h);
  const g = c.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, 'rgba(255,240,200,1)');
  g.addColorStop(0.3, 'rgba(255,180,90,0.9)');
  g.addColorStop(0.7, 'rgba(255,110,50,0.45)');
  g.addColorStop(1, 'rgba(180,40,20,0)');
  c.fillStyle = g;
  c.fillRect(w * 0.25, 0, w * 0.5, h);
  commit(scene, key);
}

function makeRiftGradient(scene: Phaser.Scene, key: string): void {
  const w = 16;
  const h = 32;
  const c = make(scene, key, w, h);
  const g = c.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, 'rgba(255,155,240,1)');
  g.addColorStop(0.45, 'rgba(180,50,200,0.7)');
  g.addColorStop(1, 'rgba(60,10,70,0)');
  c.fillStyle = g;
  c.fillRect(w * 0.3, 0, w * 0.4, h);
  commit(scene, key);
}

function makeFrostGradient(scene: Phaser.Scene, key: string): void {
  const w = 16;
  const h = 32;
  const c = make(scene, key, w, h);
  const g = c.createLinearGradient(0, h, 0, 0);
  g.addColorStop(0, 'rgba(230,248,255,1)');
  g.addColorStop(0.5, 'rgba(120,200,240,0.6)');
  g.addColorStop(1, 'rgba(30,80,120,0)');
  c.fillStyle = g;
  c.fillRect(w * 0.35, 0, w * 0.3, h);
  commit(scene, key);
}

function makeShadowBlob(scene: Phaser.Scene, key: string): void {
  const s = 32;
  const c = make(scene, key, s, 16);
  const g = c.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.5)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, s, 16);
  commit(scene, key);
}

function makeDither(scene: Phaser.Scene, key: string): void {
  // Checkerboard used for semi-transparent fills (ice, ghost bodies).
  const c = make(scene, key, 4, 4);
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.fillRect(0, 0, 2, 2);
  c.fillRect(2, 2, 2, 2);
  commit(scene, key);
}

function makeHealPlus(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.emberPale;
  c.fillRect(5, 1, 2, 10);
  c.fillRect(1, 5, 10, 2);
  commit(scene, key);
}

function makeStunStars(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.emberBright;
  c.fillRect(5, 0, 2, 12);
  c.fillRect(0, 5, 12, 2);
  commit(scene, key);
}

function makePoisonDrop(scene: Phaser.Scene, key: string): void {
  const s = 10;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.verdantBright;
  c.beginPath();
  c.moveTo(5, 1);
  c.lineTo(9, 6);
  c.quadraticCurveTo(5, 11, 1, 6);
  c.closePath();
  c.fill();
  commit(scene, key);
}

function makeFlameIcon(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.ember;
  c.beginPath();
  c.moveTo(6, 1);
  c.quadraticCurveTo(10, 5, 9, 8);
  c.quadraticCurveTo(8, 11, 6, 11);
  c.quadraticCurveTo(4, 11, 3, 8);
  c.quadraticCurveTo(2, 5, 6, 1);
  c.fill();
  c.fillStyle = palette.emberPale;
  c.fillRect(5, 7, 2, 3);
  commit(scene, key);
}

function makeSnowIcon(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.strokeStyle = palette.frostBright;
  c.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI) / 3;
    c.beginPath();
    c.moveTo(6 - Math.cos(a) * 5, 6 - Math.sin(a) * 5);
    c.lineTo(6 + Math.cos(a) * 5, 6 + Math.sin(a) * 5);
    c.stroke();
  }
  commit(scene, key);
}

function makeEyeIcon(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.riftBright;
  c.beginPath();
  c.ellipse(6, 6, 5, 3, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = palette.voidBlack;
  c.fillRect(5, 4, 2, 4);
  commit(scene, key);
}

function makeLeafIcon(scene: Phaser.Scene, key: string): void {
  const s = 12;
  const c = make(scene, key, s, s);
  c.fillStyle = palette.verdantBright;
  c.beginPath();
  c.ellipse(6, 6, 3, 5, Math.PI / 4, 0, Math.PI * 2);
  c.fill();
  commit(scene, key);
}

/** Every texture the game draws with, generated once at boot. */
export function buildAllTextures(scene: Phaser.Scene): void {
  // --- panels & bars ---
  makePanel(scene, 'ui:panel', {
    width: 64,
    height: 48,
    fill: '#161021',
    fillAlpha: 0.93,
    border: '#3a3444',
    borderWidth: 1,
    radius: 3,
    shadow: true,
  });
  makePanel(scene, 'ui:panel-solid', {
    width: 64,
    height: 48,
    fill: '#161021',
    fillAlpha: 1,
    border: '#3a3444',
    radius: 3,
    shadow: true,
  });
  makePanel(scene, 'ui:panel-dark', {
    width: 64,
    height: 48,
    fill: '#0b0812',
    fillAlpha: 0.96,
    border: '#241d30',
    radius: 2,
    shadow: false,
  });
  makePanel(scene, 'ui:window', {
    width: 64,
    height: 48,
    fill: '#1b1426',
    fillAlpha: 0.97,
    border: '#6b6377',
    borderWidth: 1,
    radius: 4,
    shadow: true,
  });
  makePanel(scene, 'ui:tooltip', {
    width: 48,
    height: 40,
    fill: '#080610',
    fillAlpha: 0.97,
    border: '#ff8a3c',
    borderWidth: 1,
    radius: 2,
    shadow: true,
  });
  makePanel(scene, 'ui:slot', {
    width: 20,
    height: 20,
    fill: '#191325',
    fillAlpha: 0.95,
    border: '#453c56',
    radius: 2,
    bevel: false,
  });
  makePanel(scene, 'ui:slot-hi', {
    width: 20,
    height: 20,
    fill: '#2a1f22',
    fillAlpha: 0.98,
    border: '#ff8a3c',
    radius: 2,
    bevel: false,
  });

  makeBar(scene, 'ui:bar-well', { width: 64, height: 7, border: 'rgba(0,0,0,0.9)' });
  makeBar(scene, 'ui:bar-thin', { width: 64, height: 3, border: 'rgba(0,0,0,0.9)' });
  makeBar(scene, 'ui:bar-xp', { width: 64, height: 4, border: 'rgba(0,0,0,0.7)' });

  // --- particles & sprites ---
  makePixel(scene, 'px');
  makeWhite(scene, 'px1', 1, 1);
  makeWhite(scene, 'px2', 2, 2);
  makeWhite(scene, 'px3', 3, 3);
  makeWhite(scene, 'px4', 4, 4);
  makeWhite(scene, 'px8', 8, 8);
  makeWhite(scene, 'px16', 16, 16);
  makeWhite(scene, 'px24', 24, 24);
  makeWhite(scene, 'px32', 32, 32);
  makeSpark(scene, 'fx:spark');
  makeSoftDot(scene, 'fx:soft', 32, 'rgba(255,255,255,1)');
  makeSoftDot(scene, 'fx:soft-sm', 16, 'rgba(255,255,255,1)');
  makeRing(scene, 'fx:ring', 64, 2, 'rgba(255,255,255,1)');
  makeRing(scene, 'fx:ring-thick', 64, 4, 'rgba(255,255,255,1)');
  makeRing(scene, 'fx:ring-thin', 64, 1, 'rgba(255,255,255,1)');
  makeVignette(scene, 'fx:vignette', 128);
  makeNoise(scene, 'fx:noise');
  makeSlash(scene, 'fx:slash');
  makeDither(scene, 'fx:dither');
  makeScanlines(scene, 'fx:scanlines');
  makeShadowBlob(scene, 'fx:shadow');
  makeCursor(scene, 'ui:cursor');
  makeArrow(scene, 'ui:arrow-up', palette.emberBright, 'up');
  makeArrow(scene, 'ui:arrow-down', palette.emberBright, 'down');
  makeArrow(scene, 'ui:arrow-left', palette.emberBright, 'left');
  makeArrow(scene, 'ui:arrow-right', palette.emberBright, 'right');
  makeButton9(scene, 'ui:btn', {
    hi: '#3a2f22',
    mid: '#241c16',
    lo: '#150f0c',
  });
  makeButton9(scene, 'ui:btn-hi', {
    hi: '#6b4520',
    mid: '#4a2d14',
    lo: '#2a1a0c',
  });
  makeButton9(scene, 'ui:btn-off', {
    hi: '#2a2630',
    mid: '#1b1822',
    lo: '#100e16',
  });

  // --- element gradients ---
  makeFireGradient(scene, 'fx:fire');
  makeRiftGradient(scene, 'fx:rift');
  makeFrostGradient(scene, 'fx:frost');

  // --- status icons ---
  makeHealPlus(scene, 'st:heal');
  makeStunStars(scene, 'st:stun');
  makePoisonDrop(scene, 'st:poison');
  makeFlameIcon(scene, 'st:burn');
  makeSnowIcon(scene, 'st:chill');
  makeEyeIcon(scene, 'st:blind');
  makeLeafIcon(scene, 'st:regen');
}

export const UI_TEXTURES = {
  PANEL: 'ui:panel',
  PANEL_SOLID: 'ui:panel-solid',
  PANEL_DARK: 'ui:panel-dark',
  WINDOW: 'ui:window',
  TOOLTIP: 'ui:tooltip',
  SLOT: 'ui:slot',
  SLOT_HI: 'ui:slot-hi',
  BAR_WELL: 'ui:bar-well',
  BAR_THIN: 'ui:bar-thin',
  BAR_XP: 'ui:bar-xp',
  BTN: 'ui:btn',
  BTN_HI: 'ui:btn-hi',
  BTN_OFF: 'ui:btn-off',
  CURSOR: 'ui:cursor',
  ARROW_UP: 'ui:arrow-up',
  ARROW_DOWN: 'ui:arrow-down',
  ARROW_LEFT: 'ui:arrow-left',
  ARROW_RIGHT: 'ui:arrow-right',
} as const;
