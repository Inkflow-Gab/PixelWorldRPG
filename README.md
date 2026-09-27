# Emberwake: The Last Waystone

**A single-world action RPG for mobile browsers.** Play in landscape with two thumbs.

> Two hundred years after the Shattering, when a mad king broke the Crownstone
> to keep himself from dying, the last novice warden carries her grandmother's
> ember-lantern into a world that is quietly coming apart.

Created by **Gab** · Beta v0.1.0 · [Full design document](DESIGN.md) · [Credits](CREDITS.md)

---

## Play

| Where | Link |
|---|---|
| Web (GitHub Pages) | <https://inkflow-gab.github.io/PixelWorldRPG/> |
| Android APK | Download from the repo's Actions → Artifacts on the latest successful build |
| Local | `npm install && npm run dev` |

**Recommended:** landscape. Portrait phones show a rotate prompt.

---

## The game

A full RPG in one connected world:

- **One world, six Waystones.** Every region is a node in a single teleport
  network. Walk into a Waystone, or fast-travel from the map once discovered.
- **Two combat modes.** Real-time overworld action with a soft lock-on, and
  turn-based ATB-lite battles for bosses and story fights.
- **5 races, 18 traits, 48-node skill tree** across 4 trees and 3 branches.
- **60+ items with 18 enchantment affixes** rolled per drop, re-rollable at a forge.
- **8-beat story** with a journal, a 14-entry bestiary, and 8 lore articles.
- **7 maps**, 20 NPCs, 4 bosses, quest level bands, and 3 save slots.

---

## Development

```bash
npm install          # install
npm run dev          # dev server
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run build        # typecheck + vite build -> dist/
npm run assets       # rebuild public/assets from Assets-to-Use/
npm run assets:verify # check the manifest matches the filesystem
npm run maps         # regenerate maps/*.tmj
```

### On-device / sandboxed builds

`/mnt/sdcard` is a FAT mount: no symlinks and no executable bit, so npm cannot
install or run native binaries there. `tools/dev.sh` mirrors the repo into a
POSIX sandbox (`/tmp/opencode/ew/sandbox`) where `node_modules` lives, runs the
command there, and copies results back.

```bash
bash tools/dev.sh typecheck
bash tools/dev.sh check      # esbuild bundle (rollup can't dlopen here)
bash tools/dev.sh test
bash tools/dev.sh shell      # cd into the sandbox
```

The authoritative Vite build runs in GitHub Actions.

### Layout

```
src/
  config/     constants, palette, Phaser config
  core/       FitManager (responsive landscape), save, audio, input
  scenes/     Boot, Title, World, Battle, Dialogue, Travel, Inventory, …
  systems/    Party, Stats, Traits, Skills, Inventory, Enchant, Quests, Combat
  data/       world, races, traits, skills, items, enchants, enemies, quests,
              dialogue, lore, regions   ← all content is data, not code
  gfx/        textureFactory, WaystoneGlyph, character compositor
  ui/         MenuList and reusable widgets
  assets/     manifest.ts (authoritative asset list)
maps/         *.tmj — Tiled JSON, editable
tools/        asset pipeline, map generator, tilescan, dev.sh
```

### Asset pipeline

Third-party source art lives in `Assets-to-Use/` and is **not** committed.
`tools/prep_assets.py` produces the curated, optimized subset in
`public/assets/`; `tools/verify_assets.py` (run in CI) fails the build if the
manifest and the filesystem ever disagree.

Character sprites are generated procedurally by
`tools/gen_characters.py` rather than sourced externally, so the five races are
visually distinct and carry no third-party license obligations.

---

## CI

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | push / PR to `main` | asset verify → typecheck → tests → build → GitHub Pages |
| `android.yml` | push to `main` | web build → Capacitor sync → Gradle → debug APK artifact |

---

## License

Code: MIT. See [CREDITS.md](CREDITS.md) for asset licensing.
