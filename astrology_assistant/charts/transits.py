"""
Transit Chart — Current transits to natal chart.
Includes: transit-to-natal aspects, transit planets in natal houses,
transit Full/New Moons, transit eclipses, annual transit calendar.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pytz
import swisseph as swe
from ..core.ephemeris import (
    current_jd, get_planet_positions, get_houses,
    get_planet_in_house, calc_aspect, degrees_to_sign,
    format_position, datetime_to_jd, jd_to_datetime, PLANETS
)

TRANSIT_ORB = {
    "SUN": 3.0, "MOON": 2.0, "MERCURY": 2.0, "VENUS": 2.0,
    "MARS": 3.0, "JUPITER": 4.0, "SATURN": 4.0,
    "URANUS": 3.0, "NEPTUNE": 3.0, "PLUTO": 3.0,
    "NORTH_NODE": 3.0, "CHIRON": 3.0,
}

# Planets with major life influence
MAJOR_PLANETS = ["JUPITER", "SATURN", "URANUS", "NEPTUNE", "PLUTO", "NORTH_NODE"]
PERSONAL_PLANETS = ["SUN", "MOON", "VENUS", "MARS", "MERCURY"]

# Positive transit keywords
POSITIVE_ASPECTS = ["Conjunction", "Trine", "Sextile"]
CHALLENGING_ASPECTS = ["Square", "Opposition"]


class TransitChart:
    """Transit chart overlaid on a natal chart."""

    def __init__(self, natal_chart, jd: Optional[float] = None,
                 lat: Optional[float] = None, lon: Optional[float] = None):
        self.natal = natal_chart
        self.jd = jd or current_jd()
        self.lat = lat or natal_chart.person["birth_lat"]
        self.lon = lon or natal_chart.person["birth_lon"]

        self.transit_positions = get_planet_positions(self.jd, self.lat, self.lon)
        self.transit_houses = get_houses(self.jd, self.lat, self.lon)
        self.aspects = self._calc_transit_aspects()
        self._assign_transit_houses()

    def _assign_transit_houses(self):
        """Determine which natal house each transiting planet occupies."""
        for p, d in self.transit_positions.items():
            d["natal_house"] = get_planet_in_house(
                d["lon"], self.natal.houses["cusps"]
            )

    def _calc_transit_aspects(self) -> List[Dict]:
        """Calculate aspects from transiting planets to natal planets."""
        aspects = []
        natal_points = dict(self.natal.positions)
        # Add natal angles
        natal_points["NATAL_ASC"] = {"lon": self.natal.houses["ASC"]}
        natal_points["NATAL_MC"] = {"lon": self.natal.houses["MC"]}
        natal_points["NATAL_DSC"] = {"lon": self.natal.houses["DSC"]}

        for t_name, t_data in self.transit_positions.items():
            max_orb = TRANSIT_ORB.get(t_name, 2.0)
            for n_name, n_data in natal_points.items():
                orb, asp_name, _ = calc_aspect(t_data["lon"], n_data["lon"])
                if asp_name and orb <= max_orb:
                    aspects.append({
                        "transit_planet": t_name,
                        "natal_point": n_name,
                        "aspect": asp_name,
                        "orb": orb,
                        "transit_lon": t_data["lon"],
                        "natal_lon": n_data["lon"],
                        "is_positive": asp_name in POSITIVE_ASPECTS,
                        "is_major": t_name in MAJOR_PLANETS,
                        "transit_retro": t_data.get("retrograde", False),
                    })

        return sorted(aspects, key=lambda x: (0 if x["is_major"] else 1, x["orb"]))

    def get_7th_house_transits(self) -> List[Dict]:
        """Planets currently transiting the 7th house (marriage house)."""
        return [p for p, d in self.transit_positions.items()
                if d.get("natal_house") == 7]

    def get_venus_jupiter_aspects(self) -> List[Dict]:
        """Key love/luck transits involving Venus and Jupiter."""
        return [a for a in self.aspects
                if a["transit_planet"] in ("VENUS", "JUPITER")
                or a["natal_point"] in ("VENUS", "JUPITER")]

    def get_marriage_transits(self) -> List[Dict]:
        """Transits most relevant to marriage timing."""
        marriage_indicators = []

        for a in self.aspects:
            score = 0
            tp = a["transit_planet"]
            np = a["natal_point"]

            # Jupiter transiting natal Venus/7th cusp/DSC/natal Jupiter
            if tp == "JUPITER" and np in ("VENUS", "NATAL_DSC", "JUPITER"):
                score += 10
            if tp == "JUPITER" and np == "NORTH_NODE":
                score += 8
            if tp == "VENUS" and np in ("NATAL_DSC", "JUPITER") and a["is_positive"]:
                score += 6
            # Saturn to natal Venus/7th — commitment
            if tp == "SATURN" and np in ("VENUS", "NATAL_DSC") and a["is_positive"]:
                score += 8
            if tp == "NORTH_NODE" and np in ("VENUS", "NATAL_DSC"):
                score += 7
            # Transiting planets through 7th house
            if self.transit_positions.get(tp, {}).get("natal_house") == 7:
                score += 3

            if score > 0:
                a["marriage_score"] = score
                marriage_indicators.append(a)

        return sorted(marriage_indicators, key=lambda x: -x["marriage_score"])

    def summary(self) -> str:
        now_dt = jd_to_datetime(self.jd)
        lines = []
        lines.append(f"═══ TRANZİT HARİTA — {self.natal.person['short']} ═══")
        lines.append(f"Tarih: {now_dt.strftime('%d.%m.%Y %H:%M')} UTC")
        lines.append("")

        # Planets in 7th house
        h7 = self.get_7th_house_transits()
        if h7:
            lines.append(f"⚡ 7. Evde (Evlilik Evi) Tranzit Gezegenler: {', '.join(h7)}")
            lines.append("")

        lines.append("— Önemli Tranzit Açıları —")
        shown = 0
        for asp in self.aspects:
            if shown >= 20:
                break
            retro = " ℞" if asp["transit_retro"] else ""
            sign = "+" if asp["is_positive"] else "-"
            lines.append(f"  {sign} Tranzit {asp['transit_planet']}{retro} "
                         f"{asp['aspect']} Natal {asp['natal_point']}  "
                         f"(orb: {asp['orb']:.1f}°)")
            shown += 1

        marriage_t = self.get_marriage_transits()
        if marriage_t:
            lines.append("")
            lines.append("— Evlilik/Teklif Göstergeleri (Tranzit) —")
            for a in marriage_t[:8]:
                lines.append(f"  ★ Tranzit {a['transit_planet']} "
                              f"{a['aspect']} Natal {a['natal_point']}  "
                              f"(skor: {a.get('marriage_score', 0)}, orb: {a['orb']:.1f}°)")

        return "\n".join(lines)


def find_jupiter_venus_conjunctions(start_jd: float, end_jd: float) -> List[Dict]:
    """Find dates when transiting Jupiter conjuncts natal Venus."""
    events = []
    step = 1.0  # 1 day steps
    jd = start_jd
    while jd < end_jd:
        jup, _ = swe.calc_ut(jd, swe.JUPITER)
        jup_lon = jup[0]
        events.append((jd, jup_lon))
        jd += step
    return events


def find_new_full_moons(start_jd: float, months: int = 12) -> List[Dict]:
    """Find New and Full Moons within a period."""
    moons = []
    jd = start_jd
    end_jd = start_jd + months * 29.5

    while jd < end_jd:
        sun, _ = swe.calc_ut(jd, swe.SUN)
        moon, _ = swe.calc_ut(jd, swe.MOON)
        sun_lon = sun[0]
        moon_lon = moon[0]
        diff = (moon_lon - sun_lon) % 360

        if diff < 2:  # New Moon
            moons.append({"type": "Yeni Ay", "jd": jd,
                         "date": jd_to_datetime(jd),
                         "sign": degrees_to_sign(sun_lon)[0],
                         "lon": sun_lon})
        elif abs(diff - 180) < 2:  # Full Moon
            moons.append({"type": "Dolunay", "jd": jd,
                         "date": jd_to_datetime(jd),
                         "sign": degrees_to_sign(moon_lon)[0],
                         "lon": moon_lon})

        jd += 1  # Step 1 day

    return moons


def find_eclipses(start_jd: float, months: int = 24) -> List[Dict]:
    """Find solar and lunar eclipses."""
    eclipses = []
    jd = start_jd
    end_jd = start_jd + months * 29.5

    while jd < end_jd:
        # Check for solar eclipse
        ret_solar = swe.sol_eclipse_when_glob(jd, swe.FLG_SWIEPH)
        if ret_solar[1][0] > jd:
            ecl_jd = ret_solar[1][0]
            sun, _ = swe.calc_ut(ecl_jd, swe.SUN)
            sign, deg, _ = degrees_to_sign(sun[0])
            eclipses.append({
                "type": "Güneş Tutulması",
                "jd": ecl_jd,
                "date": jd_to_datetime(ecl_jd),
                "sign": sign,
                "lon": sun[0],
            })
            jd = ecl_jd + 5
        else:
            jd += 15

        if len(eclipses) >= 12:
            break

    return eclipses


class ProgressedChart:
    """Secondary progressions (1 day = 1 year)."""

    def __init__(self, natal_chart, target_date: Optional[datetime] = None):
        self.natal = natal_chart
        self.target_date = target_date or datetime.now(pytz.utc)

        # Age = years since birth
        birth_year = natal_chart.dt.year
        birth_month = natal_chart.dt.month
        birth_day = natal_chart.dt.day
        birth_tz = pytz.timezone(natal_chart.person["timezone"])
        birth_dt = birth_tz.localize(natal_chart.dt.replace(tzinfo=None)) if natal_chart.dt.tzinfo is None else natal_chart.dt

        age_days = (self.target_date.replace(tzinfo=pytz.utc) - birth_dt.astimezone(pytz.utc)).days / 365.25

        # Progressed JD = natal JD + age in days
        self.prog_jd = natal_chart.jd + age_days

        self.positions = get_planet_positions(
            self.prog_jd,
            natal_chart.person["birth_lat"],
            natal_chart.person["birth_lon"]
        )
        self.houses = get_houses(
            self.prog_jd,
            natal_chart.person["birth_lat"],
            natal_chart.person["birth_lon"]
        )
        self.aspects_to_natal = self._calc_prog_aspects()

    def _calc_prog_aspects(self) -> List[Dict]:
        aspects = []
        for p_name, p_data in self.positions.items():
            for n_name, n_data in self.natal.positions.items():
                orb, asp_name, _ = calc_aspect(p_data["lon"], n_data["lon"])
                if asp_name and orb <= 2.0:  # Tight orbs for progressions
                    aspects.append({
                        "prog_planet": p_name,
                        "natal_planet": n_name,
                        "aspect": asp_name,
                        "orb": orb,
                        "is_positive": asp_name in POSITIVE_ASPECTS,
                    })
        return aspects

    def get_progressed_moon_sign(self) -> str:
        return self.positions["MOON"]["sign"] if "MOON" in self.positions else ""

    def summary(self) -> str:
        lines = []
        lines.append(f"═══ SEKONDEr PROGRESİF HARİTA — {self.natal.person['short']} ═══")
        lines.append(f"Hedef Tarih: {self.target_date.strftime('%d.%m.%Y')}")
        lines.append(f"Progresif Ay Burcu: {self.get_progressed_moon_sign()}")
        lines.append(f"Progresif Güneş: {self.positions.get('SUN', {}).get('formatted', '?')}")
        lines.append(f"Progresif Venüs: {self.positions.get('VENUS', {}).get('formatted', '?')}")
        lines.append("")
        lines.append("— Progresif → Natal Açılar —")
        for asp in self.aspects_to_natal[:12]:
            sign = "+" if asp["is_positive"] else "-"
            lines.append(f"  {sign} Prog.{asp['prog_planet']} {asp['aspect']} "
                         f"Natal {asp['natal_planet']}  (orb: {asp['orb']:.1f}°)")
        return "\n".join(lines)


class SolarArcDirections:
    """Solar Arc Directions — all planets advance at Sun's rate (~1°/year)."""

    def __init__(self, natal_chart, target_date: Optional[datetime] = None):
        self.natal = natal_chart
        self.target_date = target_date or datetime.now(pytz.utc)

        # Calculate age in years
        birth_tz = pytz.timezone(natal_chart.person["timezone"])
        birth_dt_aware = birth_tz.localize(
            datetime(natal_chart.dt.year, natal_chart.dt.month, natal_chart.dt.day,
                     natal_chart.dt.hour, natal_chart.dt.minute)
        )
        target_aware = self.target_date if self.target_date.tzinfo else pytz.utc.localize(self.target_date)
        age = (target_aware - birth_dt_aware.astimezone(pytz.utc)).days / 365.25

        # Solar arc = exact degrees Sun has moved since birth
        prog_jd = natal_chart.jd + age
        sun_prog, _ = swe.calc_ut(prog_jd, swe.SUN)
        sun_natal, _ = swe.calc_ut(natal_chart.jd, swe.SUN)
        self.solar_arc = (sun_prog[0] - sun_natal[0]) % 360

        # Advance all natal planets by solar arc
        self.positions = {}
        for p_name, p_data in natal_chart.positions.items():
            new_lon = (p_data["lon"] + self.solar_arc) % 360
            from ..core.ephemeris import degrees_to_sign, format_position
            sign, deg, sidx = degrees_to_sign(new_lon)
            self.positions[p_name] = {
                "lon": new_lon, "sign": sign, "sign_idx": sidx,
                "deg_in_sign": deg, "formatted": format_position(new_lon),
                "retrograde": False, "lat": 0, "speed": 0, "house": 0,
            }

        # Also advance ASC and MC
        self.sa_asc = (natal_chart.houses["ASC"] + self.solar_arc) % 360
        self.sa_mc = (natal_chart.houses["MC"] + self.solar_arc) % 360

        self.aspects_to_natal = self._calc_sa_aspects()

    def _calc_sa_aspects(self) -> List[Dict]:
        aspects = []
        for p_name, p_data in self.positions.items():
            for n_name, n_data in self.natal.positions.items():
                orb, asp_name, _ = calc_aspect(p_data["lon"], n_data["lon"])
                if asp_name and orb <= 1.5:  # Very tight orbs for SA
                    aspects.append({
                        "sa_planet": p_name,
                        "natal_planet": n_name,
                        "aspect": asp_name,
                        "orb": orb,
                        "is_positive": asp_name in POSITIVE_ASPECTS,
                    })
        return aspects

    def summary(self) -> str:
        lines = []
        lines.append(f"═══ SOLAR ARC YÖNLENDİRMELERİ — {self.natal.person['short']} ═══")
        lines.append(f"Hedef Tarih: {self.target_date.strftime('%d.%m.%Y')}")
        lines.append(f"Solar Arc: {self.solar_arc:.2f}°")
        lines.append(f"SA Venüs: {self.positions.get('VENUS', {}).get('formatted', '?')}")
        lines.append(f"SA Jüpiter: {self.positions.get('JUPITER', {}).get('formatted', '?')}")
        lines.append(f"SA ASC: {format_position(self.sa_asc)}")
        lines.append(f"SA MC: {format_position(self.sa_mc)}")
        lines.append("")
        lines.append("— SA → Natal Açılar (Sıkı Orb ≤1.5°) —")
        for asp in self.aspects_to_natal[:15]:
            sign = "+" if asp["is_positive"] else "-"
            lines.append(f"  {sign} SA.{asp['sa_planet']} {asp['aspect']} "
                         f"Natal {asp['natal_planet']}  (orb: {asp['orb']:.1f}°)")
        return "\n".join(lines)
