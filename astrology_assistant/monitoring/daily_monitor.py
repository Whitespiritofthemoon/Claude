"""
Daily Monitoring & Notification System.
Checks for new astrological events and sends alerts.
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pytz
import swisseph as swe

from ..core.ephemeris import (
    current_jd, get_planet_positions, get_houses,
    get_planet_in_house, calc_aspect, degrees_to_sign,
    format_position, jd_to_datetime
)
from ..config import (
    CURRENT_LOCATION, NOTIFICATIONS_FILE, REPORTS_DIR,
    PERSON_B, PLANET_NAMES_TR
)

# ── Notification severity levels ─────────────────────────────────────────────
LEVEL_CRITICAL = "🔴 KRİTİK"
LEVEL_HIGH     = "🟠 YÜKSEK"
LEVEL_MEDIUM   = "🟡 ORTA"
LEVEL_INFO     = "🟢 BİLGİ"


class DailyMonitor:
    """Monitors planetary movements and generates daily alerts."""

    def __init__(self, natal_levent, natal_user,
                 kundali_levent=None, kundali_user=None):
        self.natal_l = natal_levent
        self.natal_u = natal_user
        self.kundali_l = kundali_levent
        self.kundali_u = kundali_user
        self.lat = CURRENT_LOCATION["lat"]
        self.lon = CURRENT_LOCATION["lon"]
        self.tz = pytz.timezone(CURRENT_LOCATION["timezone"])
        self.notifications = []

        os.makedirs(REPORTS_DIR, exist_ok=True)

    def run_daily_check(self) -> str:
        """Run the full daily astrological check. Returns formatted report."""
        now = datetime.now(self.tz)
        self.notifications = []

        self._check_planet_ingresses()
        self._check_retrograde_stations()
        self._check_major_transits_levent()
        self._check_moon_transits()
        self._check_eclipses_upcoming()
        self._check_vedic_dasha_changes()
        self._check_marriage_windows_this_month()

        report = self._format_daily_report(now)
        self._save_notification(report, now)
        return report

    def _check_planet_ingresses(self):
        """Check if any planet is changing signs today or tomorrow."""
        jd_now = current_jd()
        for step_hours in [0, 12, 24, 36, 48]:
            jd_check = jd_now + step_hours / 24.0
            jd_prev = jd_check - 1.0 / 24  # 1 hour before

            for planet_name, planet_id in [
                ("VENUS", swe.VENUS), ("MARS", swe.MARS),
                ("JUPITER", swe.JUPITER), ("SATURN", swe.SATURN),
                ("MERCURY", swe.MERCURY), ("SUN", swe.SUN),
                ("NORTH_NODE", swe.TRUE_NODE),
            ]:
                try:
                    pos_now, _ = swe.calc_ut(jd_check, planet_id)
                    pos_prev, _ = swe.calc_ut(jd_prev, planet_id)
                    sign_now = int(pos_now[0] // 30)
                    sign_prev = int(pos_prev[0] // 30)

                    if sign_now != sign_prev:
                        sign = degrees_to_sign(pos_now[0])[0]
                        dt = jd_to_datetime(jd_check)
                        p_tr = PLANET_NAMES_TR.get(planet_name, planet_name)
                        self.notifications.append({
                            "level": LEVEL_HIGH,
                            "category": "Burç Geçişi",
                            "message": f"{p_tr} {sign} burcuna giriyor — "
                                      f"{dt.strftime('%d.%m.%Y %H:%M')} UTC",
                            "timestamp": dt,
                        })
                except Exception:
                    pass

    def _check_retrograde_stations(self):
        """Check for retrograde stations (direct/retrograde changes)."""
        jd_now = current_jd()
        for planet_name, planet_id in [
            ("MERCURY", swe.MERCURY), ("VENUS", swe.VENUS),
            ("MARS", swe.MARS), ("JUPITER", swe.JUPITER),
            ("SATURN", swe.SATURN),
        ]:
            try:
                pos_now, _ = swe.calc_ut(jd_now, planet_id, swe.FLG_SPEED)
                pos_prev, _ = swe.calc_ut(jd_now - 1, planet_id, swe.FLG_SPEED)
                speed_now = pos_now[3]
                speed_prev = pos_prev[3]

                if speed_now < 0 and speed_prev > 0:
                    p_tr = PLANET_NAMES_TR.get(planet_name, planet_name)
                    self.notifications.append({
                        "level": LEVEL_HIGH,
                        "category": "Retrograde",
                        "message": f"⚠️ {p_tr} RETROGRADE başladı! İlişki kararları için dikkat.",
                        "timestamp": datetime.now(pytz.utc),
                    })
                elif speed_now > 0 and speed_prev < 0:
                    p_tr = PLANET_NAMES_TR.get(planet_name, planet_name)
                    self.notifications.append({
                        "level": LEVEL_MEDIUM,
                        "category": "Direkt",
                        "message": f"✅ {p_tr} DIREKT'e döndü — Engeller kalkıyor",
                        "timestamp": datetime.now(pytz.utc),
                    })
            except Exception:
                pass

    def _check_major_transits_levent(self):
        """Check significant transits to Levent's natal chart."""
        jd_now = current_jd()
        t_pos = get_planet_positions(jd_now, self.lat, self.lon)
        natal_l = self.natal_l.positions
        l_houses = self.natal_l.houses

        # Jupiter aspects to natal Venus — top marriage indicator
        if "JUPITER" in t_pos and "VENUS" in natal_l:
            orb, asp, _ = calc_aspect(t_pos["JUPITER"]["lon"], natal_l["VENUS"]["lon"])
            if asp and orb <= 3.0:
                level = LEVEL_CRITICAL if asp == "Conjunction" and orb <= 1 else LEVEL_HIGH
                self.notifications.append({
                    "level": level,
                    "category": "Evlilik Göstergesi",
                    "message": (
                        f"💍 Tranzit Jüpiter {asp} Levent'in Natal Venüs'ü "
                        f"(orb: {orb:.2f}°) — GÜÇLÜ EVLİLİK İŞARETİ!"
                    ),
                    "timestamp": datetime.now(pytz.utc),
                })

        # Jupiter in 7th house
        if "JUPITER" in t_pos:
            jup_house = get_planet_in_house(t_pos["JUPITER"]["lon"], l_houses["cusps"])
            if jup_house == 7:
                self.notifications.append({
                    "level": LEVEL_HIGH,
                    "category": "7. Ev Transiti",
                    "message": "Tranzit Jüpiter Levent'in 7. Ev'inde (Evlilik Evi) — Önemli ilişki dönemi",
                    "timestamp": datetime.now(pytz.utc),
                })

        # Venus transiting natal DSC or Venus
        if "VENUS" in t_pos:
            orb, asp, _ = calc_aspect(t_pos["VENUS"]["lon"], l_houses["DSC"])
            if asp and orb <= 2.0:
                self.notifications.append({
                    "level": LEVEL_MEDIUM,
                    "category": "Venüs Transiti",
                    "message": f"Tranzit Venüs Levent'in DSC'sine {asp} (orb: {orb:.1f}°)",
                    "timestamp": datetime.now(pytz.utc),
                })

        # Saturn to natal Venus (commitment, sometimes delay)
        if "SATURN" in t_pos and "VENUS" in natal_l:
            orb, asp, _ = calc_aspect(t_pos["SATURN"]["lon"], natal_l["VENUS"]["lon"])
            if asp in ("Conjunction", "Trine", "Sextile") and orb <= 2.0:
                self.notifications.append({
                    "level": LEVEL_MEDIUM,
                    "category": "Satürn-Venüs",
                    "message": f"Tranzit Satürn {asp} Levent'in Natal Venüs'ü — Ciddi bağlılık enerjisi",
                    "timestamp": datetime.now(pytz.utc),
                })

    def _check_moon_transits(self):
        """Check Moon's position and aspects today."""
        jd_now = current_jd()
        try:
            moon, _ = swe.calc_ut(jd_now, swe.MOON)
            moon_lon = moon[0]
            moon_sign, deg, _ = degrees_to_sign(moon_lon)
            moon_house_l = get_planet_in_house(moon_lon, self.natal_l.houses["cusps"])

            if moon_sign in ("Libra", "Taurus"):
                self.notifications.append({
                    "level": LEVEL_INFO,
                    "category": "Ay Konumu",
                    "message": f"Ay {moon_sign} burcunda — Venüs enerjisi, romantizm ve ilişki odağı güçlü",
                    "timestamp": datetime.now(pytz.utc),
                })

            if moon_house_l == 7:
                self.notifications.append({
                    "level": LEVEL_INFO,
                    "category": "Ay 7. Ev",
                    "message": f"Ay Levent'in 7. Ev'ini (Evlilik Evi) aktive ediyor",
                    "timestamp": datetime.now(pytz.utc),
                })

            # Check New/Full Moon
            sun, _ = swe.calc_ut(jd_now, swe.SUN)
            diff = (moon_lon - sun[0]) % 360
            if diff < 5:
                self.notifications.append({
                    "level": LEVEL_MEDIUM,
                    "category": "Yeni Ay",
                    "message": f"🌑 YENİ AY yaklaşıyor — {moon_sign} burcunda — Yeni başlangıç enerjisi",
                    "timestamp": datetime.now(pytz.utc),
                })
            elif abs(diff - 180) < 5:
                self.notifications.append({
                    "level": LEVEL_MEDIUM,
                    "category": "Dolunay",
                    "message": f"🌕 DOLUNAY yaklaşıyor — {moon_sign} burcunda — Duygusal doruk",
                    "timestamp": datetime.now(pytz.utc),
                })
        except Exception:
            pass

    def _check_eclipses_upcoming(self):
        """Check for upcoming eclipses in next 60 days."""
        jd_now = current_jd()
        try:
            # Solar eclipse
            result = swe.sol_eclipse_when_glob(jd_now, swe.FLG_SWIEPH)
            next_eclipse_jd = result[1][0] if result[1] else None
            if next_eclipse_jd and 0 < next_eclipse_jd - jd_now < 60:
                eclipse_dt = jd_to_datetime(next_eclipse_jd)
                sun, _ = swe.calc_ut(next_eclipse_jd, swe.SUN)
                eclipse_sign, _, _ = degrees_to_sign(sun[0])
                self.notifications.append({
                    "level": LEVEL_HIGH,
                    "category": "Güneş Tutulması",
                    "message": (
                        f"☀️ Güneş Tutulması: {eclipse_dt.strftime('%d.%m.%Y')} — "
                        f"{eclipse_sign} burcu — Kader değişiklikleri!"
                    ),
                    "timestamp": eclipse_dt,
                })
        except Exception:
            pass

    def _check_vedic_dasha_changes(self):
        """Check if Vedic dasha is about to change."""
        if not self.kundali_l:
            return

        now = datetime.now(pytz.utc)
        for dasha in self.kundali_l.dashas:
            end = dasha["end"].astimezone(pytz.utc) if dasha["end"].tzinfo else pytz.utc.localize(dasha["end"])
            days_to_end = (end - now).days
            if 0 <= days_to_end <= 30:
                self.notifications.append({
                    "level": LEVEL_HIGH,
                    "category": "Dasha Geçişi",
                    "message": (
                        f"🌙 Levent'in {dasha['planet_tr']} Mahadasha'sı "
                        f"{days_to_end} gün içinde bitiyor! "
                        f"Sonraki dönem: {self.kundali_l.dashas[self.kundali_l.dashas.index(dasha)+1]['planet_tr'] if self.kundali_l.dashas.index(dasha)+1 < len(self.kundali_l.dashas) else '?'}"
                    ),
                    "timestamp": end,
                })

    def _check_marriage_windows_this_month(self):
        """Quick check for current month's marriage indicators."""
        from ..analysis.marriage_indicators import MarriageWindowAnalyzer
        analyzer = MarriageWindowAnalyzer(
            self.natal_l, self.natal_u,
            kundali_levent=self.kundali_l,
            kundali_user=self.kundali_u,
            current_lat=self.lat, current_lon=self.lon
        )
        now = datetime.now(pytz.utc)
        score, signals = analyzer._score_month(now)
        if score >= 30:
            self.notifications.append({
                "level": LEVEL_HIGH if score >= 50 else LEVEL_MEDIUM,
                "category": "Bu Ay — Evlilik Penceresi",
                "message": (
                    f"💍 Bu ay evlilik teklifi skoru: {score} — "
                    f"{'GÜÇLÜ PENCERE ★★★' if score >= 50 else 'OLASI PENCERE ★★'}"
                ),
                "timestamp": now,
            })

    def _format_daily_report(self, now: datetime) -> str:
        """Format the complete daily report."""
        lines = []
        lines.append("=" * 60)
        lines.append(f"🔮 GÜNLÜK ASTROLOJİ RAPORU")
        lines.append(f"   {now.strftime('%d %B %Y — %H:%M')} ({CURRENT_LOCATION['timezone']})")
        lines.append("=" * 60)
        lines.append(f"Odak Sorusu: Levent ne zaman evlilik teklifi edecek?")
        lines.append("")

        if not self.notifications:
            lines.append("Bugün önemli bir astrolojik gelişme tespit edilmedi.")
            lines.append("Gezegenler normal seyrinde devam ediyor.")
        else:
            # Group by level
            critical = [n for n in self.notifications if n["level"] == LEVEL_CRITICAL]
            high = [n for n in self.notifications if n["level"] == LEVEL_HIGH]
            medium = [n for n in self.notifications if n["level"] == LEVEL_MEDIUM]
            info = [n for n in self.notifications if n["level"] == LEVEL_INFO]

            for level_name, items in [
                ("KRİTİK BİLDİRİMLER", critical),
                ("ÖNEMLİ BİLDİRİMLER", high),
                ("ORTA ÖNEMLİ", medium),
                ("BİLGİ", info),
            ]:
                if items:
                    lines.append(f"── {level_name} ──")
                    for n in items:
                        lines.append(f"[{n['category']}]")
                        lines.append(f"  {n['message']}")
                        lines.append("")

        # Current planetary snapshot
        lines.append("── ANLIL GEZEGEN KONUMLARI ──")
        jd = current_jd()
        try:
            t_pos = get_planet_positions(jd, self.lat, self.lon)
            key_planets = ["SUN", "MOON", "VENUS", "MARS", "JUPITER", "SATURN", "NORTH_NODE"]
            for p in key_planets:
                if p in t_pos:
                    d = t_pos[p]
                    retro = " ℞" if d["retrograde"] else ""
                    p_tr = PLANET_NAMES_TR.get(p, p)
                    lines.append(f"  {p_tr:15s}: {d['formatted']}{retro}")
        except Exception:
            lines.append("  (Gezegen konumları hesaplanamadı)")

        lines.append("")
        lines.append("=" * 60)
        lines.append("Sonraki günlük rapor: Yarın 07:00'da")
        lines.append("=" * 60)

        return "\n".join(lines)

    def _save_notification(self, report: str, now: datetime):
        """Save report to log file."""
        try:
            os.makedirs(os.path.dirname(NOTIFICATIONS_FILE), exist_ok=True)
            with open(NOTIFICATIONS_FILE, "a", encoding="utf-8") as f:
                f.write(f"\n{'='*70}\n")
                f.write(f"RAPOR TARİHİ: {now.strftime('%d.%m.%Y %H:%M')}\n")
                f.write(f"{'='*70}\n")
                f.write(report)
                f.write("\n")

            # Also save to dated file
            date_file = os.path.join(REPORTS_DIR, f"rapor_{now.strftime('%Y%m%d')}.txt")
            with open(date_file, "w", encoding="utf-8") as f:
                f.write(report)
        except Exception as e:
            pass  # Silent fail for file operations

    def get_today_summary(self) -> str:
        """Get a brief today summary."""
        return self.run_daily_check()
