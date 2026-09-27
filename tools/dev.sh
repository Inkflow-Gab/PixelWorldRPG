#!/usr/bin/env bash
# dev.sh — build/test helper for this environment.
#
# /mnt/sdcard is a FAT mount with no symlink support and no executable bit, so
# npm cannot install or run native binaries there. This script keeps the git
# repo on the sdcard and mirrors it into a POSIX sandbox at $SANDBOX where
# node_modules lives, then runs the requested command there.
#
# Usage: ./tools/dev.sh [install|build|typecheck|test|dev|verify|shell]

set -euo pipefail

PROJECT="/mnt/sdcard/GameProject"
SANDBOX="/tmp/opencode/ew/sandbox"

# Directories that must exist in the repo before mirroring.
mkdir -p "$PROJECT"/{public/assets,src,maps,tools}

sync_repo() {
  mkdir -p "$SANDBOX"
  for entry in package.json package-lock.json tsconfig.json vite.config.ts \
               capacitor.config.json index.html README.md DESIGN.md CREDITS.md \
               .gitignore .npmrc .github src public maps tools vitest.config.ts; do
    src_path="$PROJECT/$entry"
    [ -e "$src_path" ] || continue
    dst_path="$SANDBOX/$entry"
    mkdir -p "$(dirname "$dst_path")"
    # `cp -rf src dst/src` would nest as dst/src/src, so copy contents when
    # the destination directory already exists.
    if [ -d "$src_path" ]; then
      mkdir -p "$dst_path"
      cp -rf "$src_path/." "$dst_path/"
      # Drop files deleted on the sdcard side.
      find "$dst_path" -type f | while read -r f; do
        rel="${f#$dst_path/}"
        [ -e "$src_path/$rel" ] || rm -f "$f"
      done
      find "$dst_path" -type d -empty -delete 2>/dev/null || true
    else
      cp -f "$src_path" "$dst_path"
    fi
  done
  # Clean any accidental nesting from earlier buggy runs.
  rm -rf "$SANDBOX/src/src" "$SANDBOX/maps/maps" "$SANDBOX/tools/tools" \
         "$SANDBOX/public/assets/assets" 2>/dev/null || true
}

sync_back() {
  for entry in src public/assets maps; do
    if [ -d "$SANDBOX/$entry" ]; then
      mkdir -p "$PROJECT/$entry"
      cp -rf "$SANDBOX/$entry/." "$PROJECT/$entry/"
    fi
  done
}

cmd="${1:-build}"
shift || true

sync_repo

cd "$SANDBOX"

if [ ! -d node_modules ]; then
  echo ">> installing dependencies (first run, this takes a while)"
  npm install --no-audit --no-fund
  npm install-scripts approve esbuild >/dev/null 2>&1 || true
fi

run() {
  echo ">> $*"
  "$@"
  local rc=$?
  sync_back
  exit $rc
}

case "$cmd" in
  install) npm install --no-audit --no-fund ;;
  build)
    echo ">> typecheck"
    node node_modules/typescript/bin/tsc --noEmit
    echo ">> vite build"
    node node_modules/vite/bin/vite.js build
    rc=$?
    sync_back
    exit $rc
    ;;
  typecheck) run node node_modules/typescript/bin/tsc --noEmit ;;
  check)
    # Local stand-in for `vite build`: rollup's native binary cannot be
    # dlopen'd in this Android sandbox, so bundle with esbuild to prove the
    # whole module graph resolves and parses. CI runs the real Vite build.
    run node_modules/@esbuild/android-arm64/bin/esbuild src/main.ts \
      --bundle --format=esm --target=es2020 --outfile=dist-check/main.js \
      --loader:.png=text --loader:.ogg=text --loader:.wav=text --loader:.json=json
    ;;
  test)    run node node_modules/vitest/vitest.mjs run "$@" ;;
  dev)     run node node_modules/vite/bin/vite.js --host ;;
  verify)  run python3 "$PROJECT/tools/verify_assets.py" ;;
  shell)   echo "$SANDBOX" ;;
  sync)    sync_repo ;;
  *)       run "$cmd" "$@" ;;
esac
