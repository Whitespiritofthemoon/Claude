"""
Core Ephemeris Engine — Swiss Ephemeris wrapper with full planet support.
Provides Julian Day conversion, planet positions, house cusps, aspects.
"""
import swisseph as swe
import math
from datetime import datetime, timezone
import pytz
from typing import Dict, List, Tuple, Optional

# ── Swiss Ephemeris planet constants ─────────────────────────────────────────
PLANETS = {
    "SUN":        swe.SUN,
    "MOON":       swe.MOON,
    "MERCURY":    swe.MERCURY,
    "VENUS":      swe.VENUS,
    "MARS":       swe.MARS,
    "JUPITER":    swe.JUPITER,
    "SATURN":     swe.SATURN,
    "URANUS":     swe.URANUS,
    "NEPTUNE":    swe.NEPTUNE,
    "PLUTO":      swe.PLUTO,
    "NORTH_NODE": swe.TRUE_NODE,
    "CHIRON":     swe.CHIRON,
    "JUNO":       swe.AST_OFFSET + 3,   # asteroid 3 = Juno
    "VESTA":      swe.AST_OFFSET + 4,
    "PALLAS":     swe.AST_OFFSET + 2,
    "CERES":      swe.AST_OFFSET + 1,
    "LILITH":     swe.MEAN_APOG,        # Mean Black Moon Lilith
}

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]


def set_ephemeris_path():
    """Set Swiss Ephemeris data path (uses built-in Moshier if not found)."""
    # Use empty string = Moshier built-in ephemeris (no files needed, accurate to ~1 arcsec)
    swe.set_ephe_path("")


def datetime_to_jd(dt: datetime, tz_name: str = "UTC") -> float:
    """Convert a naive or aware datetime + timezone name to Julian Day (UT)."""
    if dt.tzinfo is None:
        tz = pytz.timezone(tz_name)
        dt = tz.localize(dt)
    # Convert to UTC
    dt_utc = dt.astimezone(pytz.utc)
    # Julian day
    jd = swe.julday(
        dt_utc.year, dt_utc.month, dt_utc.day,
        dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
    )
    return jd


def parse_birth_dt(date_str: str, time_str: str, tz_name: str) -> Tuple[datetime, float]:
    """Parse 'DD.MM.YYYY' + 'HH:MM' strings into (datetime, jd)."""
    day, month, year = map(int, date_str.split("."))
    hour, minute = map(int, time_str.split(":"))
    dt = datetime(year, month, day, hour, minute)
    jd = datetime_to_jd(dt, tz_name)
    return dt, jd


def degrees_to_sign(lon: float) -> Tuple[str, float, int]:
    """Convert ecliptic longitude → (sign_name, degrees_in_sign, sign_index)."""
    lon = lon % 360.0
    sign_idx = int(lon // 30)
    deg_in_sign = lon % 30.0
    return ZODIAC_SIGNS[sign_idx], deg_in_sign, sign_idx


def format_position(lon: float) -> str:
    """Format longitude as '15°23' Taurus'."""
    sign, deg, _ = degrees_to_sign(lon)
    d = int(deg)
    m = int((deg - d) * 60)
    return f"{d:02d}°{m:02d}' {sign}"


def get_planet_positions(jd: float, lat: float, lon: float,
                         ayanamsa: Optional[str] = None) -> Dict:
    """
    Calculate all planet positions for given JD.
    Returns dict: planet_name -> {lon, lat, speed, sign, deg_in_sign, retrograde}
    If ayanamsa given (e.g. 'LAHIRI'), returns sidereal positions.
    """
    set_ephemeris_path()
    positions = {}

    if ayanamsa:
        swe.set_sid_mode(getattr(swe, f"SIDM_{ayanamsa}", swe.SIDM_LAHIRI))

    flags = swe.FLG_SWIEPH | swe.FLG_SPEED
    if ayanamsa:
        flags |= swe.FLG_SIDEREAL

    for name, planet_id in PLANETS.items():
        try:
            result, _ = swe.calc_ut(jd, planet_id, flags)
            ecl_lon = result[0]
            ecl_lat = result[1]
            speed = result[3]
            retrograde = speed < 0
            sign, deg_in_sign, sign_idx = degrees_to_sign(ecl_lon)
            positions[name] = {
                "lon": ecl_lon,
                "lat": ecl_lat,
                "speed": speed,
                "sign": sign,
                "sign_idx": sign_idx,
                "deg_in_sign": deg_in_sign,
                "retrograde": retrograde,
                "formatted": format_position(ecl_lon),
            }
        except Exception:
            pass  # Skip unavailable bodies

    # South Node = North Node + 180
    if "NORTH_NODE" in positions:
        nn_lon = positions["NORTH_NODE"]["lon"]
        sn_lon = (nn_lon + 180) % 360
        sign, deg, sidx = degrees_to_sign(sn_lon)
        positions["SOUTH_NODE"] = {
            "lon": sn_lon, "lat": 0, "speed": 0,
            "sign": sign, "sign_idx": sidx, "deg_in_sign": deg,
            "retrograde": False, "formatted": format_position(sn_lon),
        }

    if ayanamsa:
        swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY)   # reset
        swe.set_sid_mode(0)   # actually reset to tropical

    return positions


