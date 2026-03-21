"""
Pinterest PIN görseli oluşturucu — 1000x1500px PNG.
Western/Boho Cowgirl teması için optimize edilmiş.
"""

import os
import io
import requests
from PIL import Image, ImageDraw, ImageFont

# ── Pinterest PIN boyutu ───────────────────────────────────────────────────────
PIN_W = 1000
PIN_H = 1500

# ── Western/Boho renk paleti ───────────────────────────────────────────────────
PALETTE = {
    "bg":          (252, 248, 240),   # krem
    "dark":        (42, 28, 18),      # koyu kahve
    "gold":        (194, 156, 75),    # altın
    "gold_light":  (232, 200, 130),   # açık altın
    "warm_mid":    (168, 120, 72),    # orta kahve
    "text_dark":   (42, 28, 18),      # başlık metni
    "text_mid":    (100, 72, 45),     # açıklama metni
    "text_light":  (252, 248, 240),   # beyaz metin
    "divider":     (210, 185, 145),   # bej çizgi
    "card_bg":     (246, 240, 228),   # kart arka planı
}

# ── Font yolları ───────────────────────────────────────────────────────────────
FONT_DIR = "/usr/share/fonts/truetype"
FONTS = {
    "bold": [
        f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans-Bold.ttf",
    ],
    "regular": [
        f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans.ttf",
    ],
    "italic": [
        f"{FONT_DIR}/liberation/LiberationSans-BoldItalic.ttf",
        f"{FONT_DIR}/dejavu/DejaVuSans-BoldOblique.ttf",
    ],
}


