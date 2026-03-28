"""
Vedic Astrology — Kundali (Jyotish natal chart), Navamsa D9,
Shodasha Varga, Sade Sati, and Vedic synastry.
"""
import swisseph as swe
from typing import Dict, List, Tuple, Optional
from ..core.ephemeris import (
    parse_birth_dt, get_planet_positions, get_houses,
    get_planet_in_house, get_all_aspects, degrees_to_sign,
    format_position, ayanamsa_value, tropical_to_sidereal, PLANETS
)
from .vimshottari import (
    calc_vimshottari_dasha, calc_antardasha, get_current_dasha,
    nakshatra_summary, get_upcoming_venus_jupiter_dashas,
    NAKSHATRA_RULERS, NAKSHATRAS, DASHA_TR
)

VEDIC_SIGN_NAMES = [
    "Mesha (Koç)", "Vrishabha (Boğa)", "Mithuna (İkizler)",
    "Karka (Yengeç)", "Simha (Aslan)", "Kanya (Başak)",
    "Tula (Terazi)", "Vrishchika (Akrep)", "Dhanu (Yay)",
    "Makara (Oğlak)", "Kumbha (Kova)", "Meena (Balık)",
]

VEDIC_SIGN_SHORT = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
]

# Vedic house significances
VEDIC_HOUSE_MARRIAGE = {
    7: "Vivah Bhava — Evlilik evi (birincil)",
    2: "Dhana Bhava — Aile ve evlilik bağı",
    11: "Labha Bhava — Kazanımlar, istekler",
    5: "Putra Bhava — Romantizm, sevgi",
}

# Vedic planet names
VEDIC_PLANET_NAMES = {
    "SUN": "Surya", "MOON": "Chandra", "MERCURY": "Budha",
    "VENUS": "Shukra", "MARS": "Mangal", "JUPITER": "Guru",
    "SATURN": "Shani", "NORTH_NODE": "Rahu", "SOUTH_NODE": "Ketu",
}


