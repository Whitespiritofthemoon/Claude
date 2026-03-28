"""
Astroloji Asistanı — Ana Giriş Noktası
Tüm astroloji sistemlerini başlatır ve kapsamlı rapor üretir.

Kullanım:
  python -m astrology_assistant.main              # Tam rapor
  python -m astrology_assistant.main --daily      # Günlük izleme raporu
  python -m astrology_assistant.main --windows    # Sadece teklif pencereleri
"""
import sys
import os
import argparse
from datetime import datetime
import pytz

# Add parent dir to path if running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from astrology_assistant.config import (
    PERSON_A, PERSON_B, CURRENT_LOCATION, REPORTS_DIR
)


def build_all_charts():
    """Initialize all astrology charts and systems."""
    print("▶ Natal haritalar hesaplanıyor...")

    from astrology_assistant.charts.natal import NatalChart
    natal_a = NatalChart(PERSON_A)
    natal_b = NatalChart(PERSON_B)
    print(f"  ✓ {natal_a.name}: ☉{natal_a.get_sun_sign()} ☽{natal_a.get_moon_sign()} ↑{natal_a.get_rising_sign()}")
    print(f"  ✓ {natal_b.name}: ☉{natal_b.get_sun_sign()} ☽{natal_b.get_moon_sign()} ↑{natal_b.get_rising_sign()}")

    print("▶ Synastri & ilişki haritaları...")
    from astrology_assistant.charts.synastry import SynastryChart, CompositeChart, DavisonChart
    synastry = SynastryChart(natal_a, natal_b)
    composite = CompositeChart(natal_a, natal_b)
    davison = DavisonChart(natal_a, natal_b)
    print(f"  ✓ Synastri Skoru: {synastry.score['total']} — {synastry.score['rating']}")

    print("▶ Tranzit haritalar...")
    from astrology_assistant.charts.transits import TransitChart, ProgressedChart, SolarArcDirections
    now = datetime.now(pytz.utc)
    lat = CURRENT_LOCATION["lat"]
    lon = CURRENT_LOCATION["lon"]
    transit_a = TransitChart(natal_a, lat=lat, lon=lon)
    transit_b = TransitChart(natal_b, lat=lat, lon=lon)
    print(f"  ✓ Tranzitler hazır")

    print("▶ Progresif haritalar & Solar Arc...")
    prog_a = ProgressedChart(natal_a, now)
    prog_b = ProgressedChart(natal_b, now)
    sa_a = SolarArcDirections(natal_a, now)
    sa_b = SolarArcDirections(natal_b, now)
    print(f"  ✓ Prog. Ay ({natal_a.person['short']}): {prog_a.get_progressed_moon_sign()}")

    print("▶ Güneş & Ay Dönüşü haritaları...")
    from astrology_assistant.charts.returns import SolarReturnChart, LunarReturnChart
    current_year = now.year
    sr_a = SolarReturnChart(natal_a, current_year, lat, lon)
    sr_b = SolarReturnChart(natal_b, current_year, lat, lon)
    lr_a = LunarReturnChart(natal_a, location_lat=lat, location_lon=lon)
    lr_b = LunarReturnChart(natal_b, location_lat=lat, location_lon=lon)
    print(f"  ✓ SR {current_year} hazır")

    print("▶ Vedik astroloji (Kundali, Navamsa, Dasha)...")
    from astrology_assistant.vedic.kundali import KundaliChart
    kundali_a = KundaliChart(PERSON_A)
    kundali_b = KundaliChart(PERSON_B)
    print(f"  ✓ {natal_a.person['short']} Mahadasha: {kundali_a.current_dasha['planet_tr']}")
    print(f"  ✓ {natal_b.person['short']} Mahadasha: {kundali_b.current_dasha['planet_tr']}")

    print("▶ Arabik Lotlar...")
    from astrology_assistant.traditional.arabic_lots import calc_all_lots, lots_summary
    lots_a_raw = calc_all_lots(natal_a.positions, natal_a.houses, gender=PERSON_A["gender"])
    lots_b_raw = calc_all_lots(natal_b.positions, natal_b.houses, gender=PERSON_B["gender"])
    lots_a_str = lots_summary(lots_a_raw, natal_a.person["short"])
    lots_b_str = lots_summary(lots_b_raw, natal_b.person["short"])
    print(f"  ✓ Lotlar hesaplandı")

    print("▶ Geleneksel astroloji (Profeksiyon, Firdaria)...")
    from astrology_assistant.traditional.profections import profection_summary, firdaria_summary
    prof_sum_a = profection_summary(natal_a)
    prof_sum_b = profection_summary(natal_b)
    fird_sum_a = firdaria_summary(natal_a)
    fird_sum_b = firdaria_summary(natal_b)
    print(f"  ✓ Profeksiyonlar hazır")

    print("▶ Evlilik teklifi pencereleri taranıyor (36 ay)...")
    from astrology_assistant.analysis.marriage_indicators import MarriageWindowAnalyzer
    analyzer = MarriageWindowAnalyzer(
        natal_b, natal_a,  # Levent primary (he proposes)
        synastry=synastry,
        composite=composite,
        kundali_levent=kundali_b,
        kundali_user=kundali_a,
        current_lat=lat,
        current_lon=lon
    )
    proposal_windows = analyzer.scan_windows(months_ahead=36)
    print(f"  ✓ {len(proposal_windows)} pencere tespit edildi")

    return {
        "natal_a": natal_a, "natal_b": natal_b,
        "synastry": synastry, "composite": composite, "davison": davison,
        "transit_a": transit_a, "transit_b": transit_b,
        "prog_a": prog_a, "prog_b": prog_b,
        "sa_a": sa_a, "sa_b": sa_b,
        "sr_a": sr_a, "sr_b": sr_b,
        "lr_a": lr_a, "lr_b": lr_b,
        "kundali_a": kundali_a, "kundali_b": kundali_b,
        "lots_a": lots_a_str, "lots_b": lots_b_str,
        "prof_sum_a": prof_sum_a, "prof_sum_b": prof_sum_b,
        "fird_sum_a": fird_sum_a, "fird_sum_b": fird_sum_b,
        "proposal_windows": proposal_windows, "analyzer": analyzer,
    }