def _load_font(style: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONTS.get(style, FONTS["regular"]):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def _fetch_image(url: str, size: tuple) -> Image.Image | None:
    """URL'den görsel indir."""
    if not url:
        return None
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        return _fit_image(img, size)
    except Exception:
        return None


def _fit_image(img: Image.Image, target: tuple) -> Image.Image:
    tw, th = target
    iw, ih = img.size
    ratio = max(tw / iw, th / ih)
    img = img.resize((int(iw * ratio), int(ih * ratio)), Image.LANCZOS)
    iw, ih = img.size
    left = (iw - tw) // 2
    top = (ih - th) // 2
    return img.crop((left, top, left + tw, top + th))


def _hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def _blend_color(color: tuple, white_ratio: float) -> tuple:
    """Rengi beyaza doğru karıştır."""
    return tuple(int(c + (255 - c) * white_ratio) for c in color)


def _draw_product_card(canvas: Image.Image, draw: ImageDraw.ImageDraw,
                        item: dict, x: int, y: int, w: int, h: int):
    """Tek ürün kartı çiz (görsel veya renkli placeholder)."""
    img_h = h - 95
    img_area = (x, y, x + w, y + img_h)

    # Ürün rengi
    color_hex = item.get("color_hex", "#C4956A")
    base_rgb = _hex_to_rgb(color_hex)
    light_rgb = _blend_color(base_rgb, 0.45)

    # Ürün görselini dene
    product_img = _fetch_image(item.get("image_url", ""), (w, img_h))

    if product_img:
        canvas.paste(product_img, (x, y))
    else:
        # Degradeli renkli placeholder — ürün rengine uygun
        for row_i in range(img_h):
            ratio = row_i / img_h
            r = int(light_rgb[0] + (base_rgb[0] - light_rgb[0]) * ratio)
            g = int(light_rgb[1] + (base_rgb[1] - light_rgb[1]) * ratio)
            b = int(light_rgb[2] + (base_rgb[2] - light_rgb[2]) * ratio)
            draw.line([(x, y + row_i), (x + w, y + row_i)], fill=(r, g, b))

        # Dekoratif çizgi deseni (Western fringes hissi)
        fringe_font = _load_font("regular", 18)
        pattern_text = "~ ~ ~ ~ ~ ~ ~ ~"
        pb = draw.textbbox((0, 0), pattern_text, font=fringe_font)
        pw = pb[2] - pb[0]
        px = x + (w - pw) // 2
        for py_offset in range(40, img_h - 40, 50):
            draw.text((px, y + py_offset), pattern_text,
                      fill=(*_blend_color(base_rgb, 0.2), 140), font=fringe_font)

        # Ürün simgesi (kategori emoji text)
        cat = item.get("category", item.get("category_hint", ""))
        icon_map = {
            "elbise": "▲", "alt": "◆", "ust": "●",
            "aksesuar": "✦", "ayakkabi": "◗", "canta": "▣", "dis_giyim": "◈",
        }
        icon = icon_map.get(cat, "★")
        icon_font = _load_font("bold", 56)
        ib = draw.textbbox((0, 0), icon, font=icon_font)
        iw2 = ib[2] - ib[0]
        ih2 = ib[3] - ib[1]
        draw.text(
            (x + (w - iw2) // 2, y + (img_h - ih2) // 2 - 10),
            icon,
            fill=(*_blend_color(base_rgb, 0.15),),
            font=icon_font
        )

    # Alt kısım — ürün ismi + fiyat
    name_area_y = y + img_h + 5

    # İsim
    font_name = _load_font("bold", 20)
    name = item.get("name", "")
    # Kelime kır
    words = name.split()
    lines = []
    current = ""
    for word in words:
        test = (current + " " + word).strip()
        bb = draw.textbbox((0, 0), test, font=font_name)
        if bb[2] - bb[0] <= w - 8:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    for li, line in enumerate(lines[:2]):
        draw.text((x + 4, name_area_y + li * 22), line,
                  fill=PALETTE["text_dark"], font=font_name)

    # Fiyat
    price = item.get("price", "")
    if price:
        font_price = _load_font("bold", 22)
        draw.text((x + 4, name_area_y + 46), price,
                  fill=PALETTE["gold"], font=font_price)


def _draw_diamond_border(draw: ImageDraw.ImageDraw, x1: int, y1: int, x2: int, y2: int, color: tuple, spacing: int = 24):
    """Dekoratif noktalı çerçeve."""
    # Üst/alt
    for px in range(x1, x2, spacing):
        draw.ellipse([(px - 2, y1 - 2), (px + 2, y1 + 2)], fill=color)
        draw.ellipse([(px - 2, y2 - 2), (px + 2, y2 + 2)], fill=color)
    # Sol/sağ
    for py in range(y1, y2, spacing):
        draw.ellipse([(x1 - 2, py - 2), (x1 + 2, py + 2)], fill=color)
        draw.ellipse([(x2 - 2, py - 2), (x2 + 2, py + 2)], fill=color)


def create_pin(outfit: dict, output_path: str, pin_number: int = 1,
               store_name: str = "Infinite Elegance Co.") -> str:
    """
    Kombin için Pinterest PIN görseli oluştur.
    Returns: kaydedilen dosya yolu
    """
    canvas = Image.new("RGB", (PIN_W, PIN_H), PALETTE["bg"])
    draw = ImageDraw.Draw(canvas)

    items = outfit["items"][:4]
    n = len(items)

    # ══════════════════════════════════════════════════════════════
    # 1. HEADER
    # ══════════════════════════════════════════════════════════════
    header_h = 175

    # Koyu header arka plan
    draw.rectangle([(0, 0), (PIN_W, header_h)], fill=PALETTE["dark"])

    # Altın çizgiler (dekoratif)
    draw.line([(0, 6), (PIN_W, 6)], fill=PALETTE["gold"], width=2)
    draw.line([(0, header_h - 7), (PIN_W, header_h - 7)], fill=PALETTE["gold"], width=2)

    # Köşe süsler
    corner_size = 20
    for cx, cy in [(20, 20), (PIN_W - 20, 20), (20, header_h - 20), (PIN_W - 20, header_h - 20)]:
        draw.ellipse([(cx - 4, cy - 4), (cx + 4, cy + 4)], fill=PALETTE["gold"])

    # Store ismi (küçük, altın)
    font_store = _load_font("italic", 26)
    store_bb = draw.textbbox((0, 0), store_name, font=font_store)
    store_w = store_bb[2] - store_bb[0]
    draw.text(((PIN_W - store_w) // 2, 18), store_name, fill=PALETTE["gold_light"], font=font_store)

    # Kombin başlığı (büyük, beyaz)
    font_title = _load_font("bold", 54)
    title = outfit["title"].upper()
    # Uzunsa satır kır
    title_words = title.split()
    title_lines = []
    cur = ""
    for w_word in title_words:
        test = (cur + " " + w_word).strip()
        bb = draw.textbbox((0, 0), test, font=font_title)
        if bb[2] - bb[0] <= PIN_W - 80:
            cur = test
        else:
            if cur:
                title_lines.append(cur)
            cur = w_word
    if cur:
        title_lines.append(cur)

    title_start_y = 52
    for ti, tl in enumerate(title_lines[:2]):
        bb = draw.textbbox((0, 0), tl, font=font_title)
        tw2 = bb[2] - bb[0]
        draw.text(((PIN_W - tw2) // 2, title_start_y + ti * 58), tl,
                  fill=PALETTE["text_light"], font=font_title)

    # PIN numarası
    font_pin = _load_font("regular", 22)
    pin_label = f"✦  OUTFIT #{pin_number}  ✦"
    pb = draw.textbbox((0, 0), pin_label, font=font_pin)
    draw.text(((PIN_W - (pb[2] - pb[0])) // 2, header_h - 32), pin_label,
              fill=PALETTE["gold_light"], font=font_pin)

    # ══════════════════════════════════════════════════════════════
    # 2. ÜRÜN GRİD
    # ══════════════════════════════════════════════════════════════
    grid_top = header_h + 16
    footer_h = 200
    grid_h = PIN_H - grid_top - footer_h - 16

    padding = 14
    if n <= 2:
        cols, rows = n, 1
    elif n == 3:
        cols, rows = 3, 1
    else:
        cols, rows = 2, 2

    cell_w = (PIN_W - padding * (cols + 1)) // cols
    cell_h = (grid_h - padding * (rows + 1)) // rows

    for idx, item in enumerate(items):
        row = idx // cols
        col = idx % cols
        x = padding + col * (cell_w + padding)
        y = grid_top + padding + row * (cell_h + padding)
        _draw_product_card(canvas, draw, item, x, y, cell_w, cell_h)

    # ══════════════════════════════════════════════════════════════
    # 3. FOOTER
    # ══════════════════════════════════════════════════════════════
    footer_y = PIN_H - footer_h

    # Altın ince çizgi
    draw.line([(30, footer_y), (PIN_W - 30, footer_y)], fill=PALETTE["gold"], width=2)

    # Açıklama
    font_desc = _load_font("italic", 25)
    desc = outfit.get("description", "")
    # Wrap
    desc_words = desc.split()
    desc_lines = []
    dcur = ""
    for dw in desc_words:
        dtest = (dcur + " " + dw).strip()
        dbb = draw.textbbox((0, 0), dtest, font=font_desc)
        if dbb[2] - dbb[0] <= PIN_W - 80:
            dcur = dtest
        else:
            if dcur:
                desc_lines.append(dcur)
            dcur = dw
    if dcur:
        desc_lines.append(dcur)

    dy = footer_y + 14
    for dline in desc_lines[:2]:
        dbb = draw.textbbox((0, 0), dline, font=font_desc)
        draw.text(((PIN_W - (dbb[2] - dbb[0])) // 2, dy), dline,
                  fill=PALETTE["text_mid"], font=font_desc)
        dy += 30

    # Fiyat aralığı
    prices = [item.get("price", "") for item in items if item.get("price")]
    if prices:
        font_price_info = _load_font("bold", 24)
        price_text = f"From {min(prices, key=lambda p: float(p.replace('$','').replace(',','').replace('₺','')) if p else 9999)}"
        try:
            nums = []
            for p in prices:
                val = p.replace("$", "").replace("₺", "").replace(",", "").strip()
                if val:
                    nums.append(float(val))
            if nums:
                price_text = f"Starting from ${min(nums):.2f}"
        except Exception:
            price_text = "  ".join(prices[:2])
        pb2 = draw.textbbox((0, 0), price_text, font=font_price_info)
        draw.text(((PIN_W - (pb2[2] - pb2[0])) // 2, dy + 6), price_text,
                  fill=PALETTE["gold"], font=font_price_info)

    # "Shop on Amazon" butonu
    btn_y = PIN_H - 65
    btn_x1, btn_x2 = 50, PIN_W - 50
    # Buton arka planı (altın)
    draw.rounded_rectangle([(btn_x1, btn_y), (btn_x2, btn_y + 50)],
                             radius=12, fill=PALETTE["gold"])
    font_btn = _load_font("bold", 28)
    btn_text = "✦  Shop on Amazon  ✦"
    bbb = draw.textbbox((0, 0), btn_text, font=font_btn)
    draw.text(((PIN_W - (bbb[2] - bbb[0])) // 2, btn_y + 11),
              btn_text, fill=PALETTE["dark"], font=font_btn)

    # Dış çerçeve dekorasyonu
    _draw_diamond_border(draw, 4, 4, PIN_W - 4, PIN_H - 4,
                          color=(*PALETTE["gold"], 160), spacing=30)

    # Kaydet
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
    canvas.save(output_path, "PNG", optimize=True)
    print(f"  ✓ {os.path.basename(output_path)}")
    return output_path


def create_all_pins(outfits: list, output_dir: str = "output",
                    store_name: str = "Infinite Elegance Co.") -> list:
    """Tüm kombinler için PIN oluştur."""
    os.makedirs(output_dir, exist_ok=True)
    paths = []
    for i, outfit in enumerate(outfits, start=1):
        safe_title = outfit["title"].replace(" ", "_").replace("/", "-")
        path = os.path.join(output_dir, f"PIN_{i:02d}_{safe_title}.png")
        create_pin(outfit, path, pin_number=i, store_name=store_name)
        paths.append(path)
    return paths
