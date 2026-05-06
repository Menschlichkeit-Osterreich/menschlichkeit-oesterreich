#!/usr/bin/env python3
"""
meta_thumbnail_tool.py
======================

This script walks through a directory of game assets, generates metadata for
each supported image file and produces 512 px thumbnails.  The resulting
metadata is stored alongside the original assets in JSON format; thumbnails
are saved to a separate directory.

Supported formats:
  * PNG
  * JPG/JPEG
  * SVG (optional, requires `cairosvg` to rasterise)

The metadata schema follows the example provided in the project guidelines:

```
{
  "id": "icons_values_courage_lion__v1.0.0",
  "title": "Courage – Lion",
  "alt_text": "Roter Löwenkopf als Symbol für Zivilcourage.",
  "tags": ["values", "courage", "icon"],
  "dominant_colors": ["#EF4444", "#111827"],
  "contrast_ratio": 4.8,
  "license": "Original (project-owned)",
  "source": "ai-generated",
  "attribution": null,
  "created_at": "2025-09-26",
  "version": "1.0.0"
}
```

Usage:

```bash
python3 meta_thumbnail_tool.py --input assets/icons_values --meta-output assets/meta --thumb-output assets/thumbnails
```

The script will create missing output directories if necessary.

Notes:
  * Thumbnail generation uses Pillow.  If you work with vector SVGs, install
    `cairosvg` to rasterise them; otherwise the script will skip those files.
  * Dominant colour extraction is approximate; for precise palette matching
    consider using a more advanced colour analysis library.
"""

import argparse
import json
import os
from datetime import date
from pathlib import Path
from typing import List, Tuple, Optional

try:
    from PIL import Image  # type: ignore
except ImportError as e:
    raise SystemExit("Pillow is required to run this script. Please install it via pip install Pillow.")

try:
    import cairosvg  # type: ignore
    _HAS_CAIROSVG = True
except ImportError:
    _HAS_CAIROSVG = False


def slug_to_title(slug: str) -> str:
    """Convert a filename slug to a human‑readable title."""
    parts = slug.replace('_', ' ').replace('-', ' ').split()
    return ' '.join(w.capitalize() for w in parts)


def extract_tags(path: Path) -> List[str]:
    """Extract semantic tags from the directory structure and filename."""
    tags = []
    for part in path.parts:
        if part.startswith('.'):
            continue
        # skip root or input directory names
        tags.append(part.lower())
    return list(dict.fromkeys(tags))  # remove duplicates while preserving order


def compute_dominant_colors(image: Image.Image, max_colors: int = 4) -> List[str]:
    """Return a list of hex strings representing the dominant colours in the image.

    The image is resized to reduce complexity and converted to a palette mode
    with adaptive quantisation.  The most frequent colours are returned.
    """
    small = image.convert('RGBA').resize((64, 64))
    paletted = small.convert('P', palette=Image.ADAPTIVE, colors=max_colors)
    palette = paletted.getpalette()
    color_counts = paletted.getcolors()
    if not color_counts:
        return []
    # Sort colours by frequency descending
    color_counts.sort(reverse=True, key=lambda x: x[0])
    hexes = []
    for count, idx in color_counts[:max_colors]:
        # palette stores [R,G,B,R,G,B,...]
        r = palette[idx * 3]
        g = palette[idx * 3 + 1]
        b = palette[idx * 3 + 2]
        hexes.append(f"#{r:02X}{g:02X}{b:02X}")
    return hexes


def relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """Calculate relative luminance of an RGB triple using WCAG formula."""
    def channel(c: int) -> float:
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)


