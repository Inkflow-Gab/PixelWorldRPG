#!/usr/bin/env python3
"""
tilescan.py - Structural analysis of pixel-art tilesets/spritesheets.

Renders an image as a character map so tile types can be identified without
visually inspecting the source art. Designed for the tile-grabbing step of the
asset pipeline.

Usage:
  python3 tilescan.py <image> [--tile 32] [--thumb 8] [--cols-hint N]

Output per cell:  <symbol> <uniq>cov<%> <meanhex> <edge>
  symbol   classification char (see classify)
  uniq     number of distinct opaque colors in the cell
  cov      % of pixels with alpha > 8
  meanhex  mean RGB of opaque pixels
  edge     mean gradient magnitude (higher = more structured / likely a wall)
"""
import sys
import argparse
import warnings
from PIL import Image

warnings.filterwarnings("ignore", category=DeprecationWarning)
Image.MAX_IMAGE_PIXELS = None


def mean_rgb(im):
    px = list(im.getdata())
    op = [p for p in px if len(p) == 4 and p[3] > 8]
    if not op:
        return None
    n = len(op)
    return (
        sum(p[0] for p in op) / n,
        sum(p[1] for p in op) / n,
        sum(p[2] for p in op) / n,
    )


def coverage(im):
    px = list(im.convert("RGBA").getdata())
    if not px:
        return 0.0
    return 100.0 * sum(1 for p in px if p[3] > 8) / len(px)


def uniq_colors(im, cap=4096):
    seen = set()
    for p in im.convert("RGBA").getdata():
        if p[3] > 8:
            seen.add(p[:3])
            if len(seen) > cap:
                break
    return len(seen)


def edge_energy(im):
    """Mean |luma| gradient. Structured art (walls, bricks) scores high,
    flat fills (water, grass) score near zero."""
    g = im.convert("L")
    w, h = g.size
    px = g.load()
    tot = 0.0
    cnt = 0
    for y in range(h):
        for x in range(w):
            if x + 1 < w:
                tot += abs(px[x, y] - px[x + 1, y])
                cnt += 1
            if y + 1 < h:
                tot += abs(px[x, y] - px[x, y + 1])
                cnt += 1
    return tot / cnt if cnt else 0.0


def classify(cov, uniq, edge, mr, mg, mb):
    if cov < 3:
        return "."
    if mr is None:
        return "."
    lum = 0.299 * mr + 0.587 * mg + 0.114 * mb
    greenish = mg > mr + 6 and mg > mb + 6
    bluish = mb > mr + 10 and mb > mg + 4
    brownish = mr > mb + 14 and mg > mb + 2 and mr >= mg
    if cov > 96 and edge < 2.0:
        return "~"  # solid flat block
    if uniq <= 3 and edge < 3.0:
        return "F"  # flat fill
    if edge > 34:
        return "#"  # highly structured -> wall / brick / roof
    if edge > 18:
        return "%"  # moderately structured
    if bluish:
        return "W"  # water
    if greenish:
        return "G"  # grass / foliage
    if brownish:
        return "D"  # dirt / wood
    if lum > 200:
        return "L"  # light / snow
    if lum < 60:
        return "K"  # dark / shadow
    return "o"  # other / mixed


def thumb(im, n):
    """Downsample to n x n chars, brightness ramp."""
    g = im.convert("L")
    w, h = g.size
    ramp = "@%#*+=-:. "
    rows = []
    for ty in range(n):
        line = ""
        for tx in range(n):
            box = (
                tx * w // n,
                ty * h // n,
                max(tx * w // n + 1, (tx + 1) * w // n),
                max(ty * h // n + 1, (ty + 1) * h // n),
            )
            cell = g.crop(box)
            px = list(cell.getdata())
            px = [p for p in px if p is not None]
            v = sum(px) / len(px) if px else 0
            line += ramp[min(len(ramp) - 1, int(v / 256 * len(ramp)))]
        rows.append(line)
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--tile", type=int, default=32)
    ap.add_argument("--thumb", type=int, default=0, help="print NxN thumb for selected cells")
    ap.add_argument("--row", type=int, default=None, help="thumb only this cell row index")
    ap.add_argument("--col", type=int, default=None, help="thumb only this cell col index")
    ap.add_argument("--csv", action="store_true")
    args = ap.parse_args()

    im = Image.open(args.image).convert("RGBA")
    W, H = im.size
    t = args.tile
    cols, rows = W // t, H // t
    print(f"# {args.image}")
    print(f"# size {W}x{H}  tile {t}px  grid {cols} cols x {rows} rows\n")

    if args.csv:
        print("col,row,sym,uniq,cov,edge,mean")
        for r in range(rows):
            for c in range(cols):
                cell = im.crop((c * t, r * t, (c + 1) * t, (r + 1) * t))
                cv = coverage(cell)
                u = uniq_colors(cell)
                e = edge_energy(cell)
                m = mean_rgb(cell)
                mr, mg, mb = m if m else (0, 0, 0)
                s = classify(cv, u, e, mr, mg, mb)
                print(f"{c},{r},{s},{u},{cv:.0f},{e:.1f},{int(mr)},{int(mg)},{int(mb)}")
        return

    # Compact grid view
    print("## tile grid (each char = one %dx%d tile)" % (t, t))
    hdr = "     " + "".join(str(c % 10) for c in range(cols))
    print(hdr)
    for r in range(rows):
        line = ""
        for c in range(cols):
            cell = im.crop((c * t, r * t, (c + 1) * t, (r + 1) * t))
            cv = coverage(cell)
            u = uniq_colors(cell)
            e = edge_energy(cell)
            m = mean_rgb(cell)
            mr, mg, mb = m if m else (0, 0, 0)
            line += classify(cv, u, e, mr, mg, mb)
        print(f"  {r:>2} {line}")
    print()

    # Detail table
    print("## cell detail")
    for r in range(rows):
        for c in range(cols):
            cell = im.crop((c * t, r * t, (c + 1) * t, (r + 1) * t))
            cv = coverage(cell)
            u = uniq_colors(cell)
            e = edge_energy(cell)
            m = mean_rgb(cell)
            if m is None:
                continue
            mr, mg, mb = m
            s = classify(cv, u, e, mr, mg, mb)
            print(
                f"  ({c:>2},{r:>2}) {s} uniq={u:<3} cov={cv:>5.1f}% edge={e:>5.1f} "
                f"#{int(mr):02x}{int(mg):02x}{int(mb):02x}"
            )
    print()

    if args.thumb:
        sel = []
        if args.row is not None and args.col is not None:
            sel = [(args.col, args.row)]
        else:
            for r in range(rows):
                for c in range(cols):
                    cell = im.crop((c * t, r * t, (c + 1) * t, (r + 1) * t))
                    if coverage(cell) > 3:
                        sel.append((c, r))
        for (c, r) in sel:
            cell = im.crop((c * t, r * t, (c + 1) * t, (r + 1) * t))
            print(f"--- cell ({c},{r}) ---")
            for line in thumb(cell, args.thumb):
                print("   " + line)
            print()


if __name__ == "__main__":
    main()
