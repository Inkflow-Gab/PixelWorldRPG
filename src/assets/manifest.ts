/**
 * The authoritative asset manifest.
 *
 * Every runtime texture key the game references is declared here exactly once.
 * `tools/prep_assets.py` produces the matching files under `public/assets/`,
 * and `npm run assets:verify` (run in CI) fails the build if this list and the
 * filesystem ever drift apart.
 *
 * Keys are namespaced by purpose so call sites read clearly:
 *   tiles:*    tilemap images        chars:*   composited actor sheets
 *   prop:*     world decoration      fx:*      effect sprites
 *   battle:*   turn-based battle art ui:*     interface art
 *   mus:*      music                 sfx:*     sound effects
 */

export interface ManifestEntry {
  /** Phaser texture key. */
  key: string;
  /** Path relative to `public/`. */
  url: string;
  /** Frame width, for atlases/sheets that need explicit slicing. */
  frameWidth?: number;
  frameHeight?: number;
}

export interface AtlasEntry {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  /** When true Phaser treats the sheet as a sprite sheet (not an atlas). */
  sheet?: boolean;
  /** When true, start frame index (useful for sheets that start mid-anim). */
  startFrame?: number;
}

/** Single-frame textures. */
export const TEXTURES: ManifestEntry[] = [
  // --- terrain ---
  { key: 'tiles:medieval', url: 'assets/tiles/medieval.png' },
  { key: 'tiles:western', url: 'assets/tiles/western.png' },

  // --- world props ---
  { key: 'prop:tree', url: 'assets/prop/tree.png' },
  { key: 'prop:rock', url: 'assets/prop/rock.png' },
  { key: 'prop:bush', url: 'assets/prop/bush.png' },
  { key: 'prop:flower', url: 'assets/prop/flower.png' },
  { key: 'prop:reeds', url: 'assets/prop/reeds.png' },
  { key: 'prop:stump', url: 'assets/prop/stump.png' },
  { key: 'prop:sign', url: 'assets/prop/sign.png' },
  { key: 'prop:torch', url: 'assets/prop/torch.png' },
  { key: 'prop:chest', url: 'assets/prop/chest.png' },
  { key: 'prop:chest-open', url: 'assets/prop/chest-open.png' },
  { key: 'prop:barrel', url: 'assets/prop/barrel.png' },
  { key: 'prop:crate', url: 'assets/prop/crate.png' },
  { key: 'prop:pot', url: 'assets/prop/pot.png' },
  { key: 'prop:house', url: 'assets/prop/house.png' },
  { key: 'prop:house-2', url: 'assets/prop/house-2.png' },
  { key: 'prop:inn', url: 'assets/prop/inn.png' },
  { key: 'prop:smithy', url: 'assets/prop/smithy.png' },
  { key: 'prop:shrine', url: 'assets/prop/shrine.png' },
  { key: 'prop:chapel', url: 'assets/prop/chapel.png' },
  { key: 'prop:gate', url: 'assets/prop/gate.png' },
  { key: 'prop:bridge', url: 'assets/prop/bridge.png' },
  { key: 'prop:campfire', url: 'assets/prop/campfire.png' },
  { key: 'prop:tent', url: 'assets/prop/tent.png' },
  { key: 'prop:grave', url: 'assets/prop/grave.png' },
  { key: 'prop:pillar', url: 'assets/prop/pillar.png' },
  { key: 'prop:stalagmite', url: 'assets/prop/stalagmite.png' },
  { key: 'prop:icicle', url: 'assets/prop/icicle.png' },
  { key: 'prop:snowman', url: 'assets/prop/snowman.png' },
  { key: 'prop:crystal', url: 'assets/prop/crystal.png' },

  // --- actors ---
  { key: 'ui:portrait-frame', url: 'assets/ui/portrait-frame.png' },
  { key: 'ui:portrait-hero', url: 'assets/ui/portrait-hero.png' },
  { key: 'ui:portrait-wren', url: 'assets/ui/portrait-wren.png' },
  { key: 'ui:portrait-aldric', url: 'assets/ui/portrait-aldric.png' },
  { key: 'ui:portrait-grandma', url: 'assets/ui/portrait-grandma.png' },
  { key: 'ui:portrait-smith', url: 'assets/ui/portrait-smith.png' },
  { key: 'ui:portrait-merchant', url: 'assets/ui/portrait-merchant.png' },
  { key: 'ui:portrait-warden', url: 'assets/ui/portrait-warden.png' },
  { key: 'ui:portrait-vein', url: 'assets/ui/portrait-vein.png' },
  { key: 'ui:portrait-farmer', url: 'assets/ui/portrait-farmer.png' },
  { key: 'ui:portrait-keeper', url: 'assets/ui/portrait-keeper.png' },
  { key: 'ui:portrait-boy', url: 'assets/ui/portrait-boy.png' },
  { key: 'ui:portrait-girl', url: 'assets/ui/portrait-girl.png' },
  { key: 'ui:portrait-hollow', url: 'assets/ui/portrait-hollow.png' },

  // --- overworld enemies ---
  { key: 'foe:goblin', url: 'assets/foe/goblin.png' },
  { key: 'foe:slime', url: 'assets/foe/slime.png' },
  { key: 'foe:bat', url: 'assets/foe/bat.png' },
  { key: 'foe:snake', url: 'assets/foe/snake.png' },
  { key: 'foe:skeleton', url: 'assets/foe/skeleton.png' },
  { key: 'foe:cyclop', url: 'assets/foe/cyclop.png' },
  { key: 'foe:leonard', url: 'assets/foe/leonard.png' },
  { key: 'foe:king-skeleton', url: 'assets/foe/king-skeleton.png' },
  { key: 'foe:dragon', url: 'assets/foe/dragon.png' },

  // --- effects ---
  { key: 'fx:portalled', url: 'assets/fx/portalled.png' },
  { key: 'fx:castle', url: 'assets/fx/cast.png' },
  { key: 'fx:sword-slash', url: 'assets/fx/sword_slash.png' },
  { key: 'fx:hit-spark', url: 'assets/fx/hit_spark.png' },
  { key: 'fx:magic-missile', url: 'assets/fx/magic_missile.png' },
  { key: 'fx:flame-burst', url: 'assets/fx/flame_burst.png' },
  { key: 'fx:ice-burst', url: 'assets/fx/ice_burst.png' },
  { key: 'fx:poison-burst', url: 'assets/fx/poison_burst.png' },
  { key: 'fx:holy-light', url: 'assets/fx/holy_light.png' },
  { key: 'fx:rift-burst', url: 'assets/fx/rift_burst.png' },
  { key: 'fx:explosion', url: 'assets/fx/explosion.png' },
  { key: 'fx:smoke', url: 'assets/fx/smoke.png' },
  { key: 'fx:heal-aura', url: 'assets/fx/heal_aura.png' },
  { key: 'fx:level-up', url: 'assets/fx/level_up.png' },

  // --- battle backdrops ---
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `battle:bg${String(i + 1).padStart(2, '0')}`,
    url: `assets/battle/bg${String(i + 1).padStart(2, '0')}.png`,
  })),

  // --- battle battlers ---
  { key: 'battle:warrior', url: 'assets/battle/hero-warrior.png' },
  { key: 'battle:mage', url: 'assets/battle/hero-mage.png' },
  { key: 'battle:bowman', url: 'assets/battle/hero-bowman.png' },
  { key: 'battle:paladin', url: 'assets/battle/hero-paladin.png' },
  { key: 'battle:wizard', url: 'assets/battle/hero-wizard.png' },
  { key: 'battle:rogue', url: 'assets/battle/hero-rogue.png' },
  { key: 'battle:monster-bat', url: 'assets/battle/mon-bat.png' },
  { key: 'battle:monster-boar', url: 'assets/battle/mon-boar.png' },
  { key: 'battle:monster-ghost', url: 'assets/battle/mon-ghost.png' },
  { key: 'battle:monster-mimic', url: 'assets/battle/mon-mimic.png' },
  { key: 'battle:monster-mushroom', url: 'assets/battle/mon-mushroom.png' },
  { key: 'battle:monster-snake', url: 'assets/battle/mon-snake.png' },
  { key: 'battle:monster-slime', url: 'assets/battle/mon-slime.png' },
  { key: 'battle:monster-dragon', url: 'assets/battle/mon-dragon.png' },
  { key: 'battle:monster-giant', url: 'assets/battle/mon-giant.png' },
  { key: 'battle:monster-reptile', url: 'assets/battle/mon-reptile.png' },
  { key: 'battle:monster-vaughn', url: 'assets/battle/mon-vaughn.png' },
  { key: 'battle:monster-warchief', url: 'assets/battle/mon-warchief.png' },
  { key: 'battle:monster-sigil-warden', url: 'assets/battle/mon-sigil-warden.png' },
  { key: 'battle:monster-rift-hound', url: 'assets/battle/mon-rift-hound.png' },

  // --- UI ---
  { key: 'ui:hud-frame', url: 'assets/ui/hud-frame.png' },
  { key: 'ui:icons', url: 'assets/ui/icons.png' },
  { key: 'ui:items', url: 'assets/ui/items.png' },
  { key: 'ui:worldmap', url: 'assets/ui/worldmap.png' },
  { key: 'ui:logo', url: 'assets/ui/logo.png' },
  { key: 'ui:menu-bg', url: 'assets/ui/menu-bg.png' },
];

