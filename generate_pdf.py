from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import re

# ── PDF ayarları ──────────────────────────────────────────────────────────────
OUTPUT = "/home/user/Claude/Pinterest_POD_Amazon_Strateji_2026.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title="Pinterest × Amazon × Printify Strateji Rehberi 2026",
    author="Claude (Anthropic)"
)

W = A4[0] - 4*cm  # kullanılabilir genişlik

# ── Renkler ───────────────────────────────────────────────────────────────────
RED     = colors.HexColor("#E60023")   # Pinterest kırmızısı
DARK    = colors.HexColor("#1A1A1A")
GREY    = colors.HexColor("#555555")
LGREY   = colors.HexColor("#F5F5F5")
MGREY   = colors.HexColor("#DDDDDD")
GOLD    = colors.HexColor("#C9A84C")
GREEN   = colors.HexColor("#2E7D32")
BLUE    = colors.HexColor("#1565C0")

# ── Stiller ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def s(name, **kw):
    return ParagraphStyle(name, **kw)

ST = {
    "cover_title": s("cover_title",
        fontSize=28, leading=34, textColor=RED,
        alignment=TA_CENTER, spaceAfter=6, fontName="Helvetica-Bold"),
    "cover_sub": s("cover_sub",
        fontSize=14, leading=18, textColor=DARK,
        alignment=TA_CENTER, spaceAfter=4, fontName="Helvetica"),
    "cover_date": s("cover_date",
        fontSize=11, textColor=GREY,
        alignment=TA_CENTER, fontName="Helvetica"),

    "h1": s("h1",
        fontSize=18, leading=22, textColor=RED,
        spaceBefore=18, spaceAfter=6, fontName="Helvetica-Bold"),
    "h2": s("h2",
        fontSize=14, leading=18, textColor=DARK,
        spaceBefore=12, spaceAfter=4, fontName="Helvetica-Bold"),
    "h3": s("h3",
        fontSize=12, leading=16, textColor=BLUE,
        spaceBefore=8, spaceAfter=3, fontName="Helvetica-Bold"),

    "body": s("body",
        fontSize=10, leading=15, textColor=DARK,
        spaceAfter=4, fontName="Helvetica", alignment=TA_JUSTIFY),
    "body_l": s("body_l",
        fontSize=10, leading=15, textColor=DARK,
        spaceAfter=3, fontName="Helvetica"),
    "bullet": s("bullet",
        fontSize=10, leading=14, textColor=DARK,
        leftIndent=14, spaceAfter=2, fontName="Helvetica",
        bulletIndent=4),
    "code": s("code",
        fontSize=8.5, leading=12, textColor=DARK,
        fontName="Courier", backColor=LGREY,
        leftIndent=8, rightIndent=8,
        spaceAfter=4, spaceBefore=4),
    "tag": s("tag",
        fontSize=9, leading=12, textColor=GREEN,
        fontName="Helvetica", spaceAfter=3),
    "label": s("label",
        fontSize=9, leading=12, textColor=GOLD,
        fontName="Helvetica-Bold", spaceAfter=2),
    "note": s("note",
        fontSize=9, leading=13, textColor=GREY,
        fontName="Helvetica-Oblique", spaceAfter=4),
    "footer": s("footer",
        fontSize=8, textColor=GREY,
        alignment=TA_CENTER, fontName="Helvetica"),
}

# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────
def hr(color=MGREY, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness,
                      color=color, spaceAfter=6, spaceBefore=6)

def sp(h=6):
    return Spacer(1, h)

def p(text, style="body"):
    # Markdown bold (**text**) → <b>text</b>
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`(.+?)`', r'<font face="Courier">\1</font>', text)
    # Gereksiz markdown karakterleri temizle
    text = text.replace("──", "—").replace("├─►", "→").replace("└─►", "→")
    text = text.replace("├─", "  •").replace("└─", "  •")
    return Paragraph(text, ST[style])

def section_box(title, content_items, bg=LGREY, border=RED):
    """Başlıklı kutu bloğu"""
    items = [p(title, "h3")] + content_items
    data = [[item] for item in items]
    t = Table(data, colWidths=[W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX",        (0,0), (-1,-1), 1, border),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
    ]))
    return t

def kv_table(rows, col_ratio=(0.35, 0.65)):
    """İki sütunlu anahtar-değer tablosu"""
    cw = [W*col_ratio[0], W*col_ratio[1]]
    data = [[p(f"<b>{k}</b>", "body_l"), p(v, "body_l")] for k,v in rows]
    t = Table(data, colWidths=cw)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), LGREY),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
    ]))
    return t

def header_table(cols, col_widths=None):
    """Başlıklı grid tablosu"""
    cw = col_widths or [W/len(cols)]*len(cols)
    data = [[p(f"<b>{c}</b>", "body_l") for c in cols]]
    return data, cw

def full_table(data, col_widths, header_rows=1):
    t = Table(data, colWidths=col_widths)
    style = [
        ("BACKGROUND", (0,0), (-1, header_rows-1), RED),
        ("TEXTCOLOR",  (0,0), (-1, header_rows-1), colors.white),
        ("FONTNAME",   (0,0), (-1, header_rows-1), "Helvetica-Bold"),
        ("FONTSIZE",   (0,0), (-1, header_rows-1), 9),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("ROWBACKGROUNDS", (0, header_rows), (-1,-1), [colors.white, LGREY]),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
        ("FONTSIZE",   (0,1), (-1,-1), 9),
    ]
    t.setStyle(TableStyle(style))
    return t