def contrast_ratio(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Return contrast ratio between two RGB colours (WCAG)."""
    L1 = relative_luminance(c1)
    L2 = relative_luminance(c2)
    lighter = max(L1, L2)
    darker = min(L1, L2)
    return (lighter + 0.05) / (darker + 0.05)


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert a hex colour string (#RRGGBB) to an RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


def generate_meta(asset_path: Path, relative_path: Path) -> dict:
    """Generate metadata dictionary for a single asset file."""
    base_name = asset_path.stem
    # Compose ID: category_subcategory_name__v1.0.0
    id_parts = list(relative_path.parts)
    id_str = '_'.join(id_parts).replace(asset_path.suffix, '') + '__v1.0.0'
    title = slug_to_title(base_name)
    alt_text = f"{title} icon" if asset_path.suffix.lower() != '.svg' else f"{title}"  # simple alt text
    tags = extract_tags(relative_path.parent) + [base_name]
    tags = [t.replace(asset_path.suffix.lower(), '') for t in tags]
    # Placeholder dominant colours and contrast ratio; updated later
    metadata = {
        "id": id_str,
        "title": title,
        "alt_text": alt_text,
        "tags": tags,
        "dominant_colors": [],
        "contrast_ratio": None,
        "license": "Original (project-owned)",
        "source": "generated",
        "attribution": None,
        "created_at": date.today().isoformat(),
        "version": "1.0.0",
    }
    return metadata


def process_image(file_path: Path) -> Optional[Image.Image]:
    """Open an image file and return a PIL Image.  Handle SVG if cairosvg is available."""
    suffix = file_path.suffix.lower()
    try:
        if suffix in ['.png', '.jpg', '.jpeg']:
            return Image.open(file_path)
        elif suffix == '.svg' and _HAS_CAIROSVG:
            # Convert SVG to PNG in memory
            png_bytes = cairosvg.svg2png(url=str(file_path))
            from io import BytesIO
            return Image.open(BytesIO(png_bytes))
        else:
            print(f"Skipping unsupported file: {file_path}")
            return None
    except Exception as e:
        print(f"Failed to open {file_path}: {e}")
        return None


def save_thumbnail(image: Image.Image, out_path: Path, size: int = 512) -> None:
    """Save a square thumbnail of the image preserving aspect ratio."""
    img = image.convert('RGBA')
    # Compute new size preserving aspect ratio
    ratio = min(size / img.width, size / img.height)
    new_size = (int(img.width * ratio), int(img.height * ratio))
    resized = img.resize(new_size, Image.LANCZOS)
    # Create square canvas with transparency
    thumb = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    # Paste resized image centered
    offset = ((size - new_size[0]) // 2, (size - new_size[1]) // 2)
    thumb.paste(resized, offset, resized)
    thumb.save(out_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate metadata and thumbnails for game assets.")
    parser.add_argument('--input', required=True, help='Input directory containing assets')
    parser.add_argument('--meta-output', required=True, help='Directory to write metadata JSON files')
    parser.add_argument('--thumb-output', required=True, help='Directory to write thumbnails (PNG)')
    args = parser.parse_args()

    input_dir = Path(args.input).resolve()
    meta_out_dir = Path(args.meta_output).resolve()
    thumb_out_dir = Path(args.thumb_output).resolve()

    if not input_dir.is_dir():
        raise SystemExit(f"Input directory {input_dir} does not exist")
    meta_out_dir.mkdir(parents=True, exist_ok=True)
    thumb_out_dir.mkdir(parents=True, exist_ok=True)

    for file_path in input_dir.rglob('*'):
        if file_path.is_file():
            relative_path = file_path.relative_to(input_dir)
            meta = generate_meta(file_path, relative_path)
            image = process_image(file_path)
            if image:
                # Compute dominant colours and contrast ratio
                dom_cols = compute_dominant_colors(image)
                meta['dominant_colors'] = dom_cols
                if len(dom_cols) >= 2:
                    rgb1 = hex_to_rgb(dom_cols[0])
                    rgb2 = hex_to_rgb(dom_cols[1])
                    meta['contrast_ratio'] = round(contrast_ratio(rgb1, rgb2), 2)
                # Save thumbnail
                thumb_name = meta['id'] + '.png'
                thumb_path = thumb_out_dir / thumb_name
                save_thumbnail(image, thumb_path)
            # Write metadata JSON
            meta_filename = meta['id'] + '.json'
            meta_path = meta_out_dir / meta_filename
            with open(meta_path, 'w', encoding='utf-8') as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
            print(f"Processed {file_path} -> {meta_path}")


if __name__ == '__main__':
    main()