/** Sprite sheets / atlases, sliced by the loader. */
export const SHEETS: AtlasEntry[] = [
  // --- actors: 4 directions x 4 walk frames + 2 idle, 24x32 cells ---
  ...['hero', 'wren', 'aldric', 'grandma', 'smith', 'merchant', 'warden', 'vein', 'farmer', 'keeper', 'boy', 'girl', 'hollow'].map(
    (n) => ({
      key: `char:${n}`,
      url: `assets/chars/${n}.png`,
      frameWidth: 24,
      frameHeight: 32,
      sheet: true,
    }),
  ),
  // --- party battler poses ---
  { key: 'char:battle-hero', url: 'assets/chars/battle-hero.png', frameWidth: 24, frameHeight: 32, sheet: true },
  { key: 'char:battle-wren', url: 'assets/chars/battle-wren.png', frameWidth: 24, frameHeight: 32, sheet: true },
  { key: 'char:battle-aldric', url: 'assets/chars/battle-aldric.png', frameWidth: 24, frameHeight: 32, sheet: true },
  // --- overworld enemies: 2x2 cells, idle + walk ---
  ...['goblin', 'slime', 'bat', 'snake', 'skeleton', 'cyclop', 'leonard', 'king-skeleton', 'dragon'].map(
    (n) => ({ key: `foe:${n}`, url: `assets/foe/${n}.png`, frameWidth: 24, frameHeight: 24, sheet: true }),
  ),
  // --- battle battler sheets: 5x2 grid (idle row, attack row) ---
  ...['hero-warrior', 'hero-mage', 'hero-bowman', 'hero-paladin', 'hero-wizard', 'hero-rogue'].map((n) => ({
    key: `battle:${n.replace('hero-', '')}`,
    url: `assets/battle/${n}.png`,
    frameWidth: 64,
    frameHeight: 64,
    sheet: true,
  })),
  ...['mon-bat', 'mon-boar', 'mon-ghost', 'mon-mimic', 'mon-mushroom', 'mon-snake', 'mon-slime', 'mon-dragon', 'mon-giant', 'mon-reptile', 'mon-vaughn', 'mon-warchief', 'mon-sigil-warden', 'mon-rift-hound'].map(
    (n) => ({
      key: `battle:${n.replace('mon-', 'monster-')}`,
      url: `assets/battle/${n}.png`,
      frameWidth: 96,
      frameHeight: 96,
      sheet: true,
    }),
  ),
  // --- battle FX ---
  { key: 'fx:slash-sheet', url: 'assets/fx/sword_slash.png', frameWidth: 64, frameHeight: 64, sheet: true },
  // --- world weather ---
  { key: 'fx:rain', url: 'assets/fx/weather/rain.png', frameWidth: 8, frameHeight: 32, sheet: true },
  { key: 'fx:snow', url: 'assets/fx/weather/snow.png', frameWidth: 8, frameHeight: 16, sheet: true },
  { key: 'fx:embers', url: 'assets/fx/weather/embers.png', frameWidth: 6, frameHeight: 6, sheet: true },
  { key: 'fx:leaves', url: 'assets/fx/weather/leaves.png', frameWidth: 8, frameHeight: 8, sheet: true },
  { key: 'fx:ash', url: 'assets/fx/weather/ash.png', frameWidth: 4, frameHeight: 4, sheet: true },
];