# ══════════════════════════════════════════════════════════════════════════════
# İÇERİK OLUŞTURMA
# ══════════════════════════════════════════════════════════════════════════════
story = []

# ── KAPAK SAYFASI ─────────────────────────────────────────────────────────────
story.append(sp(60))
story.append(p("📌  Pinterest × Amazon × Printify", "cover_title"))
story.append(sp(4))
story.append(p("Tam Strateji Rehberi — 2026", "cover_sub"))
story.append(sp(8))
story.append(hr(RED, 2))
story.append(sp(8))
story.append(p("Print-on-Demand • Amazon Affiliate • Pinterest SEO", "cover_sub"))
story.append(sp(16))
story.append(p("Bu rehber; Pinterest board SEO optimizasyonu, Amazon affiliate ürün stratejisi,\nPrintify tasarım konseptleri ve tam otomasyon sistemini kapsar.\nKodlama bilgisi gerekmez — her adım açık ve uygulanabilir.", "body"))
story.append(sp(24))
story.append(p("Hazırlayan: Claude (Anthropic)  •  Mart 2026", "cover_date"))
story.append(sp(4))
story.append(p("Kaynak: Pinterest Predicts 2026 • Printify Trend Report • Amazon Associates", "note"))

# ── BÖLÜM 1: STRATEJİ HARİTASI ────────────────────────────────────────────────
story.append(sp(20))
story.append(hr(RED, 1.5))
story.append(p("1. Genel Strateji & Sistem Haritası", "h1"))

story.append(p("Pinterest bir sosyal medya platformu değil, bir <b>görsel arama motorudur</b>. Kullanıcıların %80'i Pinterest'te gördükleri ürünü satın alıyor. Pinler yıllarca trafik üretmeye devam eder — Instagram veya TikTok'un aksine.", "body"))

story.append(sp(6))
data, cw = header_table(["Bileşen", "Araç", "Gelir Kaynağı"])
rows = [
    [p("Pinterest", "body_l"), p("Pinler + Board'lar", "body_l"), p("Trafik & Keşif", "body_l")],
    [p("Amazon Affiliate", "body_l"), p("Associates + Storefront", "body_l"), p("Komisyon %1-%10", "body_l")],
    [p("Printify POD", "body_l"), p("Pop-Up Store", "body_l"), p("Ürün Satış Karı", "body_l")],
    [p("Tasarım", "body_l"), p("Canva + Mockups", "body_l"), p("Pin görseli + Ürün", "body_l")],
    [p("Otomasyon", "body_l"), p("Tailwind + Make.com", "body_l"), p("Zaman tasarrufu", "body_l")],
]
story.append(full_table(data + rows, cw))

story.append(sp(10))
story.append(p("Neden Pinterest?", "h3"))
bullets = [
    "465 milyon+ aylık aktif kullanıcı",
    "Kullanıcıların %35'inin yıllık geliri $75,000+ (yüksek satın alma gücü)",
    "Pinler 2-3 yıl boyunca organik trafik üretir",
    "Amazon affiliate linkleri doğrudan pin'e eklenebilir",
    "Pinterest'te video pinler statik pinlere göre 2-3x daha fazla görüntülenir",
]
for b in bullets:
    story.append(p(f"• {b}", "bullet"))

# ── BÖLÜM 2: PINTEREST BOARD YAPISI ───────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("2. Pinterest Board Yapısı — SEO Uyumlu", "h1"))
story.append(p("Aşağıdaki board isimlerini ve açıklamalarını <b>birebir kopyala</b> Pinterest'e yapıştır. Her board için belirtilen kategoriyi seç.", "body"))

# Amazon Boards
story.append(sp(6))
story.append(p("A. Amazon Affiliate Boardları (10 Board)", "h2"))

