#!/usr/bin/env python3
"""
Regenerate the responsive image derivatives and the social share image.

Masters live in design-assets/ (not deployed). Output goes to public/images/.

Requires:
    pip install Pillow pillow-avif-plugin

Run:
    npm run images
"""

import glob
import os
import sys

try:
    import pillow_avif  # noqa: F401  (registers the AVIF encoder)
except ImportError:
    print("pillow-avif-plugin not installed; AVIF output will be skipped.")
    pillow_avif = None

from PIL import Image, ImageDraw, ImageFont

SRC_DIR = "design-assets"
OUT_DIR = "public/images"
WIDTHS = [1036, 768, 480]
MASTERS = ["hero-watercolor.jpg", "cta-watercolor.jpg"]

# The cover displays at 300px CSS (230 on tablet); 600px covers 2x retina and
# 900px is kept for the share card.
COVER_MASTER = "cover-master.png"
COVER_WIDTHS = [900, 600, 300]

# Art-directed wide crop of the hero art for the Article 5 section.
# The master is portrait 2:3; covering a wide viewport-height band showed only
# ~42% of its height, and because the crop window resizes with the viewport, any
# fixed percentage anchor bisected a different figure at a different screen size.
# This crop puts every head in the TOP HALF so top-anchored cover only ever
# trims below the chins. Verified clean 1024x700 through 2560x1200.
HERO_WIDE_CROP = (0, 90, 1036, 1000)      # from hero-watercolor.jpg
HERO_WIDE_WIDTHS = [1440, 1080, 720]

# Sampled from the field art; keep in sync with src/index.css.
INK = (28, 25, 22)
PAPER = (231, 214, 188)
BURNT = (189, 100, 51)
HIGHLIGHT = (216, 168, 120)


def find_font(pattern, size):
    matches = glob.glob(f"/usr/share/fonts/**/{pattern}", recursive=True)
    if matches:
        return ImageFont.truetype(matches[0], size)
    return ImageFont.load_default()


def build_derivatives():
    for name in MASTERS:
        path = os.path.join(SRC_DIR, name)
        if not os.path.exists(path):
            print(f"  skip {name} (not found)")
            continue

        stem = name.rsplit(".", 1)[0]
        im = Image.open(path).convert("RGB")
        ow, oh = im.size
        print(f"\n{name}  {ow}x{oh}  {os.path.getsize(path) / 1024:.0f} kB")

        for w in WIDTHS:
            if w > ow:
                continue
            rs = im.resize((w, round(oh * w / ow)), Image.LANCZOS)

            formats = [
                ("webp", dict(quality=78, method=6)),
                ("jpg", dict(quality=82, optimize=True, progressive=True)),
            ]
            if pillow_avif:
                formats.insert(0, ("avif", dict(quality=54, speed=4)))

            for ext, kwargs in formats:
                out = os.path.join(OUT_DIR, f"{stem}-{w}.{ext}")
                rs.save(out, **kwargs)
                print(f"   {stem}-{w}.{ext:<4}  {os.path.getsize(out) / 1024:6.1f} kB")


def build_cover():
    """Responsive derivatives for the book cover, plus a plain cover.jpg fallback."""
    path = os.path.join(SRC_DIR, COVER_MASTER)
    if not os.path.exists(path):
        print(f"\nskip cover ({COVER_MASTER} not found)")
        return

    im = Image.open(path).convert("RGB")
    ow, oh = im.size
    print(f"\n{COVER_MASTER}  {ow}x{oh}  {os.path.getsize(path) / 1024:.0f} kB")

    formats = [("webp", dict(quality=82, method=6)),
               ("jpg", dict(quality=86, optimize=True, progressive=True))]
    if pillow_avif:
        formats.insert(0, ("avif", dict(quality=58, speed=4)))

    for w in COVER_WIDTHS:
        if w > ow:
            continue
        rs = im.resize((w, round(oh * w / ow)), Image.LANCZOS)
        for ext, kwargs in formats:
            out = os.path.join(OUT_DIR, f"cover-{w}.{ext}")
            rs.save(out, **kwargs)
            print(f"   cover-{w}.{ext:<4}  {os.path.getsize(out) / 1024:6.1f} kB")
        # Plain fallback for browsers ignoring srcset, and for BOOK.coverImage.
        if w == 600:
            fb = os.path.join(OUT_DIR, "cover.jpg")
            rs.save(fb, quality=86, optimize=True, progressive=True)
            print(f"   cover.jpg      {os.path.getsize(fb) / 1024:6.1f} kB  (fallback)")


