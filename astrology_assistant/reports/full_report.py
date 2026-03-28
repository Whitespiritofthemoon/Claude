"""
Full comprehensive astrology report generator.
Combines all astrology systems into one cohesive report.
"""
from datetime import datetime
from typing import Optional
import pytz
import os
from ..config import (
    PERSON_A, PERSON_B, RELATIONSHIP, CURRENT_LOCATION,
    ANALYSIS_QUESTION, REPORTS_DIR
)


def generate_full_report(
    natal_a, natal_b,
    synastry, composite, davison,
    transit_a, transit_b,
    prog_a, prog_b,
    sa_a, sa_b,
    sr_a, sr_b,
    lr_a, lr_b,
    kundali_a, kundali_b,
    lots_a, lots_b,
    profection_summary_a, profection_summary_b,
    firdaria_summary_a, firdaria_summary_b,
    proposal_windows,
    analyzer,
    output_file: Optional[str] = None
) -> str:
    """Generate the complete multi-system astrology report."""

    now = datetime.now(pytz.timezone(CURRENT_LOCATION["timezone"]))
    lines = []

    # ── HEADER ────────────────────────────────────────────────────────────────
    lines.append("═" * 70)
    lines.append("🔮 KAPSAMLI ASTROLOJİ RAPORU")
    lines.append("─" * 70)
    lines.append(f"Hazırlayan: Astroloji Asistanı (Tüm Sistemler)")
    lines.append(f"Tarih: {now.strftime('%d %B %Y, %H:%M')} ({CURRENT_LOCATION['timezone']})")
    lines.append(f"")
    lines.append(f"Kişi A (Sen): {PERSON_A['name']}")
    lines.append(f"  Doğum: {PERSON_A['birth_date']} {PERSON_A['birth_time']}, "
                 f"{PERSON_A['birth_city']}, {PERSON_A['birth_country']}")
    lines.append(f"Kişi B (Levent): {PERSON_B['name']}")
    lines.append(f"  Doğum: {PERSON_B['birth_date']} {PERSON_B['birth_time']}, "
                 f"{PERSON_B['birth_city']}, {PERSON_B['birth_country']}")
    lines.append(f"İlişki Başlangıcı: {RELATIONSHIP['start_date']}, {RELATIONSHIP['start_city']}")
    lines.append(f"Mevcut Konum: {CURRENT_LOCATION['city']}, {CURRENT_LOCATION['country']}")
    lines.append(f"")
    lines.append(f"SORU: {ANALYSIS_QUESTION}")
    lines.append("═" * 70)

    # ── SECTION 1: NATAL CHARTS ───────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 1: NATAL HARİTALAR (BATI ASTROLOJİSİ)")
    lines.append("█" * 70)
    lines.append("")
    lines.append(natal_a.summary())
    lines.append("")
    lines.append(natal_b.summary())

    # ── SECTION 2: SYNASTRY ───────────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 2: SYNASTRİ & İLİŞKİ HARİTALARI")
    lines.append("█" * 70)
    lines.append("")
    lines.append(synastry.summary())
    lines.append("")
    lines.append(composite.summary())
    lines.append("")
    lines.append(davison.summary())

    # ── SECTION 3: TRANSITS ───────────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 3: TRANZİT HARİTALAR (GÜNCEL)")
    lines.append("█" * 70)
    lines.append("")
    lines.append("[ Sen İçin Tranzitler ]")
    lines.append(transit_a.summary())
    lines.append("")
    lines.append("[ Levent İçin Tranzitler ]")
    lines.append(transit_b.summary())

    # ── SECTION 4: PROGRESSIONS & SOLAR ARC ──────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 4: PROGRESİF HARİTALAR & SOLAR ARC")
    lines.append("█" * 70)
    lines.append("")
    lines.append("[ Sen — Sekonder Progresifler ]")
    lines.append(prog_a.summary())
    lines.append("")
    lines.append("[ Levent — Sekonder Progresifler ]")
    lines.append(prog_b.summary())
    lines.append("")
    lines.append("[ Sen — Solar Arc Yönlendirmeleri ]")
    lines.append(sa_a.summary())
    lines.append("")
    lines.append("[ Levent — Solar Arc Yönlendirmeleri ]")
    lines.append(sa_b.summary())

    # ── SECTION 5: RETURNS ────────────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 5: GÜNEŞ & AY DÖNÜŞÜ HARİTALARI")
    lines.append("█" * 70)
    lines.append("")
    lines.append(sr_a.summary())
    lines.append("")
    lines.append(sr_b.summary())
    lines.append("")
    lines.append(lr_a.summary())
    lines.append("")
    lines.append(lr_b.summary())

    # ── SECTION 6: VEDIC ASTROLOGY ────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 6: VEDİK ASTROLOJİ (JYOTİŞ)")
    lines.append("█" * 70)
    lines.append("")
    lines.append(kundali_a.summary())
    lines.append("")
    lines.append(kundali_b.summary())

    # ── SECTION 7: ARABIC LOTS ────────────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 7: ARABİK LOTLAR / HERMESÇİ NOKTALAR")
    lines.append("█" * 70)
    lines.append("")
    lines.append(lots_a)
    lines.append("")
    lines.append(lots_b)

    # ── SECTION 8: TRADITIONAL ASTROLOGY ─────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 8: GELENEKSel ASTROLOJİ")
    lines.append("█" * 70)
    lines.append("")
    lines.append("─── YILLIK PROFEKSİYON ───")
    lines.append(profection_summary_a)
    lines.append("")
    lines.append(profection_summary_b)
    lines.append("")
    lines.append("─── FİRDARİA ───")
    lines.append(firdaria_summary_a)
    lines.append("")
    lines.append(firdaria_summary_b)

    # ── SECTION 9: MARRIAGE WINDOWS ───────────────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 9: EVLİLİK TEKLİFİ TAHMİN ANALİZİ")
    lines.append("█" * 70)
    lines.append("")
    lines.append(analyzer.format_report(proposal_windows))

    # ── SECTION 10: OVERALL INTERPRETATION ───────────────────────────────────
    lines.append("\n" + "█" * 70)
    lines.append("  BÖLÜM 10: GENEL DEĞERLENDİRME & YORUM")
    lines.append("█" * 70)
    lines.append("")
    lines.append(_generate_interpretation(
        natal_a, natal_b, synastry, kundali_a, kundali_b,
        proposal_windows
    ))

    # ── FOOTER ────────────────────────────────────────────────────────────────
    lines.append("\n" + "═" * 70)
    lines.append("Bu rapor Swiss Ephemeris kullanılarak hesaplanmıştır.")
    lines.append("Tüm astroljik sistemler (Batı, Vedik, Geleneksel) dahil edilmiştir.")
    lines.append("Günlük izleme aktif — yeni gelişmelerde bildirim alacaksınız.")
    lines.append("═" * 70)

    report_text = "\n".join(lines)

    # Save
    os.makedirs(REPORTS_DIR, exist_ok=True)
    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(report_text)
    else:
        fname = os.path.join(REPORTS_DIR, f"tam_rapor_{now.strftime('%Y%m%d_%H%M')}.txt")
        with open(fname, "w", encoding="utf-8") as f:
            f.write(report_text)

    return report_text


