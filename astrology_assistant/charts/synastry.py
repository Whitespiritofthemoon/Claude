"""
Synastry, Composite, Davison Relationship Charts.
"""
import math
from datetime import datetime
from typing import Dict, List, Tuple
import pytz
from ..core.ephemeris import (
    parse_birth_dt, get_planet_positions, get_houses,
    get_all_aspects, calc_aspect, get_planet_in_house,
    degrees_to_sign, format_position, datetime_to_jd, jd_to_datetime, current_jd
)

# Aspect weights for compatibility scoring
ASPECT_SCORES = {
    "Conjunction": 10, "Trine": 8, "Sextile": 6,
    "Square": -5, "Opposition": -4, "Quincunx": -2,
    "Semi-Sextile": 2, "Semi-Square": -1, "Sesquiquadrate": -1,
}

# Key synastry planet pairs for love/marriage
LOVE_PAIRS = [
    ("VENUS", "MARS"), ("VENUS", "JUPITER"), ("VENUS", "MOON"),
    ("VENUS", "VENUS"), ("VENUS", "SUN"), ("SUN", "MOON"),
    ("MOON", "MOON"), ("JUPITER", "SUN"), ("JUPITER", "MOON"),
    ("VENUS", "ASC"), ("MARS", "ASC"), ("SUN", "ASC"),
    ("VENUS", "NORTH_NODE"), ("MOON", "NORTH_NODE"),
    ("SUN", "NORTH_NODE"), ("JUNO", "JUNO"),
]

MARRIAGE_PAIRS = [
    ("VENUS", "SATURN"),   # commitment, long-term
    ("JUNO", "SUN"), ("JUNO", "MOON"), ("JUNO", "VENUS"), ("JUNO", "MARS"),
    ("VERTEX", "VENUS"), ("VERTEX", "SUN"), ("VERTEX", "MOON"),
    ("SATURN", "MOON"),    # security, long-term
    ("NORTH_NODE", "VENUS"),
]