def build_hero_wide():
    """Art-directed landscape crop of the hero art (see HERO_WIDE_CROP)."""
    path = os.path.join(SRC_DIR, "hero-watercolor.jpg")
    if not os.path.exists(path):
        print("\nskip hero-wide (master not found)")
        return
    im = Image.open(path).convert("RGB").crop(HERO_WIDE_CROP)
    cw, ch = im.size
    print(f"\nhero-wide crop {cw}x{ch} (ratio {cw / ch:.2f})")

    formats = [("webp", dict(quality=78, method=6)),
               ("jpg", dict(quality=82, optimize=True, progressive=True))]
    if pillow_avif:
        formats.insert(0, ("avif", dict(quality=54, speed=4)))

    for w in HERO_WIDE_WIDTHS:
        rs = im.resize((w, round(ch * w / cw)), Image.LANCZOS)
        for ext, kwargs in formats:
            out = os.path.join(OUT_DIR, f"hero-wide-{w}.{ext}")
            rs.save(out, **kwargs)
            print(f"   hero-wide-{w}.{ext:<4}  {os.path.getsize(out) / 1024:6.1f} kB")


def build_og_image():
    """1200x630 share card, cropped from the hero art with the title set over it."""
    src_path = os.path.join(SRC_DIR, "hero-watercolor.jpg")
    if not os.path.exists(src_path):
        print("\nskip og.jpg (hero master not found)")
        return

    W, H = 1200, 630
    src = Image.open(src_path).convert("RGB")
    sw, sh = src.size

    scale = max(W / sw, H / sh)
    rs = src.resize((round(sw * scale), round(sh * scale)), Image.LANCZOS)
    rw, rh = rs.size
    left = (rw - W) // 2
    top = int((rh - H) * 0.30)
    im = rs.crop((left, top, left + W, top + H))

    # Darken toward the bottom so the title stays legible over the art.
    grad = Image.new("L", (1, H))
    for y in range(H):
        t = y / (H - 1)
        grad.putpixel((0, y), int(255 * min(1.0, 0.14 + 0.86 * (t ** 1.5))))
    im = Image.composite(Image.new("RGB", (W, H), INK), im, grad.resize((W, H)))

    d = ImageDraw.Draw(im)
    f_title = find_font("DejaVuSerif-Bold.ttf", 72)
    f_kick = find_font("DejaVuSansMono.ttf", 21)

    d.line([(72, 404), (108, 404)], fill=BURNT, width=3)
    d.text((122, 394), "A NOVEL", font=f_kick, fill=HIGHLIGHT)
    d.text((72, 428), "The American", font=f_title, fill=PAPER)
    d.text((72, 508), "Foreign Legion", font=f_title, fill=PAPER)

    out = os.path.join(OUT_DIR, "og.jpg")
    im.save(out, quality=88, optimize=True, progressive=True)
    print(f"\nog.jpg  {os.path.getsize(out) / 1024:.1f} kB  {W}x{H}")


if __name__ == "__main__":
    if not os.path.isdir(SRC_DIR):
        sys.exit(f"Missing {SRC_DIR}/ — run this from the project root.")
    os.makedirs(OUT_DIR, exist_ok=True)
    build_derivatives()
    build_cover()
    build_hero_wide()
    build_og_image()
    print("\nDone.")
