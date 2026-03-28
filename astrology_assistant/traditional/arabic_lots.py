"""
Traditional Astrology — Arabic (Hermetic) Lots / Parts.
Includes: Lot of Fortune, Spirit, Eros, Marriage, and more.
"""
from typing import Dict
from ..core.ephemeris import degrees_to_sign, format_position

# Lot formulas (all: ASC + Planet1 - Planet2, or reversed for night chart)
LOT_FORMULAS = {
    "Lot of Fortune":        {"day": ("ASC", "SUN", "MOON"),    "night": ("ASC", "MOON", "SUN")},
    "Lot of Spirit":         {"day": ("ASC", "MOON", "SUN"),    "night": ("ASC", "SUN", "MOON")},
    "Lot of Eros":           {"day": ("ASC", "VENUS", "SPIRIT"), "night": ("ASC", "VENUS", "SPIRIT")},
    "Lot of Necessity":      {"day": ("ASC", "FORTUNE", "MOON"), "night": ("ASC", "MOON", "FORTUNE")},
    "Lot of Courage":        {"day": ("ASC", "FORTUNE", "MARS"), "night": ("ASC", "MARS", "FORTUNE")},
    "Lot of Victory":        {"day": ("ASC", "JUPITER", "SPIRIT"), "night": ("ASC", "SPIRIT", "JUPITER")},
    "Lot of Nemesis":        {"day": ("ASC", "FORTUNE", "SATURN"), "night": ("ASC", "SATURN", "FORTUNE")},
    # Marriage-specific lots
    "Lot of Marriage (M→F)": {"day": ("ASC", "VENUS", "SATURN"), "night": ("ASC", "SATURN", "VENUS")},
    "Lot of Marriage (F→M)": {"day": ("ASC", "SATURN", "VENUS"), "night": ("ASC", "VENUS", "SATURN")},
    "Lot of Love":           {"day": ("ASC", "VENUS", "SUN"),    "night": ("ASC", "VENUS", "SUN")},
    "Lot of Desire":         {"day": ("ASC", "VENUS", "MOON"),   "night": ("ASC", "MOON", "VENUS")},
    "Lot of Basis":          {"day": ("ASC", "FORTUNE", "SPIRIT"), "night": ("ASC", "FORTUNE", "SPIRIT")},
}

LOT_NAMES_TR = {
    "Lot of Fortune": "Talih Noktası",
    "Lot of Spirit": "Ruh Noktası",
    "Lot of Eros": "Eros (Arzu) Noktası",
    "Lot of Necessity": "Zorunluluk Noktası",
    "Lot of Courage": "Cesaret Noktası",
    "Lot of Victory": "Zafer Noktası",
    "Lot of Nemesis": "Nemesis Noktası",
    "Lot of Marriage (M→F)": "Evlilik Noktası (Erkeğin)",
    "Lot of Marriage (F→M)": "Evlilik Noktası (Kadının)",
    "Lot of Love": "Aşk Noktası",
    "Lot of Desire": "İstek/Arzı Noktası",
    "Lot of Basis": "Temel Noktası",
}

LOT_MARRIAGE_NOTES = {
    "Lot of Fortune": "Genel şans ve maddi/fiziksel mutluluk",
    "Lot of Spirit": "Amaç, niyet, inisiyatif — evlilikte aktif istek",
    "Lot of Eros": "Tutku ve arzu — romantik bağlılık",
    "Lot of Marriage (M→F)": "Erkeğin evlilik zamanlamasını gösterir",
    "Lot of Marriage (F→M)": "Kadının evlilik zamanlamasını gösterir",
    "Lot of Love": "Şevk ve romantik aşk",
    "Lot of Desire": "Duygusal arzu ve istek",
}


def is_day_chart(sun_lon: float, asc_lon: float, houses: Dict) -> bool:
    """Determine if chart is a day or night chart (Sun above horizon)."""
    sun_house = 0
    for h in range(1, 13):
        start = houses["cusps"].get(h, 0)
        end = houses["cusps"].get(h % 12 + 1, 0)
        if start <= sun_lon % 360 < end:
            sun_house = h
            break
    return sun_house in (7, 8, 9, 10, 11, 12)  # Above horizon