amazon_boards = [
    ("1", "Home Office Desk Setup Ideas & Essentials",
     "Discover the best home office desk setup ideas, ergonomic accessories, and must-have essentials for productivity. From monitor stands to cable organizers — shop the best Amazon finds for your dream workspace.",
     "#homeoffice #desksetup #workfromhome", "Home Decor"),
    ("2", "Amazon Finds Under $50 — Home & Kitchen",
     "The best budget-friendly Amazon finds for your home and kitchen. Discover highly-rated products under $50 that make everyday life easier, cozier, and more organized. Updated weekly with new finds!",
     "#amazonfavorites #amazonfinds #homekitchen", "Home Improvement"),
    ("3", "Gift Ideas for Her — Amazon Gifts She'll Love",
     "Unique and thoughtful gift ideas for women available on Amazon. From luxury beauty sets to cozy home accessories — find the perfect gift for birthdays, Christmas, Valentine's Day, and Mother's Day.",
     "#giftideasforher #amazongifts #birthdaygifts", "Gifts"),
    ("4", "Self Care & Wellness Gifts — Amazon Beauty Picks",
     "Explore the best self-care products, wellness essentials, and beauty picks on Amazon. From skincare routines to relaxation kits — elevate your daily ritual with our curated Amazon favorites.",
     "#selfcare #wellnessgifts #amazonbeauty", "Health & Beauty"),
    ("5", "Pet Lover Gifts — Best Amazon Products for Dogs & Cats",
     "The best Amazon products for dog and cat lovers. Discover unique pet gifts, stylish accessories, and must-have essentials for your furry friends and the people who love them.",
     "#petgifts #doglovers #catlovers #amazonpets", "Animals"),
    ("6", "Cozy Home Decor Ideas — Amazon Home Finds 2026",
     "Transform your space with cozy, aesthetic home decor ideas found on Amazon. From maximalist color palettes to vintage-inspired accents — shop the trending home decor items of 2026.",
     "#homedecor #cozyaesthetic #amazondecor", "Home Decor"),
    ("7", "Amazon Storefront — My Favorite Picks",
     "Welcome to my Amazon Storefront! Here you'll find all my personally curated favorite products — from home essentials to beauty must-haves. Everything I love, all in one place.",
     "#mystorefront #amazonstore #amazonpicks", "Shopping"),
    ("8", "Stationery & Pen Pal Ideas — Letter Writing Aesthetic",
     "Discover beautiful stationery, pen pal letter ideas, and letter writing accessories. Aesthetic wax seals, vintage stamps, and handwritten letter kits — perfect gifts for stationery lovers.",
     "#stationery #penpal #letterwriting #snailmail", "DIY & Crafts"),
    ("9", "Trending Gift Guide — Amazon Best Sellers 2026",
     "The ultimate gift guide featuring Amazon's best sellers and trending products of 2026. Find the perfect gift for any occasion — birthdays, holidays, anniversaries, and more. Updated regularly!",
     "#giftguide #amazongiftguide #bestgifts2026", "Gifts"),
    ("10", "Fragrance & Perfume Collection — Scent Layering Ideas",
     "Explore the art of fragrance layering with niche perfumes, luxury scents, and budget-friendly fragrance finds on Amazon. Build your perfect scent wardrobe in 2026.",
     "#perfume #fragrancelayering #nicheperfume #scentwardrobe", "Beauty"),
]

for num, title, desc, tags, cat in amazon_boards:
    data = [
        [p(f"<b>Board {num}</b>", "body_l"), p(f"<b>{title}</b>", "body_l")],
        [p("Açıklama:", "label"), p(desc, "body_l")],
        [p("Hashtagler:", "label"), p(tags, "tag")],
        [p("Kategori:", "label"), p(cat, "body_l")],
    ]
    t = Table(data, colWidths=[W*0.18, W*0.82])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), LGREY),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#FFEEF0")),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
        ("FONTSIZE",   (0,0), (-1,-1), 9),
    ]))
    story.append(KeepTogether([t, sp(5)]))

# Printify Boards
story.append(sp(6))
story.append(p("B. Printify Pop-Up Store Boardları (5 Board)", "h2"))

printify_boards = [
    ("11", "Custom Gifts & Personalized Products — Printify Store",
     "Shop unique, handcrafted custom gifts and personalized products. From custom mugs and tote bags to one-of-a-kind apparel — find a gift that truly speaks from the heart.",
     "#customgifts #personalizedgifts #uniquegifts", "Gifts"),
    ("12", "Aesthetic Mugs & Funny Coffee Cups — Custom Drinkware",
     "Discover aesthetic, funny, and inspirational custom mugs and coffee cups. Perfect gifts for coffee lovers, best friends, coworkers, and birthdays. Made with love, shipped to your door.",
     "#custommug #coffeelovers #funnymug #aestheticmug", "Food & Drink"),
    ("13", "Motivational Quote Apparel — Inspirational T-Shirts & Hoodies",
     "Wear your mindset. Shop motivational quote t-shirts, hoodies, and sweatshirts with bold, aesthetic designs. Perfect for gym, everyday wear, or gifting someone who needs inspiration.",
     "#motivationalshirts #inspirationalquotes #customhoodie #aesthetic", "Fashion"),
    ("14", "Tote Bag Aesthetic — Cute Custom Tote Bags",
     "Shop the cutest, most aesthetic custom tote bags. From bookish designs to floral prints and funny quotes — our tote bags are perfect for shopping, beach days, and everyday use.",
     "#totebag #cutetotebag #bookbag #aesthetictote", "Fashion"),
    ("15", "Boho & Maximalist Home Decor — Printify Wall Art",
     "Elevate your space with boho, maximalist, and afrocentric wall art prints. Explore our collection of colorful, personality-packed home decor pieces — printed on demand, shipped worldwide.",
     "#bohodecor #wallart #maximalist #homedecorprints", "Home Decor"),
]

for num, title, desc, tags, cat in printify_boards:
    data = [
        [p(f"<b>Board {num}</b>", "body_l"), p(f"<b>{title}</b>", "body_l")],
        [p("Açıklama:", "label"), p(desc, "body_l")],
        [p("Hashtagler:", "label"), p(tags, "tag")],
        [p("Kategori:", "label"), p(cat, "body_l")],
    ]
    t = Table(data, colWidths=[W*0.18, W*0.82])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), LGREY),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#E8F5E9")),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
        ("FONTSIZE",   (0,0), (-1,-1), 9),
    ]))
    story.append(KeepTogether([t, sp(5)]))