class KundaliChart:
    """Complete Vedic (Jyotish) natal chart with Lahiri ayanamsa."""

    def __init__(self, person: Dict, ayanamsa: str = "LAHIRI"):
        self.person = person
        self.ayanamsa = ayanamsa
        self.name = person["name"]

        self.dt, self.jd = parse_birth_dt(
            person["birth_date"], person["birth_time"], person["timezone"]
        )

        # Tropical positions first
        self.tropical_positions = get_planet_positions(
            self.jd, person["birth_lat"], person["birth_lon"]
        )

        # Sidereal positions
        self.positions = get_planet_positions(
            self.jd, person["birth_lat"], person["birth_lon"],
            ayanamsa=ayanamsa
        )

        # Sidereal houses (Whole Sign system standard in Vedic)
        self.houses = get_houses(
            self.jd, person["birth_lat"], person["birth_lon"],
            system="W", ayanamsa=ayanamsa
        )

        self.ayanamsa_val = ayanamsa_value(self.jd, ayanamsa)
        self._assign_houses()
        self._calc_navamsa()
        self._calc_dashas()
        self._calc_sade_sati()

    def _assign_houses(self):
        """Assign houses using Whole Sign system (standard Vedic)."""
        asc_lon = self.houses["ASC"]
        asc_sign_idx = int(asc_lon // 30)

        for p, d in self.positions.items():
            planet_sign_idx = d["sign_idx"]
            house = ((planet_sign_idx - asc_sign_idx) % 12) + 1
            d["house"] = house
            d["vedic_sign"] = VEDIC_SIGN_SHORT[planet_sign_idx]

    def _calc_navamsa(self):
        """Calculate Navamsa (D9) chart — marriage chart in Vedic."""
        self.navamsa_positions = {}
        for p, d in self.positions.items():
            nav_lon = self._navamsa_longitude(d["lon"])
            sign, deg, sidx = degrees_to_sign(nav_lon)
            self.navamsa_positions[p] = {
                "lon": nav_lon,
                "sign": sign,
                "sign_idx": sidx,
                "deg_in_sign": deg,
                "vedic_sign": VEDIC_SIGN_SHORT[sidx],
                "formatted": format_position(nav_lon),
                "house": 0,
                "retrograde": d.get("retrograde", False),
            }

        # Navamsa ASC
        asc_nav = self._navamsa_longitude(self.houses["ASC"])
        self.navamsa_asc = asc_nav
        asc_sign_idx = int(asc_nav // 30)
        for p, d in self.navamsa_positions.items():
            planet_sign_idx = d["sign_idx"]
            d["house"] = ((planet_sign_idx - asc_sign_idx) % 12) + 1

    def _navamsa_longitude(self, lon: float) -> float:
        """Calculate Navamsa longitude."""
        # Each sign divided into 9 parts of 3°20' (200 arcmin)
        sign_idx = int(lon // 30)
        deg_in_sign = lon % 30
        pada = int(deg_in_sign // (30 / 9))  # 0-8

        # Starting sign for navamsa depends on element of sign
        if sign_idx % 3 == 0:   # Fire signs: start from Aries (0)
            start = 0
        elif sign_idx % 3 == 1: # Earth signs: start from Capricorn (9)
            start = 9
        else:                   # Air/Water: start from Libra (6)
            start = 6

        navamsa_sign = (start + pada) % 12
        # Approximate position within navamsa sign
        sub_deg = (deg_in_sign % (30 / 9)) / (30 / 9) * 30
        return navamsa_sign * 30 + sub_deg

    def _calc_dashas(self):
        """Calculate Vimshottari Dasha periods."""
        from datetime import datetime
        moon_sid = self.positions["MOON"]["lon"]
        self.dashas = calc_vimshottari_dasha(
            self.jd, moon_sid, self.dt, self.person["timezone"]
        )
        self.current_dasha, self.current_dasha_idx = get_current_dasha(self.dashas)
        self.current_antardasha = calc_antardasha(self.current_dasha)

        from datetime import datetime
        import pytz
        now = datetime.now(pytz.utc)
        self.current_antardasha_active = None
        for ad in self.current_antardasha:
            start = ad["start"] if ad["start"].tzinfo else pytz.utc.localize(ad["start"])
            end = ad["end"] if ad["end"].tzinfo else pytz.utc.localize(ad["end"])
            if start <= now < end:
                self.current_antardasha_active = ad
                break

    def _calc_sade_sati(self):
        """Check if person is in Sade Sati (Saturn's 7.5 year cycle over Moon)."""
        moon_sign_idx = self.positions["MOON"]["sign_idx"]
        # Get current Saturn sidereal position
        from ..core.ephemeris import current_jd
        jd_now = current_jd()
        saturn_sid, _ = swe.calc_ut(jd_now, swe.SATURN,
                                     swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
        swe.set_sid_mode(getattr(swe, f"SIDM_{self.ayanamsa}", swe.SIDM_LAHIRI))
        saturn_pos, _ = swe.calc_ut(jd_now, swe.SATURN,
                                    swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL)
        swe.set_sid_mode(0)
        saturn_sign_idx = int(saturn_pos[0] // 30) % 12

        # Sade Sati = Saturn in 12th, 1st, or 2nd from Moon
        diff = (saturn_sign_idx - moon_sign_idx) % 12
        self.sade_sati_active = diff in (0, 1, 11)
        self.sade_sati_phase = {0: "Mide (Orta Faz)", 1: "Uday (Son Faz)", 11: "Peeda (İlk Faz)"}.get(diff, "Yok")

    def get_7th_lord(self) -> str:
        """Get the lord of 7th house in Vedic chart."""
        asc_lon = self.houses["ASC"]
        asc_sign_idx = int(asc_lon // 30)
        seventh_sign_idx = (asc_sign_idx + 6) % 12
        seventh_sign = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ][seventh_sign_idx]
        from ..core.ephemeris import sign_ruler
        return sign_ruler(seventh_sign)

    def get_venus_position(self) -> str:
        """Shukra (Venus) position — primary marriage significator."""
        v = self.positions.get("VENUS", {})
        return f"{v.get('vedic_sign', '')} — {v.get('house', '')}. Ev"

    def get_jupiter_position(self) -> str:
        """Guru (Jupiter) position — male marriage significator for women."""
        j = self.positions.get("JUPITER", {})
        return f"{j.get('vedic_sign', '')} — {j.get('house', '')}. Ev"

    def navamsa_venus(self) -> str:
        """Venus in Navamsa — key marriage chart."""
        v = self.navamsa_positions.get("VENUS", {})
        return f"{v.get('vedic_sign', '')} — D9 {v.get('house', '')}. Ev"

    def get_nakshatra_info(self) -> str:
        moon_sid_lon = self.positions["MOON"]["lon"]
        return nakshatra_summary(moon_sid_lon)

    def summary(self) -> str:
        lines = []
        lines.append(f"═══ KUNDALİ (VEDİK NATAL HARİTA) — {self.name} ═══")
        lines.append(f"Ayanamsa: {self.ayanamsa} ({self.ayanamsa_val:.4f}°)")
        lines.append(f"Lagna (Yükselen): {VEDIC_SIGN_SHORT[int(self.houses['ASC']//30)%12]}")
        lines.append(f"Ay Nakshatra: {self.get_nakshatra_info()}")
        lines.append("")
        lines.append("— Gezegen Konumları (Sidereal) —")
        planet_order = ["SUN", "MOON", "MERCURY", "VENUS", "MARS",
                        "JUPITER", "SATURN", "NORTH_NODE", "SOUTH_NODE"]
        for p in planet_order:
            if p in self.positions:
                d = self.positions[p]
                retro = " ℞" if d.get("retrograde") else ""
                vname = VEDIC_PLANET_NAMES.get(p, p)
                lines.append(f"  {vname:15s}: {d['vedic_sign']:15s} [{d['house']:2d}. Ev]{retro}")
        lines.append("")
        lines.append("— Navamsa (D9) — Evlilik Haritası —")
        lines.append(f"  D9 Yükselen: {VEDIC_SIGN_SHORT[int(self.navamsa_asc//30)%12]}")
        for p in ["VENUS", "MARS", "JUPITER", "MOON", "SUN"]:
            if p in self.navamsa_positions:
                d = self.navamsa_positions[p]
                vname = VEDIC_PLANET_NAMES.get(p, p)
                lines.append(f"  {vname:15s}: {d['vedic_sign']:15s} [D9 {d['house']:2d}. Ev]")
        lines.append("")
        lines.append("— Vimshottari Dasha —")
        lines.append(f"  Aktif Mahadasha: {self.current_dasha['planet_tr']}")
        lines.append(f"    {self.current_dasha['start'].strftime('%d.%m.%Y')} → "
                     f"{self.current_dasha['end'].strftime('%d.%m.%Y')}")
        lines.append(f"  Not: {self.current_dasha['marriage_note']}")
        if self.current_antardasha_active:
            ad = self.current_antardasha_active
            lines.append(f"  Aktif Antardasha: {ad['antardasha_tr']}")
            lines.append(f"    {ad['start'].strftime('%d.%m.%Y')} → {ad['end'].strftime('%d.%m.%Y')}")
            lines.append(f"  Not: {ad['marriage_note']}")
        lines.append("")
        lines.append(f"— Sade Sati —")
        lines.append(f"  Aktif: {'EVET — ' + self.sade_sati_phase if self.sade_sati_active else 'HAYIR'}")
        lines.append("")
        lines.append(f"  Shukra (Venüs): {self.get_venus_position()}")
        lines.append(f"  Guru (Jüpiter): {self.get_jupiter_position()}")
        lines.append(f"  7. Ev Yöneticisi: {self.get_7th_lord()}")
        lines.append(f"  D9 Venüs: {self.navamsa_venus()}")
        return "\n".join(lines)
