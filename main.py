"""
Amazon Storefront → Pinterest Kombin Görselleri

Kullanım:
  python3 main.py <amazon_storefront_url>
  python3 main.py --json products.json        # Önceden kaydedilmiş JSON kullan
  python3 main.py --help
"""

import sys
import os
import json
import argparse

from scraper import scrape_storefront, save_products_to_json, load_products_from_json
from outfit_generator import generate_outfits
from image_creator import create_all_pins


def main():
    parser = argparse.ArgumentParser(
        description="Amazon storefront → Pinterest PIN görselleri"
    )
    parser.add_argument(
        "url",
        nargs="?",
        help="Amazon storefront URL (örn: https://www.amazon.com.tr/shop/kullanici)",
    )
    parser.add_argument(
        "--json",
        metavar="FILE",
        help="Ürünleri URL yerine JSON dosyasından yükle",
    )
    parser.add_argument(
        "--output", "-o",
        default="output",
        help="PNG çıktı klasörü (varsayılan: output)",
    )
    parser.add_argument(
        "--max-outfits",
        type=int,
        default=5,
        help="Maksimum kombin sayısı (varsayılan: 5)",
    )
    parser.add_argument(
        "--save-products",
        action="store_true",
        help="Scrape edilen ürünleri products.json olarak kaydet",
    )

    args = parser.parse_args()

    if not args.url and not args.json:
        parser.print_help()
        print("\nÖrnek:\n  python3 main.py https://www.amazon.com.tr/shop/kullaniciadi")
        sys.exit(1)

    # ── 1. Ürünleri yükle ─────────────────────────────────────────────
    if args.json:
        print(f"Ürünler JSON'dan yükleniyor: {args.json}")
        products = load_products_from_json(args.json)
    else:
        print(f"Amazon storefront taranıyor: {args.url}")
        products = scrape_storefront(args.url)

        if not products:
            print("\n⚠  Ürün bulunamadı.")
            print("   Amazon sayfası JavaScript gerektiriyor olabilir.")
            print("   Alternatif: Ürünleri manuel olarak products.json'a ekleyip")
            print("   'python3 main.py --json products.json' komutunu kullanın.")
            print("\n   Örnek products.json formatı:")
            example = [
                {
                    "name": "Siyah Midi Elbise",
                    "price": "₺299,90",
                    "image_url": "https://...",
                    "product_url": "https://www.amazon.com.tr/dp/..."
                }
            ]
            print(json.dumps(example, ensure_ascii=False, indent=2))
            sys.exit(1)

        if args.save_products:
            save_products_to_json(products, "products.json")

    print(f"\n✓ {len(products)} ürün yüklendi.")

    if len(products) < 2:
        print("⚠  Kombin oluşturmak için en az 2 ürün gerekli.")
        sys.exit(1)

    # ── 2. Kombinleri oluştur ──────────────────────────────────────────
    print(f"\nKombinler oluşturuluyor (maks {args.max_outfits})...")
    outfits = generate_outfits(products, max_outfits=args.max_outfits)

    if not outfits:
        print("⚠  Kombin oluşturulamadı. Ürün kategorileri tanınamıyor olabilir.")
        sys.exit(1)

    print(f"✓ {len(outfits)} kombin oluşturuldu:")
    for i, o in enumerate(outfits, 1):
        print(f"   {i}. {o['title']} ({len(o['items'])} parça)")

    # ── 3. Görselleri oluştur ─────────────────────────────────────────
    print(f"\nPinterest görselleri oluşturuluyor → {args.output}/")
    paths = create_all_pins(outfits, output_dir=args.output)

    print(f"\n✓ {len(paths)} görsel hazır!")
    print(f"   Konum: {os.path.abspath(args.output)}/")
    for path in paths:
        print(f"   • {os.path.basename(path)}")

    print("\nPinterest'e yüklemek için görselleri açın ve indirin.")


if __name__ == "__main__":
    main()