# ── BÖLÜM 3: TREND ANAHTAR KELİMELER ──────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("3. 2026 Trend Anahtar Kelimeleri", "h1"))
story.append(p("Pinterest Predicts 2026 resmi raporundan alınan veriler. Bu trendler milyarlarca arama analizine dayanır ve %88 doğruluk oranına sahiptir.", "body"))

story.append(sp(6))
data, cw = header_table(["Kategori", "Anahtar Kelimeler", "Trend"], [W*0.2, W*0.55, W*0.25])
trend_rows = [
    [p("Home Decor", "body_l"), p("cozy home decor, maximalist decor, afrobohemian, bold colors", "body_l"), p("+220% Arama", "body_l")],
    [p("Beauty", "body_l"), p("fragrance layering, niche perfume, skincare routine, luxury beauty", "body_l"), p("+500% Arama", "body_l")],
    [p("Stationery", "body_l"), p("pen pal ideas, letter writing, wax seal, snail mail gifts", "body_l"), p("+180% Arama", "body_l")],
    [p("Fashion", "body_l"), p("80s fashion, glamoratti aesthetic, sculptural jewelry, baggy suits", "body_l"), p("+150% Arama", "body_l")],
    [p("Gifts", "body_l"), p("gift ideas for her, birthday gifts, personalized gifts", "body_l"), p("Evergreen", "body_l")],
    [p("Wellness", "body_l"), p("self care routine, wellness gifts, gut health, cozy rituals", "body_l"), p("+120% Arama", "body_l")],
    [p("Pets", "body_l"), p("dog mom gifts, cat lover gifts, custom pet products", "body_l"), p("Evergreen", "body_l")],
    [p("Travel", "body_l"), p("adventure travel, Scotland aesthetic, Iceland aesthetic", "body_l"), p("+90% Arama", "body_l")],
    [p("Food", "body_l"), p("cabbage recipes, gut health food, fermented foods", "body_l"), p("+200% Arama", "body_l")],
    [p("Nail Art", "body_l"), p("nail inspiration 2026, spring nails, summer nail ideas", "body_l"), p("Evergreen", "body_l")],
]
story.append(full_table(data + trend_rows, cw))

story.append(sp(8))
story.append(p("Anahtar Kelime Formülü:", "h3"))
story.append(p("[Sıfat] + [Ürün/Konu] + [Kullanım/Kişi] + [Yıl]", "code"))
examples = [
    '"Cozy Home Office Desk Setup Ideas 2026"',
    '"Best Amazon Gifts for Dog Moms Under $50"',
    '"Aesthetic Custom Mugs for Coffee Lovers"',
    '"Minimalist Fragrance Layering Guide 2026"',
    '"Boho Wall Art for Living Room Maximalist Decor"',
]
for e in examples:
    story.append(p(f"✅  {e}", "bullet"))

# ── BÖLÜM 4: AMAZON AFFİLİATE STRATEJİSİ ─────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("4. Amazon Affiliate Ürün Stratejisi", "h1"))
story.append(p("Amazon Associates'te en yüksek komisyon veren kategoriler ve ürün seçim kriterleri.", "body"))

story.append(sp(6))
cats = [
    ("Home Office Must-Haves", "%3-%8 komisyon",
     "Ergonomik laptop standı ($25-45) • LED masa lambası ($30-60) • HD Webcam ($40-80) • Kablo düzenleyici ($15-30) • Beyaz gürültü makinesi ($35-65) • Mouse pad geniş ($20-45) • Aromaterapi difüzör ($25-55)"),
    ("Gift Ideas for Her", "%4-%10 komisyon",
     "Wax seal kit ($20-35) • Luxury skincare set ($40-80) • Initial necklace ($25-55) • Scented candle set ($30-60) • Silk scrunchie set ($15-25) • Reading journal ($20-35) • Crystal diffuser bracelet ($20-40)"),
    ("Pet Lover Products", "%3-%8 komisyon",
     "Custom pet portrait frame ($30-60) • Dog bandana set ($15-25) • Cat window perch ($25-50) • Pet camera/monitor ($40-100) • Dog mom sweatshirt ($25-45)"),
    ("Fragrance & Beauty", "%10 komisyon (Luxury Beauty)",
     "Niche perfume starter set ($30-80) • Fragrance layering kit ($40-90) • Solid perfume set ($20-40) • Reed diffuser luxury ($25-55) • Body lotion + perfume bundle ($35-65)"),
]

for cat_name, commission, products in cats:
    data = [
        [p(f"<b>{cat_name}</b>", "body_l"), p(commission, "label")],
        [p(products, "body_l"), p("", "body_l")],
    ]
    t = Table(data, colWidths=[W*0.7, W*0.3])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#FFF3F3")),
        ("BACKGROUND", (1,0), (1,0), colors.HexColor("#FFEEF0")),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
        ("SPAN",       (0,1), (-1,1)),
        ("FONTSIZE",   (0,0), (-1,-1), 9),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
    ]))
    story.append(KeepTogether([t, sp(5)]))