class SynastryChart:
    """Bi-wheel synastry analysis between two natal charts."""

    def __init__(self, chart_a, chart_b):
        self.chart_a = chart_a
        self.chart_b = chart_b
        self.aspects = self._calc_synastry_aspects()
        self.score = self._calc_compatibility_score()

    def _calc_synastry_aspects(self) -> List[Dict]:
        """Calculate cross-chart aspects (A's planets vs B's planets)."""
        aspects = []
        pos_a = self.chart_a.positions
        pos_b = self.chart_b.positions

        # Include angles
        angles_a = {
            "ASC": self.chart_a.houses["ASC"],
            "MC": self.chart_a.houses["MC"],
            "DSC": self.chart_a.houses["DSC"],
            "IC": self.chart_a.houses["IC"],
        }
        angles_b = {
            "ASC": self.chart_b.houses["ASC"],
            "MC": self.chart_b.houses["MC"],
            "DSC": self.chart_b.houses["DSC"],
            "IC": self.chart_b.houses["IC"],
        }

        for pa_name, pa_data in pos_a.items():
            for pb_name, pb_data in pos_b.items():
                orb, asp_name, _ = calc_aspect(pa_data["lon"], pb_data["lon"])
                if asp_name:
                    aspects.append({
                        "planet_a": pa_name,
                        "planet_b": pb_name,
                        "aspect": asp_name,
                        "orb": orb,
                        "lon_a": pa_data["lon"],
                        "lon_b": pb_data["lon"],
                        "is_love": (pa_name, pb_name) in LOVE_PAIRS or (pb_name, pa_name) in LOVE_PAIRS,
                        "is_marriage": (pa_name, pb_name) in MARRIAGE_PAIRS or (pb_name, pa_name) in MARRIAGE_PAIRS,
                    })

        # A planets vs B angles
        for pa_name, pa_data in pos_a.items():
            for angle_name, angle_lon in angles_b.items():
                orb, asp_name, _ = calc_aspect(pa_data["lon"], angle_lon)
                if asp_name and orb <= 3.0:
                    aspects.append({
                        "planet_a": pa_name,
                        "planet_b": f"B_{angle_name}",
                        "aspect": asp_name,
                        "orb": orb,
                        "lon_a": pa_data["lon"],
                        "lon_b": angle_lon,
                        "is_love": True,
                        "is_marriage": angle_name == "DSC",
                    })

        # B planets vs A angles
        for pb_name, pb_data in pos_b.items():
            for angle_name, angle_lon in angles_a.items():
                orb, asp_name, _ = calc_aspect(pb_data["lon"], angle_lon)
                if asp_name and orb <= 3.0:
                    aspects.append({
                        "planet_a": f"A_{angle_name}",
                        "planet_b": pb_name,
                        "aspect": asp_name,
                        "orb": orb,
                        "lon_a": angle_lon,
                        "lon_b": pb_data["lon"],
                        "is_love": True,
                        "is_marriage": angle_name == "DSC",
                    })

        return aspects

    def _calc_compatibility_score(self) -> Dict:
        """Calculate overall compatibility score."""
        total = 0
        love_score = 0
        marriage_score = 0

        for asp in self.aspects:
            score = ASPECT_SCORES.get(asp["aspect"], 0)
            total += score
            if asp["is_love"]:
                love_score += score
            if asp["is_marriage"]:
                marriage_score += score

        return {
            "total": total,
            "love": love_score,
            "marriage": marriage_score,
            "rating": self._rating(total),
        }

    def _rating(self, score: int) -> str:
        if score >= 80: return "Mükemmel ⭐⭐⭐⭐⭐"
        if score >= 60: return "Çok İyi ⭐⭐⭐⭐"
        if score >= 40: return "İyi ⭐⭐⭐"
        if score >= 20: return "Orta ⭐⭐"
        return "Zor ⭐"

    def get_marriage_aspects(self) -> List[Dict]:
        return [a for a in self.aspects if a["is_marriage"]]

    def get_love_aspects(self) -> List[Dict]:
        return [a for a in self.aspects if a["is_love"]]

    def summary(self) -> str:
        lines = []
        a = self.chart_a.person["short"]
        b = self.chart_b.person["short"]
        lines.append(f"═══ SYNASTRİ: {a} × {b} ═══")
        lines.append(f"Toplam Uyum Puanı: {self.score['total']} — {self.score['rating']}")
        lines.append(f"Aşk Puanı: {self.score['love']}  |  Evlilik Puanı: {self.score['marriage']}")
        lines.append("")

        # Key love aspects
        love_aspects = [a for a in self.aspects if a["is_love"]][:15]
        if love_aspects:
            lines.append("— Aşk & Çekim Açıları —")
            for asp in love_aspects:
                pa = asp["planet_a"]
                pb = asp["planet_b"]
                lines.append(f"  {a}:{pa} {asp['aspect']} {b}:{pb}  (orb: {asp['orb']:.1f}°)")

        lines.append("")
        marriage_aspects = [a for a in self.aspects if a["is_marriage"]]
        if marriage_aspects:
            lines.append("— Evlilik / Bağlılık Açıları —")
            for asp in marriage_aspects:
                pa = asp["planet_a"]
                pb = asp["planet_b"]
                lines.append(f"  {a}:{pa} {asp['aspect']} {b}:{pb}  (orb: {asp['orb']:.1f}°)")

        return "\n".join(lines)


