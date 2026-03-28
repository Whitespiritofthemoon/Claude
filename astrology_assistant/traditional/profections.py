"""
Traditional Astrology — Annual Profections, Firdaria, Zodiacal Releasing.
"""
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import pytz
from ..core.ephemeris import degrees_to_sign, format_position, ZODIAC_SIGNS

# ── Annual Profections ───────────────────────────────────────────────────────
HOUSE_THEMES = {
    1: "Benlik, yeni başlangıçlar, fiziksel görünüm",
    2: "Para, değerler, mülk",
    3: "İletişim, kardeşler, kısa yolculuklar",
    4: "Ev, aile, kökler",
    5: "Aşk, çocuklar, yaratıcılık, zevk",
    6: "Sağlık, günlük rutin, çalışma",
    7: "Evlilik, ortaklıklar, ilişkiler",
    8: "Dönüşüm, miras, cinsellik, ortak kaynaklar",
    9: "Yolculuklar, felsefe, yabancı ülkeler",
    10: "Kariyer, şöhret, sosyal statü",
    11: "Dostlar, hayaller, topluluk",
    12: "Gizlilik, ruhsallık, yalnızlık, engeller",
}

PROFECTION_HOUSE_AGE = {
    0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9,
    9: 10, 10: 11, 11: 12, 12: 1, 13: 2, 14: 3, 15: 4, 16: 5,
    17: 6, 18: 7, 19: 8, 20: 9, 21: 10, 22: 11, 23: 12,
    24: 1, 25: 2, 26: 3, 27: 4, 28: 5, 29: 6, 30: 7, 31: 8,
    32: 9, 33: 10, 34: 11, 35: 12, 36: 1, 37: 2, 38: 3, 39: 4,
    40: 5, 41: 6, 42: 7, 43: 8, 44: 9, 45: 10, 46: 11, 47: 12,
    48: 1, 49: 2, 50: 3, 51: 4, 52: 5, 53: 6, 54: 7, 55: 8,
    56: 9, 57: 10, 58: 11, 59: 12, 60: 1, 61: 2, 62: 3, 63: 4,
    64: 5, 65: 6, 66: 7, 67: 8, 68: 9, 69: 10, 70: 11, 71: 12,
}


def calc_profected_house(birth_dt: datetime, target_dt: Optional[datetime] = None) -> Tuple[int, int, str]:
    """
    Calculate the annual profected house for a given age.
    Returns (house_number, age, theme).
    """
    if target_dt is None:
        target_dt = datetime.now(pytz.utc)

    # Calculate age
    birth = birth_dt if birth_dt.tzinfo else pytz.utc.localize(birth_dt)
    target = target_dt if target_dt.tzinfo else pytz.utc.localize(target_dt)
    age = int((target - birth).days / 365.25)

    house = (age % 12) + 1
    theme = HOUSE_THEMES.get(house, "")

    return house, age, theme