story.append(sp(6))
story.append(p("Amazon Storefront Koleksiyonları:", "h3"))
storefront = [
    ("My Home Office Favorites", "Desk setup ürünleri"),
    ("Gifts She'll Love", "Kadın hediye fikirleri"),
    ("Pet Lover Finds", "Evcil hayvan ürünleri"),
    ("Cozy Home Essentials", "Ev dekor ürünleri"),
    ("Beauty & Fragrance Picks", "Güzellik ürünleri"),
    ("Under $50 Amazon Gems", "Bütçe dostu ürünler"),
]
story.append(kv_table(storefront))

# ── BÖLÜM 5: PRİNTİFY TASARIM STRATEJİSİ ─────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("5. Printify Ürün & Tasarım Stratejisi", "h1"))

products_design = [
    {
        "name": "Classic Mug (11oz & 15oz)",
        "why": "En düşük üretim maliyeti, en yüksek kar marjı. Evergreen hediye.",
        "price": "Maliyet ~$4-7 → Satış: $16.99-$21.99",
        "designs": [
            ("Konsept A — Coffee Lover Humor", 'Siyah arka plan, beyaz yazı: "But First, Coffee" | Font: Montserrat Bold | Renk: Siyah/Krem'),
            ("Konsept B — Motivational Morning", '"You\'ve Got This" | Font: Playfair Display italic | Renk: Beyaz mug + sage green'),
            ("Konsept C — Sassy & Funny", '"I Survived Another Meeting That Could\'ve Been an Email" | Font: Pacifico | Lacivert mug'),
            ("Konsept D — Plant/Dog/Cat Mom", 'İllüstrasyon + yazı | Renk: Seramik beyaz + yeşil detay'),
        ]
    },
    {
        "name": "Canvas Tote Bag (Klasik & Zipperli)",
        "why": "Sürdürülebilirlik trendi + book lover kitlesi. En hızlı büyüyen segment.",
        "price": "Maliyet ~$8-12 → Satış: $22.99-$28.99",
        "designs": [
            ("Konsept A — Book Lover", '"Not All Those Who Wander Are Lost" | Serif font + kitap illüstrasyonu | Natural canvas'),
            ("Konsept B — Manifesting", '"She Believed She Could So She Did" | Gold handwritten | Siyah tote'),
            ("Konsept C — Plant Lover", '"Plant Lady is the New Cat Lady" | Yaprak desen | Krem + yeşil'),
            ("Konsept D — Pen Pal Aesthetic", '"Snail Mail Fan Club" | Zarf & pul illüstrasyonu | Pastel pembe'),
        ]
    },
    {
        "name": "Unisex Hoodie (Premium)",
        "why": "En yüksek ortalama sipariş değeri (AOV). Soğuk mevsim trendi.",
        "price": "Maliyet ~$18-25 → Satış: $44.99-$54.99",
        "designs": [
            ("Konsept A — Minimal Aesthetic", '"Soft Life Era" | Küçük göğüs cep baskısı | Lavender, Sage Green, Dusty Rose'),
            ("Konsept B — Motivational Sırt", '"Your Only Limit Is You" | Blok harfler | Siyah hoodie + beyaz baskı'),
            ("Konsept C — Nature & Wellness", '"Bloom Where You Are Planted" | Botanical illüstrasyon | Krem + forest green'),
        ]
    },
    {
        "name": "Sticker Pack (5'li Set)",
        "why": "En ucuz ürün → en yüksek impulse buy → AOV arttırıcı.",
        "price": "Maliyet ~$3-5 set → Satış: $8.99-$12.99",
        "designs": [
            ("Konsept A — Aesthetic Life 5'li", '"Main Character Energy" • "Slay" • "Soft Life" • "She\'s a 10" • "Manifesting"'),
            ("Konsept B — Coffee & Books 5'li", '"Espresso Yourself" • "One More Chapter" • "Bookish" • "Night Owl Reader" • "Tea > Everything"'),
            ("Konsept C — Plant & Nature 5'li", '"Plant Mom" • "Low Maintenance Queen" • Monstera yaprağı • "Grow Wild" • Çiçek buketi'),
        ]
    },
    {
        "name": "Wall Art Print (Poster/Çerçeveli)",
        "why": "Home decor en hızlı büyüyen POD kategorisi (%24 CAGR). Yüksek kar marjı.",
        "price": "Maliyet ~$6-15 → Satış: $24.99-$49.99",
        "designs": [
            ("Konsept A — Maximalist Bold", '"Life is too short for boring walls" | Renkli bold tipografi | Royal Blue + Magenta + Gold'),
            ("Konsept B — Botanical Print", 'Vintage bitki illüstrasyonu | Siyah çerçeve | Beyaz arka plan | "Botanical Study No. 1"'),
            ("Konsept C — Afrobohemian", 'Afrika motifli geometrik desen | Terracotta + Ocher + Cream | Premium mat baskı'),
        ]
    },
]