/** Music tracks. */
export const MUSIC = [
  { key: 'mus:village', url: 'assets/music/theme-1.ogg' },
  { key: 'mus:forest', url: 'assets/music/theme-2.ogg' },
  { key: 'mus:volcano', url: 'assets/music/theme-3.ogg' },
  { key: 'mus:swamp', url: 'assets/music/theme-4.ogg' },
  { key: 'mus:dungeon', url: 'assets/music/theme-5.ogg' },
  { key: 'mus:frozen', url: 'assets/music/theme-6.ogg' },
];

/** Sound effects. */
export const SFX = [
  { key: 'sfx:ui-move', url: 'assets/sfx/ui-1.wav' },
  { key: 'sfx:ui-select', url: 'assets/sfx/ui-2.wav' },
  { key: 'sfx:ui-back', url: 'assets/sfx/ui-3.wav' },
  { key: 'sfx:ui-deny', url: 'assets/sfx/ui-4.wav' },
  { key: 'sfx:coin', url: 'assets/sfx/coin.wav' },
  { key: 'sfx:chest', url: 'assets/sfx/chest.wav' },
  { key: 'sfx:door', url: 'assets/sfx/door.wav' },
  { key: 'sfx:heal', url: 'assets/sfx/heal.wav' },
  { key: 'sfx:level-up', url: 'assets/sfx/level-up.wav' },
  { key: 'sfx:quest', url: 'assets/sfx/quest.wav' },
  { key: 'sfx:teleport', url: 'assets/sfx/teleport.wav' },
  { key: 'sfx:hit', url: 'assets/sfx/hit.wav' },
  { key: 'sfx:crit', url: 'assets/sfx/crit.wav' },
  { key: 'sfx:slash', url: 'assets/sfx/slash.wav' },
  { key: 'sfx:cast', url: 'assets/sfx/cast.wav' },
  { key: 'sfx:fire', url: 'assets/sfx/fire.wav' },
  { key: 'sfx:ice', url: 'assets/sfx/ice.wav' },
  { key: 'sfx:monster-1', url: 'assets/sfx/monster-1.wav' },
  { key: 'sfx:monster-2', url: 'assets/sfx/monster-2.wav' },
  { key: 'sfx:boss', url: 'assets/sfx/boss.wav' },
  { key: 'sfx:victory-1', url: 'assets/sfx/victory-1.wav' },
  { key: 'sfx:victory-2', url: 'assets/sfx/victory-2.wav' },
  { key: 'sfx:victory-3', url: 'assets/sfx/victory-3.wav' },
  { key: 'sfx:whoosh-1', url: 'assets/sfx/whoosh-1.wav' },
  { key: 'sfx:whoosh-2', url: 'assets/sfx/whoosh-2.wav' },
  { key: 'sfx:amb-forest', url: 'assets/sfx/forest-ambience.wav', loop: true },
];

/** Everything the loader should fetch, in one flat queue. */
export interface LoadItem {
  key: string;
  url: string;
  type: 'image' | 'audio';
  frameWidth?: number;
  frameHeight?: number;
  sheet?: boolean;
}

export function buildLoadQueue(): LoadItem[] {
  const out: LoadItem[] = [];

  for (const t of TEXTURES) {
    out.push({ key: t.key, url: t.url, type: 'image' });
  }

  for (const s of SHEETS) {
    out.push({
      key: s.key,
      url: s.url,
      type: 'image',
      frameWidth: s.frameWidth,
      frameHeight: s.frameHeight,
      sheet: true,
    });
  }

  for (const m of MUSIC) {
    out.push({ key: m.key, url: m.url, type: 'audio' });
  }

  for (const s of SFX) {
    out.push({ key: s.key, url: s.url, type: 'audio' });
  }

  return out;
}