def profection_sign(natal_asc_lon: float, profected_house: int) -> str:
    """Get the sign of the profected house."""
    asc_sign_idx = int(natal_asc_lon // 30)
    house_sign_idx = (asc_sign_idx + profected_house - 1) % 12
    return ZODIAC_SIGNS[house_sign_idx]


def profection_lord(natal_asc_lon: float, profected_house: int, positions: Dict) -> str:
    """Get the Time Lord (ruler) of the profected house."""
    sign = profection_sign(natal_asc_lon, profected_house)
    from ..core.ephemeris import sign_ruler
    return sign_ruler(sign)


def profection_summary(natal_chart, target_dt: Optional[datetime] = None) -> str:
    """Generate annual profection summary."""
    if target_dt is None:
        target_dt = datetime.now(pytz.utc)

    house, age, theme = calc_profected_house(natal_chart.dt, target_dt)
    sign = profection_sign(natal_chart.houses["ASC"], house)
    lord = profection_lord(natal_chart.houses["ASC"], house, natal_chart.positions)

    lines = []
    lines.append(f"═══ YILLIK PROFEKSİYON — {natal_chart.person['short']} ═══")
    lines.append(f"Yaş: {age}  |  Yıl: {target_dt.year}")
    lines.append(f"Aktif Profeksiyon Evi: {house}. Ev — {sign} burcu")
    lines.append(f"Konular: {theme}")
    lines.append(f"Yıl Yöneticisi (Time Lord): {lord}")

    if house == 7:
        lines.append("")
        lines.append("★★★ 7. Ev Profeksiyonu — Bu yıl evlilik/ilişki odaklı! ★★★")
        lines.append("Bu yıl Venus ve 7. ev yöneticisi özellikle aktif olacak.")

    # Next 7th house year
    years_to_7th = (6 - (house - 1)) % 12
    if years_to_7th == 0:
        years_to_7th = 12
    next_7th_age = age + years_to_7th
    next_7th_year = target_dt.year + years_to_7th

    lines.append(f"\nSonraki 7. Ev Profeksiyonu: {next_7th_age} yaşında ({next_7th_year})")

    # Show next few years
    lines.append("\n— Önümüzdeki 5 Yılın Profeksiyonları —")
    for i in range(1, 6):
        future_dt = datetime(target_dt.year + i, target_dt.month, target_dt.day,
                             tzinfo=pytz.utc)
        fut_house, fut_age, fut_theme = calc_profected_house(natal_chart.dt, future_dt)
        fut_sign = profection_sign(natal_chart.houses["ASC"], fut_house)
        fut_lord = profection_lord(natal_chart.houses["ASC"], fut_house, natal_chart.positions)
        star = " ★ EVLİLİK!" if fut_house == 7 else ""
        lines.append(f"  {target_dt.year + i}: {fut_age} yaş → {fut_house}. Ev ({fut_sign}) — Lord: {fut_lord}{star}")

    return "\n".join(lines)


# ── Firdaria ──────────────────────────────────────────────────────────────────
FIRDARIA_DAY = [
    ("SUN", 10), ("VENUS", 8), ("MERCURY", 13), ("MOON", 9),
    ("SATURN", 11), ("JUPITER", 12), ("MARS", 7),
    ("NORTH_NODE", 3), ("SOUTH_NODE", 2),
]

FIRDARIA_NIGHT = [
    ("MOON", 9), ("SATURN", 11), ("MERCURY", 13), ("VENUS", 8),
    ("SUN", 10), ("MARS", 7), ("JUPITER", 12),
    ("NORTH_NODE", 3), ("SOUTH_NODE", 2),
]

FIRDARIA_TR = {
    "SUN": "Güneş", "MOON": "Ay", "MERCURY": "Merkür", "VENUS": "Venüs",
    "MARS": "Mars", "JUPITER": "Jüpiter", "SATURN": "Satürn",
    "NORTH_NODE": "Kuzey Düğüm", "SOUTH_NODE": "Güney Düğüm",
}

FIRDARIA_MARRIAGE_NOTES = {
    "VENUS": "Venüs Firdaria — En güçlü aşk/evlilik dönemi",
    "JUPITER": "Jüpiter Firdaria — Bereket, büyüme, evlilik zamanı",
    "SUN": "Güneş Firdaria — Benlik ve güç, ilişki ikinci planda",
    "MOON": "Ay Firdaria — Duygusal bağlar, ev ve aile kurma",
    "NORTH_NODE": "Kuzey Düğüm Firdaria — Karma bağlar, kader anları",
    "SATURN": "Satürn Firdaria — Gecikme ama kalıcı bağlar",
    "MARS": "Mars Firdaria — Tutku ve eylem",
    "MERCURY": "Merkür Firdaria — İletişim, nişan planlaması",
    "SOUTH_NODE": "Güney Düğüm Firdaria — Geçmiş karma çözümü",
}


def calc_firdaria(birth_dt: datetime, sun_lon: float, asc_lon: float,
                  birth_tz: str) -> List[Dict]:
    """Calculate Firdaria periods from birth."""
    # Day/night chart
    from ..core.ephemeris import get_planet_in_house
    sun_above = False
    sun_sign_idx = int(sun_lon // 30)
    asc_sign_idx = int(asc_lon // 30)
    house = ((sun_sign_idx - asc_sign_idx) % 12) + 1
    is_day = house >= 7  # Sun in houses 7-12 = day chart

    sequence = FIRDARIA_DAY if is_day else FIRDARIA_NIGHT

    tz = pytz.timezone(birth_tz)
    birth_aware = tz.localize(birth_dt) if birth_dt.tzinfo is None else birth_dt.astimezone(tz)

    periods = []
    current_start = birth_aware
    for planet, years in sequence:
        end_dt = current_start + __import__("datetime").timedelta(days=years * 365.25)
        periods.append({
            "planet": planet,
            "planet_tr": FIRDARIA_TR.get(planet, planet),
            "start": current_start,
            "end": end_dt,
            "years": years,
            "marriage_note": FIRDARIA_MARRIAGE_NOTES.get(planet, ""),
        })
        current_start = end_dt

    # Second cycle
    for planet, years in sequence:
        end_dt = current_start + __import__("datetime").timedelta(days=years * 365.25)
        periods.append({
            "planet": planet,
            "planet_tr": FIRDARIA_TR.get(planet, planet),
            "start": current_start,
            "end": end_dt,
            "years": years,
            "marriage_note": FIRDARIA_MARRIAGE_NOTES.get(planet, ""),
        })
        current_start = end_dt

    return periods


def get_current_firdaria(periods: List[Dict], now: Optional[datetime] = None) -> Optional[Dict]:
    """Find the current active Firdaria period."""
    if now is None:
        now = datetime.now(pytz.utc)
    if now.tzinfo is None:
        now = pytz.utc.localize(now)

    for p in periods:
        start = p["start"].astimezone(pytz.utc) if p["start"].tzinfo else pytz.utc.localize(p["start"])
        end = p["end"].astimezone(pytz.utc) if p["end"].tzinfo else pytz.utc.localize(p["end"])
        if start <= now < end:
            return p
    return None


def firdaria_summary(natal_chart) -> str:
    """Generate Firdaria summary for a natal chart."""
    firdaria = calc_firdaria(
        natal_chart.dt,
        natal_chart.positions["SUN"]["lon"],
        natal_chart.houses["ASC"],
        natal_chart.person["timezone"]
    )

    current = get_current_firdaria(firdaria)
    lines = []
    lines.append(f"═══ FİRDARİA — {natal_chart.person['short']} ═══")

    if current:
        lines.append(f"Aktif Firdaria: {current['planet_tr']}")
        lines.append(f"  {current['start'].strftime('%d.%m.%Y')} → {current['end'].strftime('%d.%m.%Y')}")
        lines.append(f"  Not: {current['marriage_note']}")

    lines.append("\n— Tüm Firdaria Dönemleri (Seçilmiş) —")
    now = datetime.now(pytz.utc)
    for p in firdaria:
        end = p["end"].astimezone(pytz.utc) if p["end"].tzinfo else pytz.utc.localize(p["end"])
        if end > now:
            marker = " ◄ AKTİF" if p == current else ""
            lines.append(f"  {p['planet_tr']:15s}: {p['start'].strftime('%Y')} → {p['end'].strftime('%Y')}{marker}")
            if p["planet"] in ("VENUS", "JUPITER") and end > now:
                lines.append(f"    ★ {p['marriage_note']}")

    return "\n".join(lines)
