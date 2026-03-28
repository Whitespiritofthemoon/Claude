"""
Marriage / Proposal Timing Analyzer.
Aggregates signals from ALL astrology systems to find the most likely
windows for Levent to propose.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import pytz
import swisseph as swe
from ..core.ephemeris import (
    current_jd, get_planet_positions, get_houses, get_planet_in_house,
    calc_aspect, degrees_to_sign, format_position, jd_to_datetime,
    datetime_to_jd
)

# ── Scoring weights ───────────────────────────────────────────────────────────
SCORES = {
    # Transit indicators (Levent's chart)
    "transit_jupiter_7th":           15,
    "transit_jupiter_conj_venus":    15,
    "transit_jupiter_trine_venus":   12,
    "transit_jupiter_sext_venus":    10,
    "transit_venus_7th":             8,
    "transit_saturn_conj_venus":     10,  # commitment
    "transit_node_conj_venus":       10,
    "transit_jupiter_conj_dsc":      14,
    "transit_venus_conj_dsc":        8,
    # Solar Return indicators (Levent)
    "sr_venus_7th":                  12,
    "sr_jupiter_7th":                10,
    "sr_7th_stellium":               10,
    "sr_asc_libra_taurus":           7,
    # Progression indicators (Levent)
    "prog_venus_7th":                10,
    "prog_sun_conj_venus":           8,
    "prog_moon_7th":                 7,
    "prog_moon_libra_taurus":        6,
    # Solar Arc (Levent)
    "sa_venus_conj_natal_dsc":       14,
    "sa_jupiter_conj_natal_venus":   12,
    "sa_sun_conj_natal_venus":       8,
    # Vedic Dasha (Levent)
    "dasha_venus":                   20,
    "dasha_jupiter":                 15,
    "dasha_antardasha_venus":        12,
    "dasha_antardasha_jupiter":      10,
    # Synastry activation
    "synastry_jupiter_conj_partner_venus": 10,
    "synastry_venus_conj_partner_dsc":     10,
    # Profection
    "profection_7th_house":          12,
    "profection_5th_house":          6,
    # Arabic Lots
    "fortune_lot_7th":               5,
    "marriage_lot_active":           8,
    # New/Full Moon
    "full_moon_7th":                 6,
    "new_moon_7th":                  5,
    "new_moon_libra":                7,  # Libra new moon = relationship focus
}

PROPOSAL_THRESHOLD = 30  # Score above this = possible window
STRONG_THRESHOLD = 50    # Score above this = strong window


class MarriageWindowAnalyzer:
    """
    Scans a date range day by day / month by month to find marriage proposal windows.
    Uses Levent's chart as primary (since question is about Levent proposing).
    """

    def __init__(self, natal_levent, natal_user,
                 synastry=None, composite=None,
                 kundali_levent=None, kundali_user=None,
                 current_lat: float = 36.8121, current_lon: float = 34.6415):
        self.natal_l = natal_levent
        self.natal_u = natal_user
        self.synastry = synastry
        self.composite = composite
        self.kundali_l = kundali_levent
        self.kundali_u = kundali_user
        self.lat = current_lat
        self.lon = current_lon

    def scan_windows(self, months_ahead: int = 24) -> List[Dict]:
        """Scan month by month for proposal windows."""
        windows = []
        now = datetime.now(pytz.utc)
        end_date = now + timedelta(days=months_ahead * 30.5)

        # Scan month by month
        scan_dt = datetime(now.year, now.month, 1, tzinfo=pytz.utc)
        while scan_dt < end_date:
            score, signals = self._score_month(scan_dt)
            if score >= PROPOSAL_THRESHOLD:
                strength = "GÜÇLÜ ★★★" if score >= STRONG_THRESHOLD else "ORTA ★★"
                windows.append({
                    "date": scan_dt,
                    "month": scan_dt.strftime("%B %Y"),
                    "score": score,
                    "strength": strength,
                    "signals": signals,
                })
            # Next month
            if scan_dt.month == 12:
                scan_dt = datetime(scan_dt.year + 1, 1, 1, tzinfo=pytz.utc)
            else:
                scan_dt = datetime(scan_dt.year, scan_dt.month + 1, 1, tzinfo=pytz.utc)

        return sorted(windows, key=lambda x: -x["score"])

    def _score_month(self, dt: datetime) -> Tuple[int, List[str]]:
        """Score a given month for marriage proposal potential."""
        score = 0
        signals = []
        jd = datetime_to_jd(dt, "UTC")

        # Get Levent's transit positions
        t_pos = get_planet_positions(jd, self.lat, self.lon)
        t_houses = get_houses(jd, self.lat, self.lon)

        natal_l = self.natal_l.positions
        l_houses = self.natal_l.houses

        # 1. Transit Jupiter to Levent's natal
        if "JUPITER" in t_pos and "VENUS" in natal_l:
            orb, asp, _ = calc_aspect(t_pos["JUPITER"]["lon"], natal_l["VENUS"]["lon"])
            if asp == "Conjunction" and orb <= 5:
                score += SCORES["transit_jupiter_conj_venus"]
                signals.append(f"Tranzit Jüpiter ☌ Natal Venüs (orb: {orb:.1f}°) — GÜÇLÜ EVLİLİK İŞARETİ")
            elif asp == "Trine" and orb <= 5:
                score += SCORES["transit_jupiter_trine_venus"]
                signals.append(f"Tranzit Jüpiter △ Natal Venüs (orb: {orb:.1f}°)")
            elif asp == "Sextile" and orb <= 4:
                score += SCORES["transit_jupiter_sext_venus"]
                signals.append(f"Tranzit Jüpiter ✱ Natal Venüs (orb: {orb:.1f}°)")

        # 2. Jupiter in Levent's 7th house
        if "JUPITER" in t_pos:
            jup_house = get_planet_in_house(t_pos["JUPITER"]["lon"], l_houses["cusps"])
            if jup_house == 7:
                score += SCORES["transit_jupiter_7th"]
                signals.append("Tranzit Jüpiter 7. Ev'de — Evlilik Evi'nde büyük şans!")

        # 3. Transit Jupiter to DSC
        if "JUPITER" in t_pos:
            orb, asp, _ = calc_aspect(t_pos["JUPITER"]["lon"], l_houses["DSC"])
            if asp in ("Conjunction",) and orb <= 3:
                score += SCORES["transit_jupiter_conj_dsc"]
                signals.append(f"Tranzit Jüpiter ☌ Natal DSC (7. Ev Başlangıcı) (orb: {orb:.1f}°)")

        # 4. Transit Saturn to Venus (commitment)
        if "SATURN" in t_pos and "VENUS" in natal_l:
            orb, asp, _ = calc_aspect(t_pos["SATURN"]["lon"], natal_l["VENUS"]["lon"])
            if asp in ("Conjunction", "Trine", "Sextile") and orb <= 4:
                score += SCORES["transit_saturn_conj_venus"]
                signals.append(f"Tranzit Satürn {asp} Natal Venüs — Bağlılık ve ciddiyet")

        # 5. Venus transiting 7th house
        if "VENUS" in t_pos:
            ven_house = get_planet_in_house(t_pos["VENUS"]["lon"], l_houses["cusps"])
            if ven_house == 7:
                score += SCORES["transit_venus_7th"]
                signals.append("Tranzit Venüs 7. Ev'de")

        # 6. North Node aspects
        if "NORTH_NODE" in t_pos and "VENUS" in natal_l:
            orb, asp, _ = calc_aspect(t_pos["NORTH_NODE"]["lon"], natal_l["VENUS"]["lon"])
            if asp in ("Conjunction",) and orb <= 3:
                score += SCORES["transit_node_conj_venus"]
                signals.append(f"Tranzit Kuzey Düğüm ☌ Natal Venüs — Kader anı!")

        # 7. Check Vedic dasha if available
        if self.kundali_l:
            score_d, sigs_d = self._score_vedic_dasha(dt)
            score += score_d
            signals.extend(sigs_d)

        # 8. Annual profection
        from ..traditional.profections import calc_profected_house
        import pytz
        birth_tz = pytz.timezone(self.natal_l.person["timezone"])
        birth_dt = self.natal_l.dt
        if birth_dt.tzinfo is None:
            birth_dt = birth_tz.localize(birth_dt)

        prof_house, age, theme = calc_profected_house(birth_dt, dt)
        if prof_house == 7:
            score += SCORES["profection_7th_house"]
            signals.append(f"Yıllık Profeksiyon 7. Ev — {age} yaş, {dt.year}")
        elif prof_house == 5:
            score += SCORES["profection_5th_house"]
            signals.append(f"Yıllık Profeksiyon 5. Ev (Aşk/Nişan)")

        # 9. New Moon in Libra or in 7th
        try:
            moon, _ = swe.calc_ut(jd, swe.MOON)
            sun, _ = swe.calc_ut(jd, swe.SUN)
            moon_lon = moon[0]
            sun_lon = sun[0]
            moon_house = get_planet_in_house(moon_lon, l_houses["cusps"])
            moon_sign, _, _ = degrees_to_sign(moon_lon)
            if moon_sign == "Libra":
                score += SCORES["new_moon_libra"]
                signals.append("Yeni/Dolunay Terazi burcu — ilişki enerjisi güçlü")
            if moon_house == 7:
                score += SCORES["full_moon_7th"]
                signals.append("Ay 7. Ev'de bu ay")
        except Exception:
            pass

        return score, signals

    def _score_vedic_dasha(self, dt: datetime) -> Tuple[int, List[str]]:
        """Score Vedic Dasha indicators."""
        score = 0
        signals = []
        if not self.kundali_l:
            return score, signals

        dt_aware = dt if dt.tzinfo else pytz.utc.localize(dt)

        from ..vedic.vimshottari import get_current_dasha, calc_antardasha
        current_md, _ = get_current_dasha(self.kundali_l.dashas, dt_aware)
        antardashas = calc_antardasha(current_md)

        if current_md["planet"] == "Venus":
            score += SCORES["dasha_venus"]
            signals.append(f"Vedik: Venüs Mahadasha aktif — En güçlü evlilik dönemi!")
        elif current_md["planet"] == "Jupiter":
            score += SCORES["dasha_jupiter"]
            signals.append(f"Vedik: Jüpiter Mahadasha — Evlilik ve bereket")

        # Check antardasha
        for ad in antardashas:
            start = ad["start"].astimezone(pytz.utc) if ad["start"].tzinfo else pytz.utc.localize(ad["start"])
            end = ad["end"].astimezone(pytz.utc) if ad["end"].tzinfo else pytz.utc.localize(ad["end"])
            if start <= dt_aware < end:
                if ad["antardasha_planet"] == "Venus":
                    score += SCORES["dasha_antardasha_venus"]
                    signals.append(f"Vedik Antardasha: Venüs — Güçlü evlilik alt-dönemi")
                elif ad["antardasha_planet"] == "Jupiter":
                    score += SCORES["dasha_antardasha_jupiter"]
                    signals.append(f"Vedik Antardasha: Jüpiter — Bereket alt-dönemi")

        return score, signals

    def get_top_windows(self, n: int = 5) -> List[Dict]:
        """Return top N proposal windows."""
        all_windows = self.scan_windows(months_ahead=36)
        return all_windows[:n]

    def format_report(self, windows: List[Dict]) -> str:
        """Format proposal window report."""
        lines = []
        lines.append("═" * 65)
        lines.append("★ EVLİLİK TEKLİFİ TAHMİN RAPORU — LEVENT ★")
        lines.append("═" * 65)
        lines.append(f"Soru: Levent ne zaman evlilik teklifi edecek?")
        lines.append(f"Analiz Tarihi: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
        lines.append("")

        if not windows:
            lines.append("Önümüzdeki 3 yılda belirgin bir pencere tespit edilemedi.")
            lines.append("Analizi genişletmek için 5 yıla uzatılabilir.")
            return "\n".join(lines)

        lines.append(f"Tespit Edilen Pencere Sayısı: {len(windows)}")
        lines.append("")

        for i, w in enumerate(windows[:8], 1):
            lines.append(f"{'─'*50}")
            lines.append(f"#{i} — {w['month'].upper()}")
            lines.append(f"Güç: {w['strength']}  |  Puan: {w['score']}")
            lines.append("Göstergeler:")
            for s in w["signals"][:6]:
                lines.append(f"  • {s}")
            lines.append("")

        # Best window
        best = windows[0] if windows else None
        if best:
            lines.append("═" * 65)
            lines.append(f"🌟 EN GÜÇLÜ PENCERE: {best['month'].upper()}")
            lines.append(f"   Puan: {best['score']} — {best['strength']}")
            lines.append("═" * 65)

        return "\n".join(lines)
