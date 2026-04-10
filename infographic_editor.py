#!/usr/bin/env python3
"""
Infografik Metin Düzeltici & Logo Ekleyici
==========================================
Kullanım:
  python3 infographic_editor.py infografik.png --logo logo.png
  python3 infographic_editor.py infografik.png --logo logo.png --output sonuc.png
  python3 infographic_editor.py infografik.png --sadece-logo  # sadece logo ekle, metin dokunma
  python3 infographic_editor.py infografik.png --rapor-only   # hataları raporla, görüntüye dokunma
"""

import anthropic
import base64
import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io


# ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

def goruntu_base64(yol: str) -> tuple[str, str]:
    """Görüntüyü base64'e çevir, medya tipini döndür."""
    uzanti = Path(yol).suffix.lower()
    tip_map = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png",  ".webp": "image/webp", ".gif": "image/gif"
    }
    media_type = tip_map.get(uzanti, "image/png")
    with open(yol, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("utf-8")
    return data, media_type


def bolge_arka_plan_rengi(image: Image.Image, bbox: tuple) -> tuple:
    """Belirtilen bölgedeki ortalama rengi döndür (arka plan örnekleme)."""
    x1, y1, x2, y2 = bbox
    w, h = image.size
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    if x2 <= x1 or y2 <= y1:
        return (255, 255, 255)
    bolge = image.crop((x1, y1, x2, y2)).convert("RGB")
    pikseller = list(bolge.getdata())
    r = sum(p[0] for p in pikseller) // len(pikseller)
    g = sum(p[1] for p in pikseller) // len(pikseller)
    b = sum(p[2] for p in pikseller) // len(pikseller)
    return (r, g, b)


def font_bul(boyut: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Sistemde mevcut bir Türkçe uyumlu font yükle."""
    font_adaylar = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "/usr/share/fonts/truetype/open-sans/OpenSans-Regular.ttf",
    ]
    for yol in font_adaylar:
        if os.path.exists(yol):
            try:
                return ImageFont.truetype(yol, boyut)
            except Exception:
                continue
    return ImageFont.load_default()


def hex_rgb(renk: str) -> tuple:
    """Hex renk kodunu RGB tuple'a çevir."""
    renk = renk.strip()
    if renk.startswith("#") and len(renk) in (7, 9):
        try:
            r = int(renk[1:3], 16)
            g = int(renk[3:5], 16)
            b = int(renk[5:7], 16)
            return (r, g, b)
        except ValueError:
            pass
    # Yaygın renk isimleri
    renkler = {
        "black": (0,0,0), "white": (255,255,255),
        "red": (220,50,50), "blue": (50,100,200),
        "gray": (128,128,128), "grey": (128,128,128),
        "dark": (50,50,50), "darkgray": (80,80,80),
    }
    return renkler.get(renk.lower(), (51, 51, 51))


# ─── Claude ile analiz ────────────────────────────────────────────────────────

ANALIZ_PROMPT = """Bu Türkçe infografiği dikkatlice incele ve yazım hatalarını tespit et.

GÖREV:
1. Tüm metni soldan sağa, yukarıdan aşağıya oku
2. Türkçe yazım/imla hatalarını bul (yanlış harf, eksik/fazla harf, noktalama vb.)
3. NotebookLM watermark/amblem konumunu tespit et

ÇIKTI: Yalnızca aşağıdaki JSON formatında yanıt ver, başka metin ekleme:

{
  "errors": [
    {
      "wrong_text": "hatalı metin (tam olarak göründüğü gibi)",
      "correct_text": "doğru hali",
      "location": "konumu tarif et (örn: sol üst başlık, 3. madde 2. satır)",
      "x_pct": 25,
      "y_pct": 15,
      "font_size": "small",
      "text_color": "#333333",
      "bg_color": "#ffffff"
    }
  ],
  "watermark": {
    "found": true,
    "x_pct": 85,
    "y_pct": 96,
    "width_pct": 15,
    "height_pct": 4,
    "bg_color": "#f5f5f5"
  },
  "image_summary": "infografiğin kısa özeti"
}

NOT: x_pct ve y_pct değerleri görüntü genişliği/yüksekliğinin yüzdesi (0-100).
font_size: "small" (≤12px), "medium" (13-18px), "large" (19-28px), "xlarge" (>28px)
Eğer hata yoksa errors listesini boş bırak."""


def claude_ile_analiz(image_yolu: str, api_key: str = None) -> dict:
    """Claude Vision ile infografiği analiz et."""
    client = anthropic.Anthropic(api_key=api_key) if api_key else anthropic.Anthropic()
    data, media_type = goruntu_base64(image_yolu)

    print("  → Claude Vision ile analiz yapılıyor...")
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}},
                {"type": "text", "text": ANALIZ_PROMPT}
            ]
        }]
    )

    yanit = response.content[0].text.strip()

    # JSON bloğunu temizle
    if "```" in yanit:
        satirlar = yanit.split("\n")
        json_satirlar = []
        ici = False
        for satir in satirlar:
            if satir.startswith("```"):
                ici = not ici
                continue
            if ici:
                json_satirlar.append(satir)
        yanit = "\n".join(json_satirlar)

    try:
        return json.loads(yanit)
    except json.JSONDecodeError as e:
        print(f"  [!] JSON ayrıştırma hatası: {e}")
        print(f"  Ham yanıt:\n{yanit[:500]}")
        return {"errors": [], "watermark": {"found": False}, "image_summary": ""}


