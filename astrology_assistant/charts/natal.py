"""
Natal Chart — Full Western natal chart calculation.
Includes planets, houses (Placidus + Whole Sign), aspects, dignities,
dominant elements/modalities, chart patterns.
"""
from typing import Dict, List
from ..core.ephemeris import (
    parse_birth_dt, get_planet_positions, get_houses,
    get_planet_in_house, get_all_aspects, planet_dignity,
    sign_ruler, modern_ruler, degrees_to_sign, format_position,
    ZODIAC_SIGNS
)

ELEMENTS = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water",
}

MODALITIES = {
    "Aries": "Cardinal", "Cancer": "Cardinal", "Libra": "Cardinal", "Capricorn": "Cardinal",
    "Taurus": "Fixed", "Leo": "Fixed", "Scorpio": "Fixed", "Aquarius": "Fixed",
    "Gemini": "Mutable", "Virgo": "Mutable", "Sagittarius": "Mutable", "Pisces": "Mutable",
}

ELEMENT_TR = {"Fire": "Ateş", "Earth": "Toprak", "Air": "Hava", "Water": "Su"}
MODALITY_TR = {"Cardinal": "Öncü", "Fixed": "Sabit", "Mutable": "Değişken"}


class NatalChart:
    """Complete Western natal chart."""

    def __init__(self, person: Dict, house_system: str = "P"):
        self.person = person
        self.house_system = house_system
        self.name = person["name"]

        self.dt, self.jd = parse_birth_dt(
            person["birth_date"], person["birth_time"], person["timezone"]
        )

        self.positions = get_planet_positions(
            self.jd, person["birth_lat"], person["birth_lon"]
        )
        self.houses = get_houses(
            self.jd, person["birth_lat"], person["birth_lon"], house_system
        )

        # Also compute Whole Sign houses
        self.houses_ws = get_houses(
            self.jd, person["birth_lat"], person["birth_lon"], "W"
        )

        self.aspects = get_all_aspects(self.positions)
        self._assign_houses()
        self._calc_dominant()

    def _assign_houses(self):
        """Assign each planet to its house."""
        for pname, pdata in self.positions.items():
            pdata["house"] = get_planet_in_house(
                pdata["lon"], self.houses["cusps"]
            )

    def _calc_dominant(self):
        """Calculate dominant elements and modalities."""
        elem_count = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
        mod_count = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}

        # Weight: Sun(3), Moon(3), ASC(3), others(1)
        weights = {"SUN": 3, "MOON": 3, "MERCURY": 1, "VENUS": 1,
                   "MARS": 1, "JUPITER": 1, "SATURN": 1}

        for p, w in weights.items():
            if p in self.positions:
                sign = self.positions[p]["sign"]
                elem_count[ELEMENTS[sign]] += w
                mod_count[MODALITIES[sign]] += w

        # ASC
        asc_lon = self.houses["ASC"]
        asc_sign, _, _ = degrees_to_sign(asc_lon)
        elem_count[ELEMENTS[asc_sign]] += 3
        mod_count[MODALITIES[asc_sign]] += 3

        self.dominant_element = max(elem_count, key=elem_count.get)
        self.dominant_modality = max(mod_count, key=mod_count.get)
        self.element_counts = elem_count
        self.modality_counts = mod_count

        # ASC sign
        self.asc_sign = asc_sign
        self.mc_sign, _, _ = degrees_to_sign(self.houses["MC"])
        self.dsc_sign = ZODIAC_SIGNS[(ZODIAC_SIGNS.index(asc_sign) + 6) % 12]

    def get_sun_sign(self) -> str:
        return self.positions["SUN"]["sign"]

    def get_moon_sign(self) -> str:
        return self.positions["MOON"]["sign"]

    def get_rising_sign(self) -> str:
        return self.asc_sign

    def get_7th_house_ruler(self) -> str:
        """Return the ruling planet of the 7th house (marriage house)."""
        dsc_sign = self.dsc_sign
        return modern_ruler(dsc_sign)

    def get_venus_info(self) -> Dict:
        """Return Venus position details — key for love/marriage."""
        return self.positions.get("VENUS", {})

    def get_jupiter_info(self) -> Dict:
        return self.positions.get("JUPITER", {})

    def planet_house(self, planet: str) -> int:
        return self.positions.get(planet, {}).get("house", 0)

    def planets_in_house(self, house_num: int) -> List[str]:
        return [p for p, d in self.positions.items() if d.get("house") == house_num]

    def get_chart_ruler(self) -> str:
        """Return chart ruler (ruler of ASC sign)."""
        return modern_ruler(self.asc_sign)

    def summary(self) -> str:
        """Return a human-readable summary of the natal chart."""
        lines = []
        lines.append(f"═══ {self.name} — Natal Chart ═══")
        lines.append(f"Doğum: {self.person['birth_date']} {self.person['birth_time']}, "
                     f"{self.person['birth_city']}, {self.person['birth_country']}")
        lines.append("")
        lines.append(f"☉ Güneş: {self.positions['SUN']['formatted']} "
                     f"[{self.positions['SUN']['house']}. Ev]")
        lines.append(f"☽ Ay: {self.positions['MOON']['formatted']} "
                     f"[{self.positions['MOON']['house']}. Ev]")
        lines.append(f"↑ Yükselen (ASC): {format_position(self.houses['ASC'])}")
        lines.append(f"MC: {format_position(self.houses['MC'])}")
        lines.append(f"DSC (7. Ev başı): {format_position(self.houses['DSC'])}")
        lines.append("")
        lines.append("— Gezegenler —")
        planet_order = ["MERCURY", "VENUS", "MARS", "JUPITER", "SATURN",
                        "URANUS", "NEPTUNE", "PLUTO", "NORTH_NODE", "CHIRON", "LILITH"]
        symbols = {
            "MERCURY": "☿", "VENUS": "♀", "MARS": "♂", "JUPITER": "♃",
            "SATURN": "♄", "URANUS": "♅", "NEPTUNE": "♆", "PLUTO": "♇",
            "NORTH_NODE": "☊", "CHIRON": "⚷", "LILITH": "⚸",
        }
        for p in planet_order:
            if p in self.positions:
                pdata = self.positions[p]
                retro = " ℞" if pdata["retrograde"] else ""
                dignity = planet_dignity(p, pdata["sign"])
                dstr = f" [{dignity}]" if dignity else ""
                lines.append(f"  {symbols.get(p, p):2s} {p:12s}: "
                              f"{pdata['formatted']}{retro} "
                              f"[{pdata['house']}. Ev]{dstr}")
        lines.append("")
        lines.append(f"Dominant Element: {self.dominant_element} ({ELEMENT_TR[self.dominant_element]})")
        lines.append(f"Dominant Modality: {self.dominant_modality} ({MODALITY_TR[self.dominant_modality]})")
        lines.append(f"7. Ev Yöneticisi (Evlilik): {self.get_7th_house_ruler()}")
        lines.append(f"Harita Yöneticisi: {self.get_chart_ruler()}")
        return "\n".join(lines)