def calc_lot(asc: float, p1: float, p2: float) -> float:
    """Calculate a lot: ASC + P1 - P2."""
    return (asc + p1 - p2) % 360


def calc_all_lots(positions: Dict, houses: Dict, gender: str = "F") -> Dict:
    """
    Calculate all Arabic lots.
    Returns dict: lot_name -> {lon, sign, formatted, house, note}
    """
    asc = houses["ASC"]
    sun = positions.get("SUN", {}).get("lon", 0)
    moon = positions.get("MOON", {}).get("lon", 0)
    venus = positions.get("VENUS", {}).get("lon", 0)
    mars = positions.get("MARS", {}).get("lon", 0)
    jupiter = positions.get("JUPITER", {}).get("lon", 0)
    saturn = positions.get("SATURN", {}).get("lon", 0)
    mercury = positions.get("MERCURY", {}).get("lon", 0)

    day_chart = is_day_chart(sun, asc, houses)

    # Pre-calculate Fortune and Spirit for dependent lots
    fortune = calc_lot(asc, moon, sun) if day_chart else calc_lot(asc, sun, moon)
    spirit = calc_lot(asc, sun, moon) if day_chart else calc_lot(asc, moon, sun)

    planet_map = {
        "ASC": asc, "SUN": sun, "MOON": moon, "VENUS": venus,
        "MARS": mars, "JUPITER": jupiter, "SATURN": saturn,
        "MERCURY": mercury, "FORTUNE": fortune, "SPIRIT": spirit,
    }

    lots = {}
    for lot_name, formula in LOT_FORMULAS.items():
        # Use gender-appropriate marriage lot
        if lot_name == "Lot of Marriage (M→F)" and gender == "F":
            continue
        if lot_name == "Lot of Marriage (F→M)" and gender == "M":
            continue

        form = formula["day"] if day_chart else formula["night"]
        p0, p1, p2 = form

        try:
            lon0 = planet_map.get(p0, 0)
            lon1 = planet_map.get(p1, 0)
            lon2 = planet_map.get(p2, 0)
            lot_lon = calc_lot(lon0, lon1, lon2)
        except Exception:
            continue

        sign, deg, sidx = degrees_to_sign(lot_lon)
        from ..core.ephemeris import get_planet_in_house
        house = get_planet_in_house(lot_lon, houses["cusps"])

        lots[lot_name] = {
            "lon": lot_lon,
            "sign": sign,
            "sign_idx": sidx,
            "deg_in_sign": deg,
            "formatted": format_position(lot_lon),
            "house": house,
            "name_tr": LOT_NAMES_TR.get(lot_name, lot_name),
            "note": LOT_MARRIAGE_NOTES.get(lot_name, ""),
            "is_day_chart": day_chart,
        }

    return lots


def lots_summary(lots: Dict, person_name: str) -> str:
    """Format Arabic lots as readable summary."""
    lines = []
    lines.append(f"═══ ARABİK LOTLAR / HERMESÇE NOKTALAR — {person_name} ═══")
    lines.append("")

    # Prioritize marriage-related lots
    priority = [
        "Lot of Fortune", "Lot of Spirit", "Lot of Eros",
        "Lot of Marriage (M→F)", "Lot of Marriage (F→M)",
        "Lot of Love", "Lot of Desire",
        "Lot of Necessity", "Lot of Courage", "Lot of Victory", "Lot of Basis",
    ]

    for lot_name in priority:
        if lot_name in lots:
            d = lots[lot_name]
            lines.append(f"  ◆ {d['name_tr']}")
            lines.append(f"     Konum: {d['formatted']} [{d['house']}. Ev]")
            if d["note"]:
                lines.append(f"     Not: {d['note']}")
            lines.append("")

    return "\n".join(lines)
