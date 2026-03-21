"""
Pinterest PIN görseli oluşturucu — 1000x1500px PNG.
"""

import os
import io
import math
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Renk paleti ────────────────────────────────────────────────────────────────
BG_COLOR = (250, 249, 246)          # krem beyaz
HEADER_BG = (30, 30, 30)            # koyu antrasit
HEADER_TEXT = (255, 255, 255)       # beyaz
TITLE_TEXT = (30, 30, 30)           # siyah
DESC_TEXT = (80, 80, 80)            # koyu gri
PRICE_TEXT = (180, 140, 80)         # altın
DIVIDER_COLOR = (220, 215, 205)     # açık bej
FOOTER_BG = (240, 238, 232)         # açık krem

PIN_W = 1000
PIN_H = 1500

# ── Font yolları ───────────────────────────────────────────────────────────────
FONT_DIR = "/usr/share/fonts/truetype"
FONTS = {
    "bold": [
        f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans-Bold.ttf",
        f"{FONT_DIR}/freefont/FreeSansBold.ttf",
    ],
    "regular": [
        f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans.ttf",
        f"{FONT_DIR}/freefont/FreeSans.ttf",
    ],
}


def _load_font(style: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONTS.get(style, FONTS["regular"]):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _fetch_image(url: str, size: tuple[int, int]) -> Image.Image:
    """URL'den görsel indir, boyutlandır. Hata halinde placeholder döndür."""
    if url:
        try:
            resp = requests.get(url, timeout=10, headers={
                "User-Agent": "Mozilla/5.0"
            })
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content)).convert("RGB")
            img = _fit_image(img, size)
            return img
        except Exception:
            pass
    return _placeholder(size)


def _fit_image(img: Image.Image, target: tuple[int, int]) -> Image.Image:
    """Görseli orantılı olarak hedef boyuta crop/pad et."""
    tw, th = target
    iw, ih = img.size
    ratio = max(tw / iw, th / ih)
    new_w = int(iw * ratio)
    new_h = int(ih * ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - tw) // 2
    top = (new_h - th) // 2
    return img.crop((left, top, left + tw, top + th))


def _placeholder(size: tuple[int, int]) -> Image.Image:
    """Ürün görseli yoksa gri placeholder."""
    img = Image.new("RGB", size, (230, 225, 220))
    draw = ImageDraw.Draw(img)
    font = _load_font("regular", 24)
    text = "Görsel Yok"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(
        ((size[0] - tw) // 2, (size[1] - th) // 2),
        text, fill=(160, 155, 150), font=font
    )
    return img


def _wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    """Metni max_width'e sığacak şekilde satırlara böl."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def create_pin(outfit: dict, output_path: str, pin_number: int = 1) -> str:
    """
    Bir kombin için Pinterest PIN görseli oluştur.
    outfit = {"title": ..., "description": ..., "items": [...]}
    Kaydedilen dosya yolunu döndürür.
    """
    canvas = Image.new("RGB", (PIN_W, PIN_H), BG_COLOR)
    draw = ImageDraw.Draw(canvas)

    items = outfit["items"][:4]  # Maks 4 ürün
    n = len(items)

    # ── 1. Header bölgesi ─────────────────────────────────────────────
    header_h = 160
    draw.rectangle([(0, 0), (PIN_W, header_h)], fill=HEADER_BG)

    font_header = _load_font("bold", 52)
    font_sub = _load_font("regular", 28)

    title = outfit["title"].upper()
    bbox = draw.textbbox((0, 0), title, font=font_header)
    tw = bbox[2] - bbox[0]
    draw.text(((PIN_W - tw) // 2, 30), title, fill=HEADER_TEXT, font=font_header)

    subtitle = f"PIN #{pin_number}  ·  amazon'da bul"
    bbox2 = draw.textbbox((0, 0), subtitle, font=font_sub)
    draw.text(((PIN_W - (bbox2[2] - bbox2[0])) // 2, 100), subtitle, fill=(200, 190, 170), font=font_sub)

    # ── 2. Ürün görselleri grid ───────────────────────────────────────
    grid_top = header_h + 20
    footer_h = 220
    grid_h = PIN_H - grid_top - footer_h - 20

    if n <= 2:
        cols, rows = n, 1
    elif n == 3:
        cols, rows = 3, 1
    else:
        cols, rows = 2, 2

    padding = 12
    cell_w = (PIN_W - padding * (cols + 1)) // cols
    cell_h = (grid_h - padding * (rows + 1)) // rows

    for idx, item in enumerate(items):
        row = idx // cols
        col = idx % cols
        x = padding + col * (cell_w + padding)
        y = grid_top + padding + row * (cell_h + padding)

        # Ürün görseli
        img_area_h = cell_h - 90  # isim + fiyat için alan bırak
        product_img = _fetch_image(item.get("image_url", ""), (cell_w, img_area_h))

        # Hafif yuvarlak köşe efekti (beyaz overlay)
        canvas.paste(product_img, (x, y))

        # Ürün ismi (kırp)
        font_item = _load_font("bold", 22)
        font_price = _load_font("regular", 20)

        name = item.get("name", "")
        # İlk 40 karakter
        if len(name) > 40:
            name = name[:37] + "..."

        name_y = y + img_area_h + 6
        draw.text((x + 4, name_y), name, fill=TITLE_TEXT, font=font_item)

        price = item.get("price", "")
        if price:
            price_y = name_y + 34
            draw.text((x + 4, price_y), price, fill=PRICE_TEXT, font=font_price)

    # ── 3. Açıklama şeridi ────────────────────────────────────────────
    desc_y = PIN_H - footer_h
    draw.line([(30, desc_y), (PIN_W - 30, desc_y)], fill=DIVIDER_COLOR, width=2)
    draw.rectangle([(0, desc_y + 3), (PIN_W, PIN_H)], fill=FOOTER_BG)

    font_desc = _load_font("regular", 26)
    font_shop = _load_font("bold", 28)

    desc = outfit.get("description", "")
    desc_lines = _wrap_text(desc, font_desc, PIN_W - 80, draw)
    dy = desc_y + 20
    for line in desc_lines[:3]:
        draw.text((40, dy), line, fill=DESC_TEXT, font=font_desc)
        dy += 36

    # "Shop on Amazon" butonu
    btn_y = PIN_H - 70
    draw.rounded_rectangle([(40, btn_y), (PIN_W - 40, btn_y + 52)], radius=10, fill=HEADER_BG)
    shop_text = "Shop on Amazon  →"
    bbox3 = draw.textbbox((0, 0), shop_text, font=font_shop)
    draw.text(((PIN_W - (bbox3[2] - bbox3[0])) // 2, btn_y + 12), shop_text, fill=HEADER_TEXT, font=font_shop)

    # ── Kaydet ────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    canvas.save(output_path, "PNG", optimize=True)
    print(f"Görsel kaydedildi: {output_path}")
    return output_path


def create_all_pins(outfits: list[dict], output_dir: str = "output") -> list[str]:
    """Tüm kombinler için PIN görseli oluştur."""
    os.makedirs(output_dir, exist_ok=True)
    paths = []
    for i, outfit in enumerate(outfits, start=1):
        path = os.path.join(output_dir, f"PIN_{i:02d}_{outfit['title'].replace(' ', '_')}.png")
        create_pin(outfit, path, pin_number=i)
        paths.append(path)
    return paths
