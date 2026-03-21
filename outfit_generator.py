"""
Kural tabanlı kombin önerisi motoru.
API gerektirmez — ürün ismi + renk analizine dayanır.
"""

import re
import random
from itertools import combinations


# ── Kategori anahtar kelimeleri ────────────────────────────────────────────────
CATEGORY_KEYWORDS = {
    "ust": [
        "bluz", "gömlek", "tişört", "t-shirt", "top", "kazak", "sweatshirt",
        "hoodie", "tunik", "kaban", "ceket", "mont", "yelek", "crop",
        "blouse", "shirt", "sweater", "cardigan", "pullover", "jacket", "coat",
    ],
    "alt": [
        "pantolon", "jean", "kot", "etek", "tayt", "şort", "palazzo",
        "trousers", "pants", "jeans", "skirt", "shorts", "leggings",
    ],
    "elbise": [
        "elbise", "tulum", "dress", "jumpsuit", "overall", "midi", "maxi",
        "mini elbise",
    ],
    "dis_giyim": [
        "palto", "trençkot", "oversize ceket", "blazer", "hırka",
        "trench", "overcoat", "parka",
    ],
    "ayakkabi": [
        "ayakkabı", "bot", "topuklu", "sneaker", "sandalet", "loafer",
        "spor ayakkabı", "shoes", "boots", "heels", "sandals", "sneakers",
    ],
    "canta": [
        "çanta", "el çantası", "sırt çantası", "clutch", "tote",
        "bag", "purse", "handbag", "backpack",
    ],
    "aksesuar": [
        "kemer", "kolyesi", "bileklik", "atkı", "şapka", "gözlük",
        "belt", "scarf", "hat", "glasses", "sunglasses", "necklace",
    ],
}

# ── Renk tespiti ───────────────────────────────────────────────────────────────
COLOR_KEYWORDS = {
    "siyah": ["siyah", "black"],
    "beyaz": ["beyaz", "white", "ekru", "krem", "cream", "ivory", "ecru"],
    "bej": ["bej", "bege", "camel", "ten", "nude", "sand"],
    "kırmızı": ["kırmızı", "red", "bordo", "burgundy", "wine"],
    "mavi": ["mavi", "blue", "lacivert", "navy", "indigo", "denim", "kot"],
    "yeşil": ["yeşil", "green", "haki", "khaki", "zeytin", "olive", "mint"],
    "pembe": ["pembe", "pink", "rose", "pudra", "mauve"],
    "sarı": ["sarı", "yellow", "hardal", "mustard"],
    "mor": ["mor", "purple", "lila", "lilac", "lavanta", "lavender"],
    "gri": ["gri", "gray", "grey", "silver"],
    "kahve": ["kahve", "brown", "çikolata", "chocolate", "taba"],
    "turuncu": ["turuncu", "orange", "mercan", "coral", "terracotta"],
    "renkli": ["renkli", "çiçekli", "floral", "desenli", "patterned", "ekoseli", "çizgili"],
}

# ── Renk uyum kuralları ────────────────────────────────────────────────────────
NEUTRAL_COLORS = {"siyah", "beyaz", "bej", "gri", "kahve"}

COLOR_COMBOS = [
    # (renk1, renk2) — iyi giden çiftler
    ("siyah", "beyaz"), ("siyah", "kırmızı"), ("siyah", "sarı"),
    ("siyah", "pembe"), ("siyah", "mor"), ("siyah", "mavi"),
    ("beyaz", "mavi"), ("beyaz", "yeşil"), ("beyaz", "kırmızı"),
    ("beyaz", "pembe"), ("beyaz", "sarı"),
    ("bej", "kahve"), ("bej", "kırmızı"), ("bej", "yeşil"),
    ("bej", "turuncu"), ("bej", "mavi"),
    ("gri", "pembe"), ("gri", "mavi"), ("gri", "mor"),
    ("lacivert", "beyaz"), ("mavi", "sarı"), ("mavi", "bej"),
    ("yeşil", "bej"), ("yeşil", "kahve"), ("yeşil", "beyaz"),
    ("kahve", "sarı"), ("kahve", "turuncu"), ("kahve", "krem"),
]

# ── Stil tespiti ───────────────────────────────────────────────────────────────
STYLE_KEYWORDS = {
    "casual": ["rahat", "günlük", "casual", "basic", "oversize", "mom"],
    "formal": ["ofis", "toplantı", "şık", "blazer", "formal", "elegant"],
    "boho": ["boho", "etnik", "bohemian", "çiçekli", "floral", "fırfır", "volanlı"],
    "sporty": ["spor", "athletic", "yoga", "koşu", "running", "training"],
    "trendy": ["trendi", "trend", "mini", "crop", "cut-out", "slit"],
}


def detect_category(name: str, hint: str = "") -> str:
    if hint and hint in CATEGORY_KEYWORDS:
        return hint
    name_lower = name.lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return cat
    return "diger"


def detect_color(name: str) -> str:
    name_lower = name.lower()
    for color, keywords in COLOR_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return color
    return "bilinmiyor"


def detect_style(name: str) -> str:
    name_lower = name.lower()
    for style, keywords in STYLE_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return style
    return "casual"