# ─── Görüntü işleme ───────────────────────────────────────────────────────────

def watermark_kaldir(image: Image.Image, wm_bilgi: dict) -> Image.Image:
    """NotebookLM watermark'ını arka plan rengiyle kapat."""
    w, h = image.size
    draw = ImageDraw.Draw(image)

    if wm_bilgi.get("found"):
        x = int(w * wm_bilgi.get("x_pct", 75) / 100)
        y = int(h * wm_bilgi.get("y_pct", 94) / 100)
        genislik = int(w * wm_bilgi.get("width_pct", 25) / 100)
        yukseklik = int(h * wm_bilgi.get("height_pct", 6) / 100)
        bbox = (x, y, min(w, x + genislik), min(h, y + yukseklik))
    else:
        # NotebookLM varsayılan konumu: sağ alt köşe, %75-100 x, %94-100 y
        bbox = (int(w * 0.65), int(h * 0.93), w, h)

    # Biraz daha geniş tut, tam kapansın
    bbox = (max(0, bbox[0] - 5), max(0, bbox[1] - 5), min(w, bbox[2] + 5), min(h, bbox[3] + 5))

    # Arka plan rengini örnekle
    if wm_bilgi.get("bg_color"):
        bg = hex_rgb(wm_bilgi["bg_color"])
    else:
        # Watermark'ın hemen üstünden örnekle
        ornek_bbox = (bbox[0], max(0, bbox[1] - 20), bbox[2], max(1, bbox[1]))
        bg = bolge_arka_plan_rengi(image, ornek_bbox)

    draw.rectangle(bbox, fill=bg)
    print(f"  → Watermark kaldırıldı: {bbox}, renk: {bg}")
    return image


def metin_duzelt(image: Image.Image, hatalar: list) -> tuple[Image.Image, int]:
    """Tespit edilen yazım hatalarını görüntüde düzelt."""
    if not hatalar:
        return image, 0

    w, h = image.size
    draw = ImageDraw.Draw(image)
    duzeltilen = 0

    boyut_map = {"small": 11, "medium": 15, "large": 21, "xlarge": 28}

    for hata in hatalar:
        yanlis = hata.get("wrong_text", "").strip()
        dogru  = hata.get("correct_text", "").strip()

        if not yanlis or not dogru or yanlis == dogru:
            continue

        x_pct = hata.get("x_pct", 50)
        y_pct = hata.get("y_pct", 50)
        font_boyut = boyut_map.get(hata.get("font_size", "medium"), 15)

        x = int(w * x_pct / 100)
        y = int(h * y_pct / 100)

        # Kapsama alanı hesapla
        karakter_genisligi = font_boyut * 0.62
        metin_genisligi = int(len(yanlis) * karakter_genisligi)
        metin_yuksekligi = int(font_boyut * 1.5)

        # Arka plan rengini örnekle
        ornek_bbox = (
            max(0, x - 3), max(0, y - 3),
            min(w, x + metin_genisligi + 6), min(h, y + metin_yuksekligi + 6)
        )
        if hata.get("bg_color"):
            bg = hex_rgb(hata["bg_color"])
        else:
            bg = bolge_arka_plan_rengi(image, ornek_bbox)

        # Hatalı metni kapat
        kapat_bbox = (max(0, x-2), max(0, y-2),
                      min(w, x + metin_genisligi + 4), min(h, y + metin_yuksekligi + 4))
        draw.rectangle(kapat_bbox, fill=bg)

        # Doğru metni yaz
        metin_rengi = hex_rgb(hata.get("text_color", "#333333"))
        try:
            pil_font = font_bul(font_boyut)
            draw.text((x, y), dogru, font=pil_font, fill=metin_rengi)
            print(f"  ✓ '{yanlis}' → '{dogru}' [{hata.get('location', '')}]")
            duzeltilen += 1
        except Exception as e:
            print(f"  ✗ Metin yazma hatası: {e}")

    return image, duzeltilen