for prod in products_design:
    story.append(sp(8))
    story.append(p(f"ÜRÜN: {prod['name']}", "h2"))
    story.append(kv_table([
        ("Neden?", prod["why"]),
        ("Fiyat:", prod["price"]),
    ]))
    story.append(sp(4))
    for dname, ddesc in prod["designs"]:
        data = [[p(f"<b>{dname}</b>", "body_l")], [p(ddesc, "body_l")]]
        t = Table(data, colWidths=[W])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), LGREY),
            ("BACKGROUND", (0,1), (-1,1), colors.white),
            ("BOX",        (0,0), (-1,-1), 0.3, MGREY),
            ("LEFTPADDING",  (0,0), (-1,-1), 8),
            ("RIGHTPADDING", (0,0), (-1,-1), 8),
            ("TOPPADDING",   (0,0), (-1,-1), 3),
            ("BOTTOMPADDING",(0,0), (-1,-1), 3),
            ("FONTSIZE",   (0,0), (-1,-1), 9),
        ]))
        story.append(KeepTogether([t, sp(3)]))

# ── BÖLÜM 6: PIN ŞABLONLARİ ───────────────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("6. SEO Uyumlu Pin Şablonları — Kopyala & Kullan", "h1"))
story.append(p("Aşağıdaki şablonları Pinterest'e pin eklerken kullan. [LİNK BURAYA] yazan yerlere kendi linkini yapıştır.", "body"))

pin_templates = [
    {
        "title": "PIN A1 — Home Office Setup (Amazon)",
        "baslik": "My Minimalist Home Office Desk Setup — Amazon Finds 2026",
        "aciklama": "Upgrade your work-from-home setup with these must-have Amazon finds! From ergonomic monitor stands to cozy desk lamps, I've curated the best home office essentials that are actually worth the price. Everything is linked directly below — all available on Amazon! Prices start from just $15. Perfect for remote workers, students, and anyone who wants a productive and aesthetic workspace.\n\n👉 Shop through my Amazon Storefront: [LİNK BURAYA]\n\n(This post contains affiliate links.)",
        "tags": "#homeoffice #desksetup #workfromhome #amazonfinds #homeofficeinspo #remotework #deskorganization #minimalistdesk #amazondeals #wfhsetup",
        "board": "Home Office Desk Setup Ideas & Essentials",
    },
    {
        "title": "PIN A2 — Gift Ideas for Her (Amazon)",
        "baslik": "10 Thoughtful Amazon Gifts for Her Under $50 (She'll Actually Love)",
        "aciklama": "Struggling to find the perfect gift? Here are 10 amazing Amazon gift ideas for women that are thoughtful, practical, and beautiful — all under $50! From luxurious skincare sets to cozy home essentials, these gifts are perfect for birthdays, Christmas, Valentine's Day, and any special occasion.\n\nAll items are linked below — just click the image!\n(Affiliate links — I earn a small commission at no extra cost to you.)",
        "tags": "#giftideasforher #amazongifts #giftguide #birthdaygifts #giftsforwomen #christmasgifts #valentinesdaygifts #thoughtfulgifts #amazonfinds #giftinspo",
        "board": "Gift Ideas for Her — Amazon Gifts She'll Love",
    },
    {
        "title": "PIN A3 — Fragrance (Amazon)",
        "baslik": "Fragrance Layering Guide 2026 — Niche Perfume Picks on Amazon",
        "aciklama": "The hottest beauty trend of 2026 is HERE — fragrance layering! Create your signature scent by combining two or more perfumes. Here are my top Amazon picks for building a stunning scent wardrobe, all with thousands of 5-star reviews. Most under $60!\n\nShop the full list through my Amazon link below.\n(Affiliate links — I earn a small commission at no extra cost to you.)",
        "tags": "#fragrancelayering #perfumecollection #nicheperfume #beautyfinds #amazonfragrance #scentwardrobe #luxurybeauty #fragrancecommunity #amazonbeauty",
        "board": "Fragrance & Perfume Collection — Scent Layering Ideas",
    },
    {
        "title": "PIN P1 — Custom Mug (Printify)",
        "baslik": "Funny Coffee Mug Gift Idea — Perfect for Coffee Lovers",
        "aciklama": "This custom coffee mug is the gift that keeps on giving! Whether it's for your best friend, your coworker, or yourself — this funny mug will make every morning better.\n\n✅ High-quality ceramic\n✅ Dishwasher & microwave safe\n✅ Ships worldwide\n✅ Multiple sizes: 11oz & 15oz\n\n🛍️ Order here: [PRİNTİFY MAĞAZA LİNKİ]",
        "tags": "#custommug #funnymug #coffeelovers #coffeemug #giftideas #birthdaygift #muglover #coffeeaddict #customgifts #mugsofpinterest",
        "board": "Aesthetic Mugs & Funny Coffee Cups — Custom Drinkware",
    },
    {
        "title": "PIN P2 — Tote Bag (Printify)",
        "baslik": "Aesthetic Canvas Tote Bag for Book Lovers — Custom & Unique",
        "aciklama": "For everyone who believes a good book and a great tote bag go hand in hand!\n\nOur custom canvas tote bags are:\n✅ Durable, eco-friendly canvas\n✅ Perfect for books, groceries, beach days\n✅ Multiple designs available\n✅ Flat shipping — worldwide delivery\n\n🛍️ Shop here: [PRİNTİFY MAĞAZA LİNKİ]",
        "tags": "#totebag #booklover #aesthetictote #canvastotebag #bookish #readeraesthetic #libraryaesthetic #customtote #ecofriendly #booktok #totebagcollection",
        "board": "Tote Bag Aesthetic — Cute Custom Tote Bags",
    },
    {
        "title": "PIN P3 — Hoodie (Printify)",
        "baslik": "Aesthetic Minimalist Hoodie — 'Soft Life Era' — Custom Apparel",
        "aciklama": "Because you deserve to live your soft life in style!\n\nOur premium custom hoodies are:\n✅ Ultra-soft fleece fabric\n✅ Unisex sizing (XS - 3XL)\n✅ Sage green, dusty rose, lavender available\n✅ Made to order — no overstock, no waste\n✅ Ships worldwide in 5-10 business days\n\n🛍️ Order yours: [PRİNTİFY MAĞAZA LİNKİ]",
        "tags": "#hoodie #customhoodie #aesthetichoodie #softlife #softgirlera #comfyfashion #motivationalhoodie #minimalstyle #customprintedshirt #womensfashion #giftsforher",
        "board": "Motivational Quote Apparel — Inspirational T-Shirts & Hoodies",
    },
]