def _generate_interpretation(natal_a, natal_b, synastry,
                              kundali_a, kundali_b, proposal_windows) -> str:
    """Generate the overall astrological interpretation."""
    lines = []

    # Compatibility
    score = synastry.score
    lines.append(f"📊 SYNASTRİ UYUM SKORU: {score['total']} — {score['rating']}")
    lines.append(f"   Aşk Puanı: {score['love']}  |  Evlilik Puanı: {score['marriage']}")
    lines.append("")

    # Natal Venus/7th house analysis
    lines.append("💫 VENÜS & 7. EV ANALİZİ:")
    v_a = natal_a.positions.get("VENUS", {})
    v_b = natal_b.positions.get("VENUS", {})
    lines.append(f"  Senin Venüs'ün: {v_a.get('formatted','?')} [{v_a.get('house','?')}. Ev] — "
                 f"Aşk anlayışın ve çekim gücün")
    lines.append(f"  Levent'in Venüs'ü: {v_b.get('formatted','?')} [{v_b.get('house','?')}. Ev] — "
                 f"Levent'in sevgi dili")
    lines.append("")

    # 7th house analysis
    lines.append("💍 7. EV (EVLİLİK EVİ) ANALİZİ:")
    lines.append(f"  Senin 7. Ev Yöneticin: {natal_a.get_7th_house_ruler()}")
    lines.append(f"  Levent'in 7. Ev Yöneticisi: {natal_b.get_7th_house_ruler()}")
    h7_a = natal_a.planets_in_house(7)
    h7_b = natal_b.planets_in_house(7)
    if h7_a:
        lines.append(f"  Senin 7. Ev'indeki Gezegenler: {', '.join(h7_a)}")
    if h7_b:
        lines.append(f"  Levent'in 7. Ev'indeki Gezegenler: {', '.join(h7_b)}")
    lines.append("")

    # Vedic analysis
    if kundali_b:
        lines.append("🕉️ VEDİK ANALİZ — LEVENT:")
        lines.append(f"  Aktif Mahadasha: {kundali_b.current_dasha['planet_tr']}")
        lines.append(f"  Not: {kundali_b.current_dasha['marriage_note']}")
        if kundali_b.current_antardasha_active:
            ad = kundali_b.current_antardasha_active
            lines.append(f"  Aktif Antardasha: {ad['antardasha_tr']}")
            lines.append(f"  Not: {ad['marriage_note']}")
        lines.append(f"  Sade Sati: {'Aktif — ' + kundali_b.sade_sati_phase if kundali_b.sade_sati_active else 'Aktif Değil'}")
        lines.append("")

    if kundali_a:
        lines.append("🕉️ VEDİK ANALİZ — SEN:")
        lines.append(f"  Aktif Mahadasha: {kundali_a.current_dasha['planet_tr']}")
        lines.append(f"  Not: {kundali_a.current_dasha['marriage_note']}")
        lines.append("")

    # Best proposal windows
    if proposal_windows:
        lines.append("═" * 60)
        lines.append("🌟 EN OLASI EVLİLİK TEKLİFİ PENCERELERİ:")
        lines.append("═" * 60)
        for i, w in enumerate(proposal_windows[:3], 1):
            lines.append(f"  #{i}: {w['month']} — Puan: {w['score']} ({w['strength']})")
            for s in w["signals"][:3]:
                lines.append(f"      • {s}")
        lines.append("")
        lines.append("NOT: Bu pencereler OLASILIK hesaplamalarına dayanmaktadır.")
        lines.append("Evlilik teklifinin gerçekleşmesi için:")
        lines.append("• Levent'in kendi hazırlığı ve iç kararı")
        lines.append("• İlişkinin olgunlaşma süreci")
        lines.append("• Pratik koşullar (ekonomi, aile, v.s.)")
        lines.append("da önemli rol oynar.")
    else:
        lines.append("Önümüzdeki 3 yılda belirlenen pencereler için günlük")
        lines.append("izleme devam etmektedir.")

    lines.append("")
    lines.append("─" * 60)
    lines.append("📅 GÜNLÜK İZLEME: Sistem her gün aktif olarak şunları takip eder:")
    lines.append("  • Jüpiter & Venüs transitleri (Levent'e)")
    lines.append("  • Ay geçişleri (7. ev, Terazi, Boğa)")
    lines.append("  • Tutulmalar & Yeni/Dolunay")
    lines.append("  • Retrograde istasyonları")
    lines.append("  • Vedik Dasha geçişleri")
    lines.append("  • Yıllık Profeksiyon değişimleri")
    lines.append("  → Önemli bir gelişme olduğunda bildirim alacaksınız!")

    return "\n".join(lines)