def get_houses(jd: float, lat: float, lon: float,
               system: str = "P", ayanamsa: Optional[str] = None) -> Dict:
    """
    Calculate house cusps and angles.
    system: 'P'=Placidus, 'K'=Koch, 'E'=Equal, 'W'=Whole Sign,
            'R'=Regiomontanus, 'C'=Campanus, 'O'=Porphyry, 'A'=Equal(AC)
    Returns dict with cusps[1..12], ASC, MC, DSC, IC.
    """
    set_ephemeris_path()

    if ayanamsa:
        swe.set_sid_mode(getattr(swe, f"SIDM_{ayanamsa}", swe.SIDM_LAHIRI))

    flags = swe.FLG_SIDEREAL if ayanamsa else 0

    try:
        cusps, angles = swe.houses_ex(jd, lat, lon, system.encode(), flags)
    except Exception:
        cusps, angles = swe.houses(jd, lat, lon, system.encode())
        angles = (angles[0], angles[1], angles[0], angles[1])  # ASC, MC only

    result = {
        "cusps": {i + 1: cusps[i] for i in range(12)},
        "ASC": angles[0],
        "MC":  angles[1],
        "DSC": (angles[0] + 180) % 360,
        "IC":  (angles[1] + 180) % 360,
        "ARMC": angles[2] if len(angles) > 2 else None,
        "Vertex": angles[3] if len(angles) > 3 else None,
    }

    if ayanamsa:
        swe.set_sid_mode(0)

    return result


def get_planet_in_house(planet_lon: float, cusps: Dict[int, float]) -> int:
    """Determine which house a planet falls in (Placidus/standard)."""
    # Normalize all to 0-360
    cusp_list = [(h, cusps[h] % 360) for h in range(1, 13)]

    for i in range(12):
        h_num, start = cusp_list[i]
        _, end = cusp_list[(i + 1) % 12]

        # Handle sign wraparound
        if start <= end:
            if start <= planet_lon % 360 < end:
                return h_num
        else:  # crosses 0°
            if planet_lon % 360 >= start or planet_lon % 360 < end:
                return h_num

    return 1  # fallback


def calc_aspect(lon1: float, lon2: float) -> Tuple[float, str, bool]:
    """
    Calculate aspect between two longitudes.
    Returns (orb, aspect_name, applying).
    """
    diff = abs(lon1 - lon2) % 360
    if diff > 180:
        diff = 360 - diff

    aspects = [
        (0,   "Conjunction",  8.0),
        (60,  "Sextile",      4.0),
        (90,  "Square",       7.0),
        (120, "Trine",        7.0),
        (150, "Quincunx",     3.0),
        (180, "Opposition",   8.0),
        (30,  "Semi-Sextile", 2.0),
        (45,  "Semi-Square",  2.0),
        (135, "Sesquiquadrate", 2.0),
        (72,  "Quintile",     1.5),
        (144, "Biquintile",   1.5),
    ]

    for angle, name, orb in aspects:
        if abs(diff - angle) <= orb:
            return round(abs(diff - angle), 2), name, False

    return None, None, False