for pin in pin_templates:
    story.append(sp(8))
    story.append(p(pin["title"], "h3"))
    data = [
        [p("<b>Başlık:</b>", "label"), p(pin["baslik"], "body_l")],
        [p("<b>Açıklama:</b>", "label"), p(pin["aciklama"].replace("\n", "<br/>"), "body_l")],
        [p("<b>Hashtagler:</b>", "label"), p(pin["tags"], "tag")],
        [p("<b>Board:</b>", "label"), p(pin["board"], "body_l")],
    ]
    t = Table(data, colWidths=[W*0.18, W*0.82])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), LGREY),
        ("GRID",       (0,0), (-1,-1), 0.3, MGREY),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("VALIGN",     (0,0), (-1,-1), "TOP"),
        ("FONTSIZE",   (0,0), (-1,-1), 9),
    ]))
    story.append(KeepTogether([t, sp(5)]))

# ── BÖLÜM 7: OTOMASYON ────────────────────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("7. Otomasyon Sistemi", "h1"))

story.append(p("Araçlar ve Maliyetler:", "h2"))
tools = [
    ("Canva", "Pin görsel tasarımı", "Ücretsiz (Pro: $13/ay)"),
    ("Tailwind", "Pinterest otomatik zamanlama", "$15/ay — EN ÖNEMLİ ARAÇ"),
    ("Make.com", "Workflow otomasyonu", "Ücretsiz plan mevcut"),
    ("Pinterest Trends", "Anahtar kelime araştırması", "Ücretsiz"),
    ("Printify", "Ürün üretimi", "Ücretsiz"),
    ("Amazon Associates", "Affiliate link oluşturma", "Ücretsiz"),
]
data_h, cw = header_table(["Araç", "Kullanım", "Maliyet"], [W*0.2, W*0.5, W*0.3])
tool_rows = [[p(a, "body_l"), p(b, "body_l"), p(c, "body_l")] for a,b,c in tools]
story.append(full_table(data_h + tool_rows, cw))

story.append(sp(8))
story.append(p("Otomasyon Akışı 1: Canva → Tailwind (Ana Sistem)", "h2"))
steps1 = [
    "Canva'da haftada bir otur, 15-20 pin birden tasarla",
    'Canva içinde "Share" butonuna tıkla → "Tailwind" seç → giriş yap',
    "Her pine: başlık + açıklama + link + doğru board ekle",
    "SmartSchedule aç → Tailwind en iyi saatte otomatik paylaşır",
    "Interval Scheduling: aynı pin farklı boardlara 3-7 gün arayla yayılsın",
]
for i, s_text in enumerate(steps1, 1):
    story.append(p(f"Adım {i}: {s_text}", "bullet"))

story.append(sp(6))
story.append(p("Otomasyon Akışı 2: Make.com → Printify + Pinterest", "h2"))
story.append(p("Printify'da yeni ürün eklediğinde Pinterest'e otomatik pin gider:", "body"))
steps2 = [
    "make.com → Ücretsiz hesap aç → New Scenario",
    'Trigger: "Printify — New Product Created"',
    'Action: "Pinterest — Create Pin" (board, görsel, başlık, link)',
    "Kaydet → Artık Printify'a ürün ekler eklemez Pinterest'e pin gider!",
]
for i, s_text in enumerate(steps2, 1):
    story.append(p(f"Adım {i}: {s_text}", "bullet"))

story.append(sp(8))
story.append(p("Haftalık Çalışma Takvimi:", "h2"))
schedule = [
    ("Pazartesi (45 dk)", "Pinterest Trends kontrol • Amazon bestseller listesi • Haftalık konular belirle"),
    ("Salı (90 dk)", "Canva'da 10-15 pin tasarla • Amazon kolaj pinleri • Printify mockupları"),
    ("Çarşamba (60 dk)", "Tailwind'e pinleri yükle • Başlık/açıklama/tag ekle • Schedule"),
    ("Perşembe (30 dk)", "Analiz: hangi pin en çok tıklandı? • Bir sonraki hafta notları"),
    ("Cuma (45 dk)", "Printify: yeni tasarım • Fiyat kontrolü • Pop-Up store güncelle"),
]
story.append(kv_table(schedule))

# ── BÖLÜM 8: GELİR PROJEKSİYONU ──────────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("8. Gelir Beklentisi & Büyüme Planı", "h1"))

