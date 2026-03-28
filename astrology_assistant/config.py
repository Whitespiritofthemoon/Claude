"""
Astrology Assistant - Birth Data Configuration
"""

# ── PERSON A (Sen / You) ──────────────────────────────────────────────────────
PERSON_A = {
    "name": "Sen (Kullanıcı)",
    "short": "Sen",
    "birth_date": "14.12.1998",
    "birth_time": "13:03",
    "birth_city": "Munich",
    "birth_country": "Germany",
    "birth_lat": 48.1351,
    "birth_lon": 11.5820,
    "birth_alt": 520,   # metres above sea level
    "timezone": "Europe/Berlin",
    "gender": "F",
}

# ── PERSON B (Levent) ─────────────────────────────────────────────────────────
PERSON_B = {
    "name": "Levent",
    "short": "Levent",
    "birth_date": "22.03.1994",
    "birth_time": "14:00",
    "birth_city": "Mersin",
    "birth_country": "Turkey",
    "birth_lat": 36.8121,
    "birth_lon": 34.6415,
    "birth_alt": 10,
    "timezone": "Europe/Istanbul",
    "gender": "M",
}

# ── RELATIONSHIP ──────────────────────────────────────────────────────────────
RELATIONSHIP = {
    "start_date": "05.05.2023",
    "start_city": "Mersin",
    "start_country": "Turkey",
    "start_lat": 36.8121,
    "start_lon": 34.6415,
}

# ── CURRENT LOCATION ──────────────────────────────────────────────────────────
CURRENT_LOCATION = {
    "city": "Mersin",
    "country": "Turkey",
    "lat": 36.8121,
    "lon": 34.6415,
    "timezone": "Europe/Istanbul",
}

# ── ANALYSIS QUESTION ────────────────────────────────────────────────────────
ANALYSIS_QUESTION = "Levent ne zaman evlilik teklifi edecek?"

# ── PLANET NAMES (Turkish) ────────────────────────────────────────────────────
PLANET_NAMES_TR = {
    "SUN": "Güneş", "MOON": "Ay", "MERCURY": "Merkür", "VENUS": "Venüs",
    "MARS": "Mars", "JUPITER": "Jüpiter", "SATURN": "Satürn",
    "URANUS": "Uranüs", "NEPTUNE": "Neptün", "PLUTO": "Plüton",
    "NORTH_NODE": "Kuzey Ay Düğümü", "SOUTH_NODE": "Güney Ay Düğümü",
    "CHIRON": "Kiron", "LILITH": "Kara Ay (Lilith)",
    "JUNO": "Juno", "VERTEX": "Vertex",
}

SIGN_NAMES_TR = {
    "Aries": "Koç", "Taurus": "Boğa", "Gemini": "İkizler",
    "Cancer": "Yengeç", "Leo": "Aslan", "Virgo": "Başak",
    "Libra": "Terazi", "Scorpio": "Akrep", "Sagittarius": "Yay",
    "Capricorn": "Oğlak", "Aquarius": "Kova", "Pisces": "Balık",
}

SIGN_NAMES_TR_SHORT = {
    "Aries": "Koç", "Taurus": "Boğa", "Gemini": "İkizler",
    "Cancer": "Yengeç", "Leo": "Aslan", "Virgo": "Başak",
    "Libra": "Terazi", "Scorpio": "Akrep", "Sagittarius": "Yay",
    "Capricorn": "Oğlak", "Aquarius": "Kova", "Pisces": "Balık",
}

HOUSE_NAMES_TR = {
    1: "1. Ev (Benlik, Dış Görünüş)",
    2: "2. Ev (Para, Değerler)",
    3: "3. Ev (İletişim, Kardeşler)",
    4: "4. Ev (Ev, Aile, Kökler)",
    5: "5. Ev (Aşk, Yaratıcılık, Çocuklar)",
    6: "6. Ev (Sağlık, Günlük Rutin)",
    7: "7. Ev (Evlilik, Ortaklıklar)",
    8: "8. Ev (Dönüşüm, Cinsellik, Miras)",
    9: "9. Ev (Felsefe, Yolculuklar)",
    10: "10. Ev (Kariyer, Prestij)",
    11: "11. Ev (Dostluklar, Hayaller)",
    12: "12. Ev (Gizlilik, Ruhsallık)",
}

# ── VEDIC CONFIG ──────────────────────────────────────────────────────────────
VEDIC_AYANAMSA = "LAHIRI"   # Most widely used

# ── NOTIFICATION CONFIG ───────────────────────────────────────────────────────
NOTIFICATIONS_FILE = "/home/user/Claude/astrology_assistant/notifications.log"
REPORTS_DIR = "/home/user/Claude/astrology_assistant/reports_output"
DAILY_CHECK_HOUR = 7   # 07:00 local time