def colors_match(c1: str, c2: str) -> bool:
    if c1 in NEUTRAL_COLORS or c2 in NEUTRAL_COLORS:
        return True
    if c1 == c2:
        return True  # monokrom
    pair = (c1, c2)
    pair_r = (c2, c1)
    return pair in COLOR_COMBOS or pair_r in COLOR_COMBOS


def annotate_products(products: list[dict]) -> list[dict]:
    """Her ürüne kategori, renk ve stil ekle."""
    annotated = []
    for p in products:
        p = dict(p)
        hint = p.get("category_hint", "")
        p["category"] = detect_category(p["name"], hint)
        p["color"] = detect_color(p["name"])
        p["style"] = detect_style(p["name"])
        annotated.append(p)
    return annotated


def generate_outfits(products: list[dict], max_outfits: int = 5) -> list[dict]:
    """
    Ürünlerden kombin setleri oluştur.
    Returns: [{"title": ..., "description": ..., "items": [product, ...]}]
    """
    annotated = annotate_products(products)

    # Kategoriye göre grupla
    by_cat: dict[str, list[dict]] = {}
    for p in annotated:
        by_cat.setdefault(p["category"], []).append(p)

    outfits = []

    # Strateji 1: Elbise + aksesuar/çanta/ayakkabı
    for dress in by_cat.get("elbise", []):
        companions = []
        for cat in ("ayakkabi", "canta", "aksesuar", "dis_giyim"):
            items = by_cat.get(cat, [])
            for item in items:
                if colors_match(dress["color"], item["color"]):
                    companions.append(item)
                    break
        if companions:
            outfit_items = [dress] + companions[:3]
            outfits.append(_make_outfit(outfit_items, "Hazır Kombin"))
        if len(outfits) >= max_outfits:
            break

    # Strateji 2: Üst + Alt + (ayakkabı / çanta)
    for ust in by_cat.get("ust", []):
        for alt in by_cat.get("alt", []):
            if not colors_match(ust["color"], alt["color"]):
                continue
            companions = []
            for cat in ("ayakkabi", "canta"):
                items = by_cat.get(cat, [])
                for item in items:
                    if colors_match(alt["color"], item["color"]):
                        companions.append(item)
                        break
            outfit_items = [ust, alt] + companions[:2]
            outfits.append(_make_outfit(outfit_items, "Günlük Kombin"))
            if len(outfits) >= max_outfits:
                break
        if len(outfits) >= max_outfits:
            break

    # Strateji 3: Stil bazlı kombin
    if len(outfits) < max_outfits:
        for style in ("formal", "boho", "trendy", "sporty", "casual"):
            styled = [p for p in annotated if p["style"] == style]
            if len(styled) >= 2:
                # Üst + alt veya elbise var mı?
                ust_items = [p for p in styled if p["category"] == "ust"]
                alt_items = [p for p in styled if p["category"] == "alt"]
                elbise_items = [p for p in styled if p["category"] == "elbise"]
                extras = [p for p in styled if p["category"] in ("ayakkabi", "canta", "aksesuar")]

                if elbise_items and extras:
                    outfit_items = [elbise_items[0]] + extras[:3]
                elif ust_items and alt_items:
                    outfit_items = [ust_items[0], alt_items[0]] + extras[:2]
                else:
                    continue

                title = {
                    "formal": "Ofis Şıklığı",
                    "boho": "Boho Rüzgarı",
                    "trendy": "Trend Kombin",
                    "sporty": "Spor & Şık",
                    "casual": "Hafta Sonu Rahatı",
                }.get(style, "Özel Kombin")

                outfits.append(_make_outfit(outfit_items, title))
                if len(outfits) >= max_outfits:
                    break

    # Yeterli kombin oluşturulamadıysa rastgele eşleştir
    if not outfits and len(annotated) >= 2:
        random.shuffle(annotated)
        chunk_size = min(4, len(annotated))
        for i in range(0, min(len(annotated), max_outfits * chunk_size), chunk_size):
            outfit_items = annotated[i:i + chunk_size]
            if outfit_items:
                outfits.append(_make_outfit(outfit_items, f"Kombin {len(outfits)+1}"))
            if len(outfits) >= max_outfits:
                break

    return outfits[:max_outfits]


def _make_outfit(items: list[dict], base_title: str) -> dict:
    """Kombin sözlüğü oluştur."""
    style = items[0].get("style", "casual") if items else "casual"
    style_desc = {
        "formal": "ofis ve özel davetler için ideal",
        "boho": "özgür ruhunuzu yansıtan romantik bir seçim",
        "trendy": "sezonun en popüler trendlerini taşıyan",
        "sporty": "aktif yaşam tarzı için şık ve rahat",
        "casual": "günlük kullanım için zarifçe tasarlanmış",
    }.get(style, "her ortama uygun")

    cats = [i.get("category", "") for i in items]
    has_dress = "elbise" in cats
    has_shoes = "ayakkabi" in cats

    if has_dress:
        desc = f"Zarif bir elbise kombinasyonu — {style_desc}."
    else:
        desc = f"Parçaları bir araya getiren şık bir kombin — {style_desc}."

    if has_shoes:
        desc += " Tamamlayıcı ayakkabı seçimi kombinizi mükemmelleştiriyor."

    return {
        "title": base_title,
        "description": desc,
        "items": items,
    }