data_h, cw = header_table(["Dönem", "Aylık İzlenme", "Tıklama Oranı", "Tahmini Gelir"], [W*0.2, W*0.25, W*0.25, W*0.3])
income_rows = [
    [p("1-3 ay", "body_l"), p("5,000-15,000", "body_l"), p("%1-2", "body_l"), p("$50-200 / ay", "body_l")],
    [p("3-6 ay", "body_l"), p("20,000-60,000", "body_l"), p("%1-2", "body_l"), p("$200-800 / ay", "body_l")],
    [p("6-12 ay", "body_l"), p("80,000-200,000", "body_l"), p("%1-3", "body_l"), p("$500-2,000 / ay", "body_l")],
    [p("1-2 yıl", "body_l"), p("300,000-800,000", "body_l"), p("%2-3", "body_l"), p("$2,000-8,000 / ay", "body_l")],
]
story.append(full_table(data_h + income_rows, cw))

story.append(sp(8))
story.append(p("Büyüme Akseleratörleri:", "h3"))
acc = [
    "Video Pin: Statik pinlere göre 2-3x daha fazla görüntülenir — Canva'da 10-30 sn ürün videosu yap",
    "Mevsimsel İçerik: Noel için Kasım başı, Sevgililer için Ocak başı, Anneler Günü için Nisan başı",
    "Grup Board'ları: İlgili alanlardaki Pinterest grup boardlarına katıl → Erişim anında artar",
    "Tailwind Communities: Diğer üreticilerin pinlerini paylaş, onlar da seninkileri paylaşsın",
    "Rich Pin Aktif Et: Printify ürünleri için site rich pin'i aktif et → Daha yüksek CTR",
]
for a in acc:
    story.append(p(f"• {a}", "bullet"))

# ── BÖLÜM 9: BAŞLANGIÇ KONTROL LİSTESİ ───────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("9. Başlangıç Kontrol Listesi", "h1"))

checklist = [
    "Pinterest Business hesabına geç (ücretsiz)",
    "Bu rehberdeki 15 board'u oluştur (isim + açıklama + kategori)",
    "Her board'a 10-20 başlangıç pini ekle (kaydet/repin)",
    "Canva hesabı aç",
    "Tailwind deneme sürümü başlat (ücretsiz 30 gün)",
    "Amazon Storefront'unda 6 koleksiyon oluştur",
    "Printify'da ilk 3 ürünü tasarla ve yayınla",
    "Make.com ücretsiz hesap aç",
]
for item in checklist:
    story.append(p(f"☐  {item}", "bullet"))

story.append(sp(8))
story.append(p("İlk Ay Hedefi:", "h3"))
targets = [
    "100+ pin yayınla",
    "Her board'da 20+ pin olsun",
    "İlk Amazon affiliate komisyonunu kazan",
    "İlk Printify satışını yap",
]
for t_item in targets:
    story.append(p(f"☐  {t_item}", "bullet"))

# ── BÖLÜM 10: ARAÇLAR & KAYNAKLAR ─────────────────────────────────────────────
story.append(sp(12))
story.append(hr(RED, 1.5))
story.append(p("10. Araçlar & Kaynaklar", "h1"))

resources = [
    ("Canva", "canva.com", "Pin tasarımı — Ücretsiz"),
    ("Smartmockups", "smartmockups.com", "Ürün mockupları — Ücretsiz plan"),
    ("Creative Fabrica", "creativefabrica.com", "Lifestyle mockup şablonları"),
    ("Tailwind", "tailwindapp.com", "Pinterest otomatik yayınlama — $15/ay"),
    ("Pinterest Trends", "trends.pinterest.com", "Trend analizi — Ücretsiz"),
    ("Pinterest Business", "business.pinterest.com/pinterest-predicts", "Resmi trend raporları"),
    ("Make.com", "make.com", "Workflow otomasyonu — Ücretsiz plan"),
    ("Appy Pie Automate", "appypieautomate.ai", "Pinterest-Printify entegrasyon"),
    ("Printify", "printify.com", "POD ürün üretimi — Ücretsiz"),
    ("Amazon Associates", "affiliate-program.amazon.com", "Affiliate program — Ücretsiz"),
]
data_h, cw = header_table(["Araç", "URL", "Not"], [W*0.22, W*0.38, W*0.4])
res_rows = [[p(a, "body_l"), p(u, "body_l"), p(n, "body_l")] for a,u,n in resources]
story.append(full_table(data_h + res_rows, cw))

# ── KAPANIŞ ────────────────────────────────────────────────────────────────────
story.append(sp(16))
story.append(hr(RED, 2))
story.append(sp(8))
story.append(p("Pinterest bir 'yavaş oyun' platformudur. İlk 3 ayda büyük sonuç bekleme — ama 6-12 ay boyunca tutarlı çalışırsan pinlerin yıllarca sana pasif gelir getirmeye devam eder. Başlamak için en iyi zaman BUGÜNDÜR!", "body"))
story.append(sp(6))
story.append(p("Hazırlayan: Claude (Anthropic)  •  Mart 2026  •  Kaynak: Pinterest Predicts 2026, Printify Trend Report, Amazon Associates", "footer"))

# ── PDF OLUŞTUR ────────────────────────────────────────────────────────────────
doc.build(story)
print(f"PDF oluşturuldu: {OUTPUT}")
