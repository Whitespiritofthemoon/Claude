"""
Vedic Astrology — Vimshottari Dasha periods.
Based on Moon's Nakshatra at birth.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import pytz

# Nakshatra names (27 + 1)
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Dasha rulers for each nakshatra (repeating cycle)
NAKSHATRA_RULERS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars",
    "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars",
    "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars",
    "Rahu", "Jupiter", "Saturn", "Mercury",
]

# Dasha periods in years
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}

# Dasha cycle order
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars",
               "Rahu", "Jupiter", "Saturn", "Mercury"]

TOTAL_DASHA_YEARS = sum(DASHA_YEARS.values())  # 120 years

# Planet associations in Turkish
DASHA_TR = {
    "Ketu": "Ketu (Güney Düğümü)",
    "Venus": "Venüs (Şukra)",
    "Sun": "Güneş (Surya)",
    "Moon": "Ay (Chandra)",
    "Mars": "Mars (Mangal)",
    "Rahu": "Rahu (Kuzey Düğümü)",
    "Jupiter": "Jüpiter (Guru)",
    "Saturn": "Satürn (Shani)",
    "Mercury": "Merkür (Budha)",
}

# Marriage significance of each mahadasha
MARRIAGE_DASHA = {
    "Venus": "En güçlü evlilik dasha'sı — ilişki, aşk, evlilik zamanı",
    "Jupiter": "Evlilik, bereket, büyüme — çok olumlu",
    "Moon": "Duygusal bağlar, ev ve aile",
    "Rahu": "Beklenmedik ilişki gelişmeleri, Karma bağlar",
    "Mars": "Tutku, eylem — ilişkide aktif dönem",
    "Mercury": "İletişim ve karar alma — nişan için uygun",
    "Sun": "Benlik odaklı dönem — ilişki ikinci planda",
    "Saturn": "Gecikme ve olgunlaşma — geç ama kalıcı bağlar",
    "Ketu": "Ruhsal dönem — ilişkiden çok içe dönüş",
}


def calc_nakshatra(moon_lon_sidereal: float) -> Tuple[str, int, float]:
    """
    Calculate nakshatra from sidereal Moon longitude.
    Returns (nakshatra_name, index, remaining_fraction).
    """
    nak_idx = int(moon_lon_sidereal // (360 / 27))
    nak_idx = nak_idx % 27
    nak_lon = moon_lon_sidereal % (360 / 27)
    remaining_fraction = 1 - (nak_lon / (360 / 27))
    return NAKSHATRAS[nak_idx], nak_idx, remaining_fraction


def calc_vimshottari_dasha(birth_jd: float, moon_lon_sidereal: float,
                           birth_dt: datetime, birth_tz: str) -> List[Dict]:
    """
    Calculate complete Vimshottari Dasha sequence from birth.
    Returns list of dasha periods with start/end dates.
    """
    nak_name, nak_idx, remaining_frac = calc_nakshatra(moon_lon_sidereal)
    ruler = NAKSHATRA_RULERS[nak_idx]

    # Find position in dasha cycle
    ruler_pos = DASHA_ORDER.index(ruler)
    total_years = DASHA_YEARS[ruler]

    # Calculate elapsed and remaining time in first dasha
    elapsed_years = (1 - remaining_frac) * total_years
    remaining_years = remaining_frac * total_years

    # Build dasha list
    dashas = []

    # Birth timezone
    tz = pytz.timezone(birth_tz)
    if birth_dt.tzinfo is None:
        birth_dt_aware = tz.localize(birth_dt)
    else:
        birth_dt_aware = birth_dt.astimezone(tz)

    # Current dasha start = birth - elapsed
    current_start = birth_dt_aware - timedelta(days=elapsed_years * 365.25)
    current_pos = ruler_pos

    # Generate ~150 years of dashas (covers full 120-year cycle)
    for _ in range(40):
        planet = DASHA_ORDER[current_pos % 9]
        years = DASHA_YEARS[planet]
        if planet == ruler and _ == 0:
            years = remaining_years

        end_dt = current_start + timedelta(days=years * 365.25)
        dashas.append({
            "planet": planet,
            "planet_tr": DASHA_TR[planet],
            "start": current_start,
            "end": end_dt,
            "years": years,
            "marriage_note": MARRIAGE_DASHA.get(planet, ""),
        })
        current_start = end_dt
        current_pos += 1

    return dashas


def calc_antardasha(mahadasha: Dict) -> List[Dict]:
    """Calculate sub-periods (Antardasha) within a Mahadasha."""
    planet = mahadasha["planet"]
    md_start = mahadasha["start"]
    md_years = mahadasha["years"]
    total_days = md_years * 365.25

    # Start order from the mahadasha planet
    start_pos = DASHA_ORDER.index(planet)
    antardashas = []

    current_start = md_start
    for i in range(9):
        sub_planet = DASHA_ORDER[(start_pos + i) % 9]
        sub_years = (DASHA_YEARS[sub_planet] / 120.0) * md_years
        sub_end = current_start + timedelta(days=sub_years * 365.25)
        antardashas.append({
            "mahadasha_planet": planet,
            "antardasha_planet": sub_planet,
            "antardasha_tr": DASHA_TR[sub_planet],
            "start": current_start,
            "end": sub_end,
            "years": round(sub_years, 2),
            "marriage_note": MARRIAGE_DASHA.get(sub_planet, ""),
        })
        current_start = sub_end

    return antardashas


def get_current_dasha(dashas: List[Dict], now: datetime = None) -> Tuple[Dict, int]:
    """Find the current active dasha. Returns (dasha, index)."""
    if now is None:
        now = datetime.now(pytz.utc)
    if now.tzinfo is None:
        now = pytz.utc.localize(now)

    for i, d in enumerate(dashas):
        start = d["start"] if d["start"].tzinfo else pytz.utc.localize(d["start"])
        end = d["end"] if d["end"].tzinfo else pytz.utc.localize(d["end"])
        now_aware = now.astimezone(pytz.utc)
        start_aware = start.astimezone(pytz.utc)
        end_aware = end.astimezone(pytz.utc)
        if start_aware <= now_aware < end_aware:
            return d, i
    return dashas[-1], len(dashas) - 1


def get_upcoming_venus_jupiter_dashas(dashas: List[Dict],
                                      from_dt: datetime = None) -> List[Dict]:
    """Find upcoming Venus or Jupiter mahadashas (key for marriage)."""
    if from_dt is None:
        from_dt = datetime.now(pytz.utc)
    if from_dt.tzinfo is None:
        from_dt = pytz.utc.localize(from_dt)

    upcoming = []
    for d in dashas:
        end = d["end"] if d["end"].tzinfo else pytz.utc.localize(d["end"])
        if end > from_dt and d["planet"] in ("Venus", "Jupiter", "Moon"):
            upcoming.append(d)
    return upcoming[:5]


def nakshatra_summary(moon_lon_sidereal: float) -> str:
    """Return nakshatra info as string."""
    nak_name, nak_idx, rem = calc_nakshatra(moon_lon_sidereal)
    ruler = NAKSHATRA_RULERS[nak_idx]
    pada = int((moon_lon_sidereal % (360 / 27)) / (360 / 27 / 4)) + 1
    return f"{nak_name} (Yönetici: {ruler}, Pada: {pada})"
