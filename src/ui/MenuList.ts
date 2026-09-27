/**
 * MenuList — a keyboard, pointer and touch driven vertical menu.
 *
 * Deliberately built on top of a Phaser container rather than DOM so it lives
 * inside the game's scaling pipeline and can be reused identically by the
 * pause menu, shops, dialogue choices and every submenu.
 */

import Phaser from 'phaser';
import { palette } from '../config/palette';
import { UI_TEXTURES } from '../gfx/textureFactory';

export interface MenuItem {
  label: string;
  hint?: string;
  enabled?: boolean;
  /** Optional right-aligned value, e.g. "12 / 40" or a gold total. */
  value?: string;
  /** Optional accent colour for the label. */
  color?: string;
}

export interface MenuListOptions {
  x: number;
  y: number;
  items?: MenuItem[];
  /** Alias for `items`, kept for call-site readability. */
  entries?: MenuItem[];
  onSelect: (index: number) => void;
  onHover?: (index: number) => void;
  /** Row height in pixels. */
  rowHeight?: number;
  fontSize?: number;
  /** Column width used for hit-testing. */
  width?: number;
  showHints?: boolean;
  /** Clamp the cursor instead of wrapping. Default: true (wrap). */
  wrap?: boolean;
}

interface ResolvedMenuOptions {
  x: number;
  y: number;
  items: MenuItem[];
  onSelect: (index: number) => void;
  onHover?: (index: number) => void;
  rowHeight: number;
  fontSize: number;
  width: number;
  showHints: boolean;
  wrap: boolean;
}

export class MenuList {
  private scene: Phaser.Scene;
  private opts: ResolvedMenuOptions;
  private container: Phaser.GameObjects.Container;
  private rows: Array<{
    bg: Phaser.GameObjects.Image;
    label: Phaser.GameObjects.Text;
    value?: Phaser.GameObjects.Text;
  }> = [];
  private cursor: Phaser.GameObjects.Image;
  private hintText?: Phaser.GameObjects.Text;
  private index = 0;

  constructor(scene: Phaser.Scene, options: MenuListOptions) {
    this.scene = scene;
    this.opts = {
      x: options.x,
      y: options.y,
      items: options.items ?? options.entries ?? [],
      onSelect: options.onSelect,
      onHover: options.onHover,
      rowHeight: options.rowHeight ?? 18,
      fontSize: options.fontSize ?? 13,
      width: options.width ?? 132,
      showHints: options.showHints ?? true,
      wrap: options.wrap ?? true,
    };

    this.container = scene.add.container(this.opts.x, this.opts.y);
    this.cursor = scene.add.image(6, 0, UI_TEXTURES.ARROW_RIGHT).setOrigin(0.5, 0.5);
    this.container.add(this.cursor);

    this.rebuild();
  }

  set items(items: MenuItem[]) {
    this.opts.items = items;
    this.rebuild();
  }

  get items(): MenuItem[] {
    return this.opts.items;
  }

  get currentIndex(): number {
    return this.index;
  }

  setIndex(i: number): void {
    const n = this.opts.items.length;
    if (!n) return;
    this.index = this.opts.wrap ? Phaser.Math.Wrap(i, 0, n) : Phaser.Math.Clamp(i, 0, n - 1);
    this.refresh();
    this.opts.onHover?.(this.index);
  }

  move(delta: number): void {
    if (!this.opts.items.length) return;
    this.setIndex(this.index + delta);
  }

  /** Row index under a world point, or -1. */
  hitTest(x: number, y: number): number {
    const localX = x - this.container.x;
    const localY = y - this.container.y;
    if (localX < -6 || localX > this.opts.width + 6) return -1;
    const i = Math.floor(localY / this.opts.rowHeight);
    if (i < 0 || i >= this.opts.items.length) return -1;
    return this.opts.items[i].enabled === false ? -1 : i;
  }

  activate(): void {
    const item = this.opts.items[this.index];
    if (!item || item.enabled === false) {
      this.scene.tweens.add({
        targets: this.container,
        x: this.opts.x + 3,
        duration: 60,
        yoyo: true,
        repeat: 1,
      });
      return;
    }
    this.opts.onSelect(this.index);
  }

  setVisible(v: boolean): this {
    this.container.setVisible(v);
    return this;
  }

  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  setEnabled(predicate: (item: MenuItem, i: number) => boolean): this {
    this.opts.items.forEach((it, i) => {
      it.enabled = predicate(it, i);
    });
    this.refresh();
    return this;
  }

  /** Nudge the cursor for feedback; call from the owning scene's update. */
  update(delta: number): void {
    const row = this.index * this.opts.rowHeight;
    this.cursor.y = row + this.opts.rowHeight / 2;
    this.cursor.x = 6 + Math.sin(this.scene.time.now * 0.006) * 1.5;
    void delta;
  }

  destroy(): void {
    this.container.destroy(true);
  }

  // --------------------------------------------------------------- private

  private rebuild(): void {
    for (const r of this.rows) {
      r.bg.destroy();
      r.label.destroy();
      r.value?.destroy();
    }
    this.rows = [];

    this.opts.items.forEach((item, i) => {
      const y = i * this.opts.rowHeight;
      const bg = this.scene.add
        .image(0, y, UI_TEXTURES.PANEL)
        .setOrigin(0, 0)
        .setDisplaySize(this.opts.width, this.opts.rowHeight - 1)
        .setAlpha(0.001);
      this.container.add(bg);

      const label = this.scene.add
        .text(16, y + this.opts.rowHeight / 2, item.label, {
          fontFamily: 'Georgia, serif',
          fontSize: `${this.opts.fontSize}px`,
          color: item.color ?? palette.paper,
        })
        .setOrigin(0, 0.5);

      if (item.value !== undefined) {
        const value = this.scene.add
          .text(this.opts.width - 12, y + this.opts.rowHeight / 2, item.value, {
            fontFamily: 'ui-monospace, monospace',
            fontSize: `${this.opts.fontSize - 1}px`,
            color: palette.paperDim,
          })
          .setOrigin(1, 0.5);
        this.container.add(value);
        this.rows.push({ bg, label, value });
      } else {
        this.rows.push({ bg, label });
      }
      this.container.add(label);
    });

    if (this.opts.showHints) {
      this.hintText = this.scene.add
        .text(
          this.opts.width,
          this.opts.items.length * this.opts.rowHeight + 6,
          '',
          {
            fontFamily: 'Georgia, serif',
            fontSize: `${Math.max(9, this.opts.fontSize - 2)}px`,
            color: palette.stonePale,
            fontStyle: 'italic',
          },
        )
        .setOrigin(0, 0);
      this.container.add(this.hintText);
    }

    this.index = Math.min(this.index, Math.max(0, this.opts.items.length - 1));
    this.refresh();
  }

  private refresh(): void {
    this.opts.items.forEach((item, i) => {
      const row = this.rows[i];
      if (!row) return;
      const active = i === this.index;
      const off = item.enabled === false;

      row.bg.setAlpha(active ? 0.9 : 0.001);
      row.bg.setTint(active ? 0xffffff : 0x000000);
      row.label.setColor(
        off ? palette.stone : active ? palette.emberPale : (item.color ?? palette.paper),
      );
      row.label.setAlpha(off ? 0.55 : 1);
      row.label.setX(active ? 20 : 16);
      row.value?.setAlpha(off ? 0.4 : 0.9);
    });

    if (this.hintText) {
      this.hintText.setText(this.opts.items[this.index]?.hint ?? '');
    }
  }
}
