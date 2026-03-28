"""
Solar Return, Lunar Return, Saturn Return charts.
"""
import swisseph as swe
from datetime import datetime
from typing import Dict, Optional
import pytz
from ..core.ephemeris import (
    get_planet_positions, get_houses, get_planet_in_house,
    get_all_aspects, degrees_to_sign, format_position,
    datetime_to_jd, jd_to_datetime
)


def find_solar_return(natal_jd: float, natal_sun_lon: float,
                      search_year: int, lat: float, lon: float) -> float:
    """Find the exact JD of the solar return for a given year."""
    swe.set_ephe_path("")
    y, m, d, h = swe.revjul(natal_jd)

    # Approximate start: same month/day in target year
    start_jd = swe.julday(search_year, m, d, 0) - 2

    # Iterate to find exact conjunction
    jd = start_jd
    for _ in range(500):
        try:
            sun, _ = swe.calc_ut(jd, swe.SUN)
            sun_lon = sun[0]
            diff = (sun_lon - natal_sun_lon) % 360
            if diff > 180:
                diff -= 360

            if abs(diff) < 0.005:
                return jd
            # Advance by fraction
            advance = diff / 360 * 365.25
            if abs(advance) < 0.0001:
                advance = 0.0001
            jd -= advance
        except Exception:
            jd += 0.01

    return jd  # Best approximation


class SolarReturnChart:
    """Solar Return — Sun returns to exact natal position each year."""

    def __init__(self, natal_chart, year: int,
                 location_lat: Optional[float] = None,
                 location_lon: Optional[float] = None):
        self.natal = natal_chart
        self.year = year
        self.lat = location_lat or natal_chart.person["birth_lat"]
        self.lon = location_lon or natal_chart.person["birth_lon"]

        natal_sun_lon = natal_chart.positions["SUN"]["lon"]
        self.sr_jd = find_solar_return(natal_chart.jd, natal_sun_lon, year,
                                       self.lat, self.lon)
        self.sr_date = jd_to_datetime(self.sr_jd)
        self.positions = get_planet_positions(self.sr_jd, self.lat, self.lon)
        self.houses = get_houses(self.sr_jd, self.lat, self.lon)
        self.aspects = get_all_aspects(self.positions)
        self._assign_houses()

    def _assign_houses(self):
        for p, d in self.positions.items():
            d["house"] = get_planet_in_house(d["lon"], self.houses["cusps"])

    def get_7th_house_planets(self) -> list:
        return [p for p, d in self.positions.items() if d.get("house") == 7]

    def get_sr_asc_sign(self) -> str:
        return degrees_to_sign(self.houses["ASC"])[0]

    def marriage_indicators(self) -> list:
        """Key marriage indicators in this solar return."""
        indicators = []
        h7_planets = self.get_7th_house_planets()
        if h7_planets:
            indicators.append(f"7. Evde gezegen(ler): {', '.join(h7_planets)}")
        if "VENUS" in self.positions and self.positions["VENUS"]["house"] == 7:
            indicators.append("SR Venüs 7. Ev — Güçlü evlilik/ilişki yılı!")
        if "JUPITER" in self.positions and self.positions["JUPITER"]["house"] in (7, 1, 5):
            indicators.append(f"SR Jüpiter {self.positions['JUPITER']['house']}. Ev — Şans ve genişleme")
        asc_sign = self.get_sr_asc_sign()
        if asc_sign in ("Libra", "Taurus"):
            indicators.append(f"SR Yükselen {asc_sign} — Venüs enerjisi güçlü, ilişki odaklı yıl")
        return indicators

    def summary(self) -> str:
        lines = []
        lines.append(f"═══ GÜNEŞ DÖNÜŞÜ (SOLAR RETURN) {self.year} — {self.natal.person['short']} ═══")
        lines.append(f"SR Tarihi: {self.sr_date.strftime('%d.%m.%Y %H:%M')} UTC")
        lines.append(f"SR Konumu: {self.lat:.2f}°N, {self.lon:.2f}°E")
        lines.append(f"SR Yükselen: {format_position(self.houses['ASC'])}")
        lines.append(f"SR MC: {format_position(self.houses['MC'])}")
        lines.append("")
        lines.append("— SR Gezegenler ve Evler —")
        for p in ["SUN", "MOON", "VENUS", "MARS", "JUPITER", "SATURN", "NORTH_NODE"]:
            if p in self.positions:
                d = self.positions[p]
                lines.append(f"  {p:12s}: {d['formatted']} [{d['house']}. Ev]")
        lines.append("")
        indicators = self.marriage_indicators()
        if indicators:
            lines.append("★ Evlilik/Teklif Göstergeleri:")
            for ind in indicators:
                lines.append(f"  • {ind}")
        return "\n".join(lines)