def get_all_aspects(positions: Dict) -> List[Dict]:
    """Get all major aspects between planets."""
    planet_list = [k for k in positions if k not in ("SOUTH_NODE",)]
    aspects_found = []

    for i in range(len(planet_list)):
        for j in range(i + 1, len(planet_list)):
            p1, p2 = planet_list[i], planet_list[j]
            orb, name, applying = calc_aspect(positions[p1]["lon"], positions[p2]["lon"])
            if name:
                aspects_found.append({
                    "planet1": p1, "planet2": p2,
                    "aspect": name, "orb": orb,
                    "lon1": positions[p1]["lon"],
                    "lon2": positions[p2]["lon"],
                })

    return aspects_found


def ayanamsa_value(jd: float, mode: str = "LAHIRI") -> float:
    """Return current ayanamsa value in degrees."""
    swe.set_sid_mode(getattr(swe, f"SIDM_{mode}", swe.SIDM_LAHIRI))
    ayan = swe.get_ayanamsa_ut(jd)
    swe.set_sid_mode(0)
    return ayan


def tropical_to_sidereal(lon: float, jd: float, mode: str = "LAHIRI") -> float:
    """Convert tropical longitude to sidereal."""
    return (lon - ayanamsa_value(jd, mode)) % 360


def current_jd() -> float:
    """Julian Day for right now (UTC)."""
    now = datetime.now(pytz.utc)
    return swe.julday(now.year, now.month, now.day,
                      now.hour + now.minute / 60.0 + now.second / 3600.0)


def jd_to_datetime(jd: float) -> datetime:
    """Convert Julian Day back to UTC datetime."""
    y, m, d, h = swe.revjul(jd)
    hour = int(h)
    minute = int((h - hour) * 60)
    second = int(((h - hour) * 60 - minute) * 60)
    return datetime(y, m, d, hour, minute, second, tzinfo=pytz.utc)


def sign_ruler(sign: str) -> str:
    """Return traditional ruler of a sign."""
    rulers = {
        "Aries": "MARS", "Taurus": "VENUS", "Gemini": "MERCURY",
        "Cancer": "MOON", "Leo": "SUN", "Virgo": "MERCURY",
        "Libra": "VENUS", "Scorpio": "MARS", "Sagittarius": "JUPITER",
        "Capricorn": "SATURN", "Aquarius": "SATURN", "Pisces": "JUPITER",
    }
    return rulers.get(sign, "UNKNOWN")


def modern_ruler(sign: str) -> str:
    """Return modern ruler of a sign."""
    rulers = {
        "Aries": "MARS", "Taurus": "VENUS", "Gemini": "MERCURY",
        "Cancer": "MOON", "Leo": "SUN", "Virgo": "MERCURY",
        "Libra": "VENUS", "Scorpio": "PLUTO", "Sagittarius": "JUPITER",
        "Capricorn": "SATURN", "Aquarius": "URANUS", "Pisces": "NEPTUNE",
    }
    return rulers.get(sign, "UNKNOWN")


def planet_dignity(planet: str, sign: str) -> str:
    """Return planet's essential dignity in sign."""
    dignities = {
        "SUN":     {"Leo": "Domicile", "Aries": "Exaltation",
                    "Aquarius": "Detriment", "Libra": "Fall"},
        "MOON":    {"Cancer": "Domicile", "Taurus": "Exaltation",
                    "Capricorn": "Detriment", "Scorpio": "Fall"},
        "MERCURY": {"Gemini": "Domicile", "Virgo": "Domicile/Exaltation",
                    "Sagittarius": "Detriment", "Pisces": "Detriment/Fall"},
        "VENUS":   {"Taurus": "Domicile", "Libra": "Domicile", "Pisces": "Exaltation",
                    "Scorpio": "Detriment", "Aries": "Detriment", "Virgo": "Fall"},
        "MARS":    {"Aries": "Domicile", "Scorpio": "Domicile", "Capricorn": "Exaltation",
                    "Taurus": "Detriment", "Libra": "Detriment", "Cancer": "Fall"},
        "JUPITER": {"Sagittarius": "Domicile", "Pisces": "Domicile", "Cancer": "Exaltation",
                    "Gemini": "Detriment", "Virgo": "Detriment", "Capricorn": "Fall"},
        "SATURN":  {"Capricorn": "Domicile", "Aquarius": "Domicile", "Libra": "Exaltation",
                    "Cancer": "Detriment", "Leo": "Detriment", "Aries": "Fall"},
    }
    return dignities.get(planet, {}).get(sign, "")