class CompositeChart:
    """Composite chart — midpoint method between two natal charts."""

    def __init__(self, chart_a, chart_b):
        self.chart_a = chart_a
        self.chart_b = chart_b
        self.positions = self._calc_composite_positions()
        self.aspects = get_all_aspects(self.positions)

    def _midpoint(self, lon1: float, lon2: float) -> float:
        """Calculate the shorter arc midpoint."""
        diff = (lon2 - lon1) % 360
        if diff > 180:
            mid = (lon1 + lon2 + 360) / 2
        else:
            mid = (lon1 + lon2) / 2
        return mid % 360

    def _calc_composite_positions(self) -> Dict:
        """Average all planet positions between two charts."""
        pos_a = self.chart_a.positions
        pos_b = self.chart_b.positions
        composite = {}

        for planet in pos_a:
            if planet in pos_b:
                mid_lon = self._midpoint(pos_a[planet]["lon"], pos_b[planet]["lon"])
                sign, deg, sidx = degrees_to_sign(mid_lon)
                composite[planet] = {
                    "lon": mid_lon,
                    "lat": (pos_a[planet]["lat"] + pos_b[planet]["lat"]) / 2,
                    "speed": 0,
                    "sign": sign,
                    "sign_idx": sidx,
                    "deg_in_sign": deg,
                    "retrograde": False,
                    "formatted": format_position(mid_lon),
                    "house": 0,
                }

        return composite

    def summary(self) -> str:
        lines = []
        a = self.chart_a.person["short"]
        b = self.chart_b.person["short"]
        lines.append(f"═══ KOMPOZİT HARITA: {a} + {b} ═══")
        lines.append("(İki kişinin gezegenlerinin orta noktası — ilişkinin ruhu)")
        lines.append("")
        key_planets = ["SUN", "MOON", "VENUS", "MARS", "JUPITER", "SATURN", "NORTH_NODE"]
        for p in key_planets:
            if p in self.positions:
                lines.append(f"  {p:12s}: {self.positions[p]['formatted']}")
        lines.append("")
        lines.append("— Kompozit Açılar (Seçilmiş) —")
        key_aspects = [a for a in self.aspects
                       if a["planet1"] in ("VENUS", "SUN", "MOON", "JUPITER")
                       or a["planet2"] in ("VENUS", "SUN", "MOON", "JUPITER")][:10]
        for asp in key_aspects:
            lines.append(f"  {asp['planet1']} {asp['aspect']} {asp['planet2']}  (orb: {asp['orb']:.1f}°)")
        return "\n".join(lines)


class DavisonChart:
    """
    Davison Relationship Chart — calculated from the exact midpoint in time
    and space between two people's births.
    """

    def __init__(self, chart_a, chart_b):
        self.chart_a = chart_a
        self.chart_b = chart_b
        self.jd, self.lat, self.lon = self._calc_davison_params()
        self.positions = get_planet_positions(self.jd, self.lat, self.lon)
        self.houses = get_houses(self.jd, self.lat, self.lon)
        self.aspects = get_all_aspects(self.positions)
        self._assign_houses()

    def _assign_houses(self):
        for p, d in self.positions.items():
            d["house"] = get_planet_in_house(d["lon"], self.houses["cusps"])

    def _calc_davison_params(self) -> Tuple[float, float, float]:
        jd_mid = (self.chart_a.jd + self.chart_b.jd) / 2
        lat_mid = (self.chart_a.person["birth_lat"] + self.chart_b.person["birth_lat"]) / 2
        lon_mid = (self.chart_a.person["birth_lon"] + self.chart_b.person["birth_lon"]) / 2
        return jd_mid, lat_mid, lon_mid

    def summary(self) -> str:
        lines = []
        a = self.chart_a.person["short"]
        b = self.chart_b.person["short"]
        mid_dt = jd_to_datetime(self.jd)
        lines.append(f"═══ DAVİSON İLİŞKİ HARİTASI: {a} + {b} ═══")
        lines.append(f"Ortalama Zaman: {mid_dt.strftime('%d.%m.%Y %H:%M')} UTC")
        lines.append(f"Ortalama Konum: Lat {self.lat:.2f}°, Lon {self.lon:.2f}°")
        lines.append("")
        lines.append("— Anahtar Gezegenler —")
        key_planets = ["SUN", "MOON", "VENUS", "MARS", "JUPITER", "SATURN", "NORTH_NODE"]
        for p in key_planets:
            if p in self.positions:
                pdata = self.positions[p]
                lines.append(f"  {p:12s}: {pdata['formatted']} [{pdata['house']}. Ev]")
        lines.append(f"\n  ASC: {format_position(self.houses['ASC'])}")
        lines.append(f"  MC:  {format_position(self.houses['MC'])}")
        return "\n".join(lines)