class LunarReturnChart:
    """Lunar Return — Moon returns to natal position each ~27.3 days."""

    def __init__(self, natal_chart, search_from_jd: Optional[float] = None,
                 location_lat: Optional[float] = None,
                 location_lon: Optional[float] = None):
        self.natal = natal_chart
        self.lat = location_lat or natal_chart.person["birth_lat"]
        self.lon = location_lon or natal_chart.person["birth_lon"]

        natal_moon_lon = natal_chart.positions["MOON"]["lon"]
        from ..core.ephemeris import current_jd
        start_jd = search_from_jd or current_jd()
        self.lr_jd = self._find_lunar_return(natal_moon_lon, start_jd)
        self.lr_date = jd_to_datetime(self.lr_jd)
        self.positions = get_planet_positions(self.lr_jd, self.lat, self.lon)
        self.houses = get_houses(self.lr_jd, self.lat, self.lon)
        self._assign_houses()

    def _find_lunar_return(self, natal_moon_lon: float, start_jd: float) -> float:
        swe.set_ephe_path("")  # Use built-in Moshier ephemeris
        jd = start_jd
        best_jd = start_jd
        best_diff = 999.0

        for _ in range(100):
            try:
                moon, _ = swe.calc_ut(jd, swe.MOON)
                moon_lon = moon[0]
                diff = (moon_lon - natal_moon_lon) % 360
                if diff > 180:
                    diff -= 360
                abs_diff = abs(diff)
                if abs_diff < best_diff:
                    best_diff = abs_diff
                    best_jd = jd
                if abs_diff < 0.3:
                    return jd
                advance = diff / 13.176  # Moon moves ~13.176°/day
                if abs(advance) < 0.01:
                    advance = 0.1 if diff > 0 else -0.1
                jd -= advance
                # Safety check: don't go backwards too far
                if jd < start_jd - 30 or jd > start_jd + 30:
                    break
            except Exception:
                jd += 1

        return best_jd if best_jd > 2000000 else start_jd

    def _assign_houses(self):
        for p, d in self.positions.items():
            d["house"] = get_planet_in_house(d["lon"], self.houses["cusps"])

    def summary(self) -> str:
        lines = []
        lines.append(f"═══ AY DÖNÜŞÜ (LUNAR RETURN) — {self.natal.person['short']} ═══")
        lines.append(f"LR Tarihi: {self.lr_date.strftime('%d.%m.%Y %H:%M')} UTC")
        lines.append(f"LR Yükselen: {format_position(self.houses['ASC'])}")
        lines.append("")
        for p in ["MOON", "VENUS", "JUPITER", "SUN", "MARS"]:
            if p in self.positions:
                d = self.positions[p]
                lines.append(f"  {p:12s}: {d['formatted']} [{d['house']}. Ev]")
        h7 = [p for p, d in self.positions.items() if d.get("house") == 7]
        if h7:
            lines.append(f"\n★ Bu Ay Döngüsünde 7. Evde: {', '.join(h7)}")
        return "\n".join(lines)