def logo_ekle(image: Image.Image, logo_yolu: str,
              konum: str = "bottom_right",
              max_boyut: int = 80,
              kenar_bosluk: int = 12) -> Image.Image:
    """Görüntüye logo ekle (RGBA compositing ile)."""
    logo = Image.open(logo_yolu).convert("RGBA")
    logo.thumbnail((max_boyut, max_boyut), Image.Resampling.LANCZOS)

    w, h = image.size
    lw, lh = logo.size

    konum_map = {
        "bottom_right": (w - lw - kenar_bosluk, h - lh - kenar_bosluk),
        "bottom_left":  (kenar_bosluk,            h - lh - kenar_bosluk),
        "top_right":    (w - lw - kenar_bosluk,   kenar_bosluk),
        "top_left":     (kenar_bosluk,             kenar_bosluk),
    }
    lx, ly = konum_map.get(konum, konum_map["bottom_right"])

    # RGBA compositing
    base = image.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    overlay.paste(logo, (lx, ly), logo)
    sonuc = Image.alpha_composite(base, overlay)

    print(f"  → Logo eklendi: {konum} ({lx},{ly}), boyut {lw}×{lh}px")
    return sonuc


# ─── Ana işlev ────────────────────────────────────────────────────────────────

def infografik_isle(
    image_yolu: str,
    logo_yolu: str = None,
    cikti_yolu: str = None,
    api_key: str = None,
    metin_duzelt_flag: bool = True,
    watermark_sil_flag: bool = True,
    rapor_only: bool = False,
    logo_konum: str = "bottom_right",
    logo_boyut: int = 80,
) -> str:
    """Infografiği işle: hataları düzelt, logo ekle, watermark kaldır."""

    print(f"\n{'─'*55}")
    print(f"  Infografik Editörü")
    print(f"{'─'*55}")
    print(f"  Girdi : {image_yolu}")

    if not os.path.exists(image_yolu):
        raise FileNotFoundError(f"Dosya bulunamadı: {image_yolu}")

    # Çıktı yolunu belirle
    if cikti_yolu is None:
        p = Path(image_yolu)
        cikti_yolu = str(p.parent / f"{p.stem}_duzeltilmis{p.suffix}")
    print(f"  Çıktı : {cikti_yolu}\n")

    # Görüntüyü yükle
    image = Image.open(image_yolu)
    orijinal_mod = image.mode
    print(f"  Boyut : {image.size[0]}×{image.size[1]}px, Mod: {orijinal_mod}")

    # Claude analizi
    analiz = {"errors": [], "watermark": {"found": False}, "image_summary": ""}
    if metin_duzelt_flag or watermark_sil_flag:
        try:
            analiz = claude_ile_analiz(image_yolu, api_key)
            ozet = analiz.get("image_summary", "")
            if ozet:
                print(f"  Özet  : {ozet}")
            print(f"  Hata  : {len(analiz.get('errors', []))} yazım hatası tespit edildi")
        except Exception as e:
            print(f"  [!] Claude analiz hatası: {e}")

    # Sadece rapor modunda
    if rapor_only:
        print(f"\n{'─'*55}")
        print("  YAZIM HATASI RAPORU")
        print(f"{'─'*55}")
        hatalar = analiz.get("errors", [])
        if not hatalar:
            print("  Hata bulunamadı veya tespit edilemedi.")
        for i, h in enumerate(hatalar, 1):
            print(f"\n  {i}. HATA:")
            print(f"     Yanlış  : '{h.get('wrong_text', '')}'")
            print(f"     Doğrusu : '{h.get('correct_text', '')}'")
            print(f"     Konum   : {h.get('location', 'belirtilmedi')}")
        wm = analiz.get("watermark", {})
        print(f"\n  NotebookLM watermark: {'Bulundu' if wm.get('found') else 'Bulunamadı'}")
        return ""

    # RGB'ye çevir (işlem için)
    if image.mode == "P":
        image = image.convert("RGBA")
    working = image.convert("RGB")

    # Watermark kaldır
    if watermark_sil_flag:
        print("\n[1] Watermark kaldırma...")
        working = watermark_kaldir(working, analiz.get("watermark", {"found": False}))

    # Metin düzeltme
    if metin_duzelt_flag and analiz.get("errors"):
        print(f"\n[2] Metin düzeltme ({len(analiz['errors'])} hata)...")
        working, n = metin_duzelt(working, analiz["errors"])
        print(f"  → {n} hata başarıyla düzeltildi")
    elif metin_duzelt_flag:
        print("\n[2] Metin düzeltme: Hata bulunamadı, atlandı.")

    # Logo ekle
    if logo_yolu and os.path.exists(logo_yolu):
        print(f"\n[3] Logo ekleme...")
        working_rgba = working.convert("RGBA")
        result = logo_ekle(working_rgba, logo_yolu, konum=logo_konum, max_boyut=logo_boyut)
        # Orijinal moda geri dön
        if orijinal_mod == "RGB" or orijinal_mod == "P":
            working = result.convert("RGB")
        else:
            working = result
    elif logo_yolu:
        print(f"\n[3] Logo: '{logo_yolu}' bulunamadı, atlandı.")

    # Kaydet
    print(f"\n[4] Kaydediliyor...")
    working.save(cikti_yolu, quality=95, optimize=True)
    boyut_kb = os.path.getsize(cikti_yolu) // 1024
    print(f"  → Kaydedildi: {cikti_yolu} ({boyut_kb} KB)")
    print(f"\n{'─'*55}\n")

    return cikti_yolu


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Infografik metin düzeltici & logo ekleyici",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  # Tam işlem (hata düzelt + watermark kaldır + logo ekle)
  python3 infographic_editor.py infografik.png --logo logo.png

  # Birden fazla dosya
  python3 infographic_editor.py *.png --logo logo.png

  # Sadece logo ekle (metin dokunma)
  python3 infographic_editor.py infografik.png --logo logo.png --sadece-logo

  # Hataları raporla, görüntüye dokunma
  python3 infographic_editor.py infografik.png --rapor

  # Logo konumunu değiştir
  python3 infographic_editor.py infografik.png --logo logo.png --logo-konum bottom_left

  # API anahtarını elle belirt
  python3 infographic_editor.py infografik.png --logo logo.png --api-key sk-ant-...
        """
    )
    parser.add_argument("images", nargs="+", help="İşlenecek infografik dosya(lar)ı")
    parser.add_argument("--logo", "-l", help="Eklenecek logo (PNG önerilir)")
    parser.add_argument("--output", "-o", help="Çıktı dosyası (tek dosya için)")
    parser.add_argument("--logo-konum", default="bottom_right",
                        choices=["bottom_right", "bottom_left", "top_right", "top_left"],
                        help="Logonun konumu (varsayılan: bottom_right)")
    parser.add_argument("--logo-boyut", type=int, default=80,
                        help="Logonun maksimum boyutu piksel cinsinden (varsayılan: 80)")
    parser.add_argument("--sadece-logo", action="store_true",
                        help="Sadece logo ekle, metin düzeltme ve watermark silme yapma")
    parser.add_argument("--rapor", action="store_true",
                        help="Sadece hata raporu oluştur, görüntüyü değiştirme")
    parser.add_argument("--watermark-koru", action="store_true",
                        help="NotebookLM watermark'ını koruyup silme")
    parser.add_argument("--api-key", help="Anthropic API anahtarı (ANTHROPIC_API_KEY env var da çalışır)")

    args = parser.parse_args()

    for image_yolu in args.images:
        if not os.path.exists(image_yolu):
            print(f"[!] Dosya bulunamadı, atlandı: {image_yolu}")
            continue
        try:
            infografik_isle(
                image_yolu=image_yolu,
                logo_yolu=args.logo,
                cikti_yolu=args.output if len(args.images) == 1 else None,
                api_key=args.api_key,
                metin_duzelt_flag=not args.sadece_logo,
                watermark_sil_flag=not args.watermark_koru and not args.sadece_logo,
                rapor_only=args.rapor,
                logo_konum=args.logo_konum,
                logo_boyut=args.logo_boyut,
            )
        except Exception as e:
            print(f"[!] Hata ({image_yolu}): {e}")
            import traceback; traceback.print_exc()


if __name__ == "__main__":
    main()
