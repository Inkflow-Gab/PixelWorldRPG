# EMBERWAKE — *The Last Waystone*

**A single-world action-RPG for mobile browsers.**
Repo: `PixelWorldRPG` · Beta v0.1.0 · Created by **Gab**

---

## 0. Design pillars

1. **One world, not a menu.** Every region is a node in a single teleport network. The world map is a place, not a list.
2. **Lore is the reward.** The story is short but the world around it is dense — codex, journal, environmental tells.
3. **Thumb-first.** Everything is playable with two thumbs in landscape. No precision required.
4. **Built to be extended.** Maps, dialogue, quests, skills and lore are all data files, not code.

---

## 1. Art & licensing

All chosen art is **CC0 (public domain)** from the Superpowers asset packs by [Pixel-boy](https://github.com/sparklinlabs/superpowers-asset-packs) — the *same artist* across every pack, so the mix reads as one coherent world.

| System | Source pack | License |
|---|---|---|
| Terrain tiles (32px) | `medieval-fantasy/background-elements/0-tileset.png` | CC0 |
| Terrain tiles (32px, alt) | `western-fps-2d/background-elements/0-tileset-32x32.png` | CC0 |
| **Character system** (4-dir modular) | `top-down-shooter/characters/{head,body,leg,robot/weapon}` | CC0 |
| Overworld monsters | `medieval-fantasy/monsters/*` | CC0 |
| **Battle backdrops** (48) | `rpg-battle-system/backgrounds/{1-24,*-night}.png` | CC0 |
| Battle heroes (6) | `rpg-battle-system/char/*` | CC0 |
| Battle bosses (11) | `rpg-battle-system/monster/*` | CC0 |
| HUD, bars, icons | `rpg-battle-system/HUD/*` | CC0 |
| Bitmap fonts | `rpg-battle-system/font-16x16.png`, `font-20x20.png` | CC0 |
| Items, chests, props | `medieval-fantasy/items/*`, `background-elements/1..21` | CC0 |
| VFX (skill tree visuals) | `Super Pixel Effects Gigapack` — Will Tice / unTied Games | Free w/ **attribution required** |
| Music (6) + ambience | `medieval-fantasy/music/*.ogg`, `sounds/*` | CC0 |

### Excluded on purpose

| Pack | Reason |
|---|---|
| `32rogues` | License forbids use in generative-AI projects. Not worth the risk. |
| `Cute_Fantasy_Free` | Non-commercial **and** no-redistribution — incompatible with a public repo. |
| `3d-*`, `space-shooter`, `western-fps-2d` art | Wrong genre (we use only `western-fps-2d` tiles). |

---

## 2. The world of Vael'cairn

Two centuries after **the Shattering**, when King **Vaughn the Hollow** broke the Crownstone to keep his own soul anchored to the land. The realm buckled into five **veils**. The **Order of Waywardens** kept the Waystone network alive — until last winter, when every warden under the mountain died at once.

You are the last novice warden, carrying your grandmother's ember-lantern into a world that is quietly coming apart.

### 2.1 The Waystone network (the world graph)

```
                    ┌───────────────┐
                    │  FROSTPEAK ❄  │  sealed — visible, locked. Post-beta.
                    └───────┬───────┘
                     F3    │    F4
        ┌──────────────┐   │   ┌───────────────┐
        │  THORNHOLLOW │───┼───│  ASHEN REACH  │🔥
        │      🌲      │   │   │               │
        └──────┬───────┘   │   └───────┬───────┘
             V3           │      V2    │  F5
   V1 ═══════╬════════════╪═════════════╬═══════╗
             │         ┌──╨──┐           │       ║
        ┌────┴────┐    │HOLLOW│    ┌─────┴────┐  ║
        │ MIREVALE│══V4╡THRONE╞════╡  EMBERFALL│═╝  ⭐ HUB
        │   🐸    │ V5 │      │ V6 └──────────┘
        └─────────┘    └──────┘
```

- **6 Waystones (V1–V6)** in 4 playable regions + **1 sealed region** (Frostpeak) + **5 frontier waystones (F1–F5)** that act as fast-travel shortcuts once discovered.
- Walking into a Waystone radius → 1.2s charge (VFX) → screen wipe → arrive.
- **Discovered Waystones unlock fast-travel** from the Travel Map, which doubles as the world map UI.
- Each Waystone is a save point and an **autosave trigger**.

### 2.2 Regions

| Region | Theme | Tile bias | Level band | Music |
|---|---|---|---|---|
| **Emberfall Village** | Hub. Shop, inn, healer, 3 story NPCs, codex board | Grass, dirt paths, wood/stone buildings, water | 1 | theme-1 (calm) |
| **Thornhollow** | Overgrown forest shrine. Goblin warband. Wren joins. | Dense grass, trees, ruins, swamp edges | 2–4 | theme-2 |
| **Ashen Reach** | Volcanic mountain. Reanimated skeletons. Aldric joins. | Stone, lava, charred wood | 5–8 | theme-3 (tense) |
| **Mirevale** | Sunken marsh + drowned chapel. Learns *why* the wardens died. | Water, mud, ruins | 8–11 | theme-4 (eerie) |
| **Hollow Throne** | 3-floor dungeon under the mountain. Final boss. | Stone, dark, lava | 12–16 | theme-5 (boss) |
| **Frostpeak** 🔒 | The empty frozen village. Stone answers in blue. | Snow, ice | 20+ | theme-6 |

---

## 3. Story — the beta arc (8 beats, ~45–60 min)

1. **Cold Open** — Emberfall, dawn. Grandmother hands you the lantern. The village Waystone *screams*; a red rift tears the sky and takes her, still clutching the ember. *(5 min, cutscene, no combat)*
2. **The Road North** — Thornhollow. A goblin warband holds the shrine. Meet **Wren** (rogue, 18, mouthy, secretly a deserter). Recover the **Thorn Sigil**.
3. **The Ashen Gate** — Ashen Reach. Crownstone shards reanimate the garrison. Meet **Brother Aldric** (healer, devout, slowly losing his faith). Recover the **Ember Sigil**.
4. **Mirevale** — Meet **Wren's** past, and the truth: the wardens didn't die. They were *consumed* to keep the network alive. Recover the **Tide Sigil**.
5. **The Convergence** — Emberfall. Three sigils, the network re-ignites, the Travel Map reveals **Frostpeak**. Final quest tier unlocks.
6. **Descent** — 3 floors of the Hollow Throne.
7. **Vaughn the Hollow** — 2-phase boss. He offers you a deal: take his place, end the Shattering. You refuse.
8. **Beta Ending** — Throne broken, rifts closing… Frostpeak's stone flares **blue** and will not answer. *"Then it isn't over. It's only the beginning."* Credits + "What comes after" teaser.

**Lore delivery (3 channels):**
- **Journal** — 9 entries unlocked by story beats; your grandmother's handwriting degrades as the rifts widen.
- **Codex** — 14 bestiary entries + 8 lore articles (The Shattering, The Order, Veils, Emberlight, the Five Veils, etc.).
- **Environment** — burnt prayer books, empty pews, warden's sigils scratched over, the frozen village on the map.

---

## 4. RPG systems (full)

### 4.1 Character creation
- **Race** (5): Human, Highvein (elf-blood), Stoneblood (dwarf-blood), Emberborn (fire-touched), Hollowed (rift-marked). Each grants a **stat spread** + **innate trait** + a starting passive.
- **Background** (4): Novice Warden, Village Smith, Marsh Guide, Chapel Acolyte — different starting gear, gold, and one trait.

### 4.2 Stats
`HP · MP · ATK · DEF · MAG · RES · SPD · LUK`
- Levels **1–20**, per-character XP, class-flavoured growth curves.
- Stat points on level-up: `+2 free` + race growth.
- **Derived:** `Crit chance = LUK*0.4%`, `Dodge = SPD*0.3%`, `Magic power = MAG`, `Spell resist = RES`.

### 4.3 Traits (18, 3 categories)
- **Origins** (innate, from race/background): *Emberlit, Veilwalker, Stonehide, Frostborn, Hollowed…*
- **Bonds** (from relationships, 3 companions × 3 bond levels): *Wren's Trust, Aldric's Doubt, Grandma's Lantern…*
- **Frailties** (optional, trade power for rewards): *Glass Bones, Short Fuse, Nightmares…*

### 4.4 Skill tree
- **4 trees** (Warden / Ember / Blade / Veil) × **3 branches** × **4 tiers** = **48 nodes**
- Per-character, 1 point per level, **respec at any Shrine** (free)
- Node types: *active skill, stat boost, passive, unlock/flag*
- Grid UI with pan/zoom + branch highlighting, locked/unlockable/owned states.

### 4.5 Items & enchantments
- **3 equipment slots**: Weapon / Armor / Charm
- **60+ items**: weapons, armor, charms, consumables, key items, crafting reagents (crafting is post-beta; reagents drop and are sellable)
- **Rarity tiers**: Common / Fine / Rare / Epic / Relic (affects drop weight + color)
- **Enchantments**: 18 affixes, up to **3 random affixes rolled per drop** (pool scales with item tier and region depth)
  - e.g. `+12 ATK`, `+8% Crit`, `Lifesteal 4%`, `On-Kill: Ember Burst`, `Chain Lightning on hit`
  - Enchanted drops are named (`Emberwake Blade` vs `Rusty Blade`), and re-rollable at a Forge for gold
- **Inventory**: grid, 3 consumable stacks, gold, sell/equip/compare tooltips with delta highlighting

### 4.6 Party
3 active: **You**, **Wren** (rogue, AGI/fire), **Aldric** (healer, MAG/light). Each has own level, XP, skill tree, equipment, bond level, and a 3-tier personal thread.

### 4.7 Combat — **both modes** (as requested)
- **Real-time (overworld)**: enemies roam with AI (idle → chase → attack → flee at low HP). Combat resolves with an action bar (light/heavy/skill/dodge) on a soft lock-on. Damage numbers, hit flash, knockback, screen shake, elemental VFX from the Pixel Effects pack.
- **Turn-based (boss & story fights)**: full JRPG command menu on the 48 battle backdrops. **ATB-lite** — SPD determines turn order. Physical/Magic skills, elemental matrix, status effects, defend, items, flee, and **party WAI** breaks in Phase 2 of bosses.
- Enemies "interrupt" to real-time on contact; bosses and scripted encounters drop into turn-based. Player can toggle per-encounter in options.

### 4.8 Elements & status
5 elements: **Ember / Frost / Verdant / Shadow / Light** — 5×5 effectiveness matrix.
Status: **Burn, Chill, Poison, Bleed, Stun, Haste, Slow, Regen, Shield, Curse, Weaken, Blind**.

### 4.9 Quests
- **8 main-chain** + **3 side quests** + **2 hunts**
- Quest log, tracked objectives, auto-complete turn-in, rewards (XP/gold/items/enchant unlock)
- **Quest level system**: every quest has a recommended level band; accepting above it grants a "**Overlevelled**" bonus multiplier on XP, and accepting far below gives reduced rewards. Side quests level-scale with the region.

### 4.10 Progression systems
- Player level + per-companion levels
- **Reputation** per region (3 tiers, unlocks shops/quests/lore)
- **Waystone Discovery %** (world completion stat)
- **Codex completion %**

### 4.11 Save
- 3 manual slots + 1 autosave (waystone / zone change / quest complete / level up)
- localStorage, versioned, human-readable export/import strings
- Stores: full party state, inventory, gold, skills, traits, quests, flags, codex, journal, waystone network, position

---

## 5. Presentation

- **Loading animation** — a Waystone glyph spins up with rising ember particles, a **real** progress bar bound to actual asset loads, and rotating lore tips.
- **Main menu** — animated parallax Emberfall night + drifting embers + logo; `CONTINUE / NEW GAME / LOAD GAME / OPTIONS / CREDITS`; `BETA v0.1.0` stamp.
- **Region banner** — region name + subtitle wipes in on every zone entry.
- **HUD** — party portraits w/ HP/MP, XP bar, gold, collapsible quest tracker, zone minimap, interaction prompt.
- **Dialogue** — bitmap font, typewriter (skippable / fast), portraits, 1–4 choice branches.
- **Mobile fit** — locked landscape, dynamic resolution, `FitManager` matches device aspect (16:9 → 21:9) with **no letterboxing**, safe-area aware for notches.

---

## 6. Architecture

```
GameProject/
├─ src/
│  ├─ main.ts                 game bootstrap
│  ├─ core/                   FitManager, SceneRouter, Input, Save, Audio, Registry
│  ├─ scenes/                 Boot, Loading, Title, Menu, World, Battle, Dialogue,
│  │                          Travel, Inventory, Skills, Quests, Codex, Character, Ending
│  ├─ systems/                Party, Stats, Traits, Skills, Inventory, Enchant,
│  │                          Quests, Codex, Waystones, Combat, Spawner, Effects
│  ├─ data/                   world, races, traits, skills, items, enchants, enemies,
│  │                          quests, dialogue, lore, regions
│  ├─ ui/                     widgets, panels, bitmap font renderer
│  └─ gfx/                    character compositor, tileset builder, palette utils
├─ public/assets/             curated + optimized (target < 12MB)
├─ maps/                      *.tmj (Tiled JSON) — editable
├─ tools/                     asset pipeline, map generator, tilescan
├─ android/                   Capacitor
├─ .github/workflows/         ci.yml (Pages) · android.yml (APK)
└─ index.html  vite.config.ts  tsconfig.json  capacitor.config.ts  package.json
```

### Asset pipeline (`tools/`)
- `tilescan.py` — structural tileset analyzer (already built) — renders sheets as character maps
- `prep_assets.py` — slices/renames/optimizes into `public/assets/`
- `gen_maps.py` — generates the `.tmj` map files
- Output is deterministic and committed, so CI needs no art processing.

### Build
- `npm run dev` — local dev server
- `npm run build` — typecheck + vite build → `dist/`
- `npm run test` — vitest (battles, stats, saves, quests, enchants)
- CI → **GitHub Pages**; separate workflow → **Android debug APK** via Capacitor

---

## 7. Milestones

| # | Milestone |
|---|---|
| M0 | Repo, CI, Vite + Phaser boots, landscape fit |
| M1 | Boot/loading animation, title, main menu, options, credits, save system |
| M2 | Character compositor, player controller, camera, 2 test zones, waystones + travel map |
| M3 | Combat — real-time + turn-based boss; enemies, skills, status, VFX |
| M4 | RPG layer — races, traits, skill tree, items, enchantments, quests, codex |
| M5 | Content — 7 maps, 20 NPCs, 14 enemies, 4 bosses, 8 story beats, endings |
| M6 | Polish — audio pass, balance, mobile UX, APK |

---

## 8. Credits

- **Game design, code, art direction, maps, lore: Gab**
- Terrain / characters / battles / HUD: [Pixel-boy](https://github.com/sparklinlabs/superpowers-asset-packs) — *Superpowers Asset Packs*, **CC0**
- VFX: *Super Pixel Effects Gigapack* — **Will Tice / unTied Games**
- Engine: **Phaser 3** (MIT) · Build: **Vite** (MIT) · Mobile: **Capacitor** (MIT)