def run_full_report(charts: dict = None) -> str:
    """Generate and save the full report."""
    if charts is None:
        charts = build_all_charts()

    print("▶ Tam rapor oluşturuluyor...")
    from astrology_assistant.reports.full_report import generate_full_report

    report = generate_full_report(
        natal_a=charts["natal_a"],
        natal_b=charts["natal_b"],
        synastry=charts["synastry"],
        composite=charts["composite"],
        davison=charts["davison"],
        transit_a=charts["transit_a"],
        transit_b=charts["transit_b"],
        prog_a=charts["prog_a"],
        prog_b=charts["prog_b"],
        sa_a=charts["sa_a"],
        sa_b=charts["sa_b"],
        sr_a=charts["sr_a"],
        sr_b=charts["sr_b"],
        lr_a=charts["lr_a"],
        lr_b=charts["lr_b"],
        kundali_a=charts["kundali_a"],
        kundali_b=charts["kundali_b"],
        lots_a=charts["lots_a"],
        lots_b=charts["lots_b"],
        profection_summary_a=charts["prof_sum_a"],
        profection_summary_b=charts["prof_sum_b"],
        firdaria_summary_a=charts["fird_sum_a"],
        firdaria_summary_b=charts["fird_sum_b"],
        proposal_windows=charts["proposal_windows"],
        analyzer=charts["analyzer"],
    )
    return report


def run_daily_check(charts: dict = None) -> str:
    """Run daily monitoring check."""
    if charts is None:
        # Only build what's needed for daily check
        from astrology_assistant.charts.natal import NatalChart
        from astrology_assistant.vedic.kundali import KundaliChart
        natal_a = NatalChart(PERSON_A)
        natal_b = NatalChart(PERSON_B)
        kundali_a = KundaliChart(PERSON_A)
        kundali_b = KundaliChart(PERSON_B)
    else:
        natal_a = charts["natal_a"]
        natal_b = charts["natal_b"]
        kundali_a = charts.get("kundali_a")
        kundali_b = charts.get("kundali_b")

    from astrology_assistant.monitoring.daily_monitor import DailyMonitor
    monitor = DailyMonitor(natal_b, natal_a, kundali_b, kundali_a)
    return monitor.run_daily_check()


def run_windows_only() -> str:
    """Show only the proposal windows."""
    print("▶ Teklif pencereleri hesaplanıyor...")
    from astrology_assistant.charts.natal import NatalChart
    from astrology_assistant.vedic.kundali import KundaliChart
    from astrology_assistant.analysis.marriage_indicators import MarriageWindowAnalyzer

    natal_a = NatalChart(PERSON_A)
    natal_b = NatalChart(PERSON_B)
    kundali_a = KundaliChart(PERSON_A)
    kundali_b = KundaliChart(PERSON_B)

    lat = CURRENT_LOCATION["lat"]
    lon = CURRENT_LOCATION["lon"]

    analyzer = MarriageWindowAnalyzer(
        natal_b, natal_a,
        kundali_levent=kundali_b,
        kundali_user=kundali_a,
        current_lat=lat, current_lon=lon
    )
    windows = analyzer.scan_windows(months_ahead=48)
    return analyzer.format_report(windows)


def main():
    parser = argparse.ArgumentParser(
        description="Astroloji Asistanı — Kapsamlı Analiz Aracı"
    )
    parser.add_argument("--daily", action="store_true",
                        help="Günlük izleme raporunu çalıştır")
    parser.add_argument("--windows", action="store_true",
                        help="Sadece evlilik teklifi pencerelerini göster")
    parser.add_argument("--full", action="store_true",
                        help="Tam rapor üret (varsayılan)")

    args = parser.parse_args()

    os.makedirs(REPORTS_DIR, exist_ok=True)

    if args.daily:
        print("\n🔮 GÜNLÜK ASTROLOJİ KONTROLÜ BAŞLATILIYOR...\n")
        report = run_daily_check()
        print(report)
    elif args.windows:
        print("\n🔮 EVLİLİK TEKLİFİ PENCERELERİ HESAPLANIYUR...\n")
        report = run_windows_only()
        print(report)
    else:
        # Full report (default)
        print("\n🔮 KAPSAMLI ASTROLOJİ RAPORU HAZIRLANIYUR...\n")
        print("Bu işlem ~30 saniye sürebilir...\n")
        charts = build_all_charts()
        report = run_full_report(charts)
        print("\n" + "="*70)
        print(report)
        print("\n" + "="*70)
        # Also run daily check
        print("\n📅 GÜNLÜK KONTROL:")
        daily = run_daily_check(charts)
        print(daily)


if __name__ == "__main__":
    main()
