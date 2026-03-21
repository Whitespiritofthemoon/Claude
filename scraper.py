"""
Amazon storefront scraper - requests + BeautifulSoup kullanır.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


def scrape_storefront(url: str) -> list[dict]:
    """
    Amazon storefront'undan ürünleri çeker.
    Returns: [{"name": ..., "price": ..., "image_url": ..., "product_url": ...}]
    """
    print(f"Sayfa yükleniyor: {url}")

    # Base URL belirle (TR veya .com)
    base_url = "https://www.amazon.com.tr" if "amazon.com.tr" in url else "https://www.amazon.com"

    try:
        session = requests.Session()
        response = session.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Hata: Sayfa yüklenemedi - {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    products = []

    # Amazon storefront ürün kartı seçicileri (çeşitli sayfa yapıları)
    selectors = [
        # Yeni storefront düzeni
        {"card": "div[data-csa-c-type='item']", "name": "[data-csa-c-item-id]", "price": ".a-price .a-offscreen", "img": "img.a-dynamic-image", "link": "a.a-link-normal"},
        # Klasik storefront
        {"card": "div.s-result-item[data-asin]", "name": "h2 a span", "price": ".a-price .a-offscreen", "img": "img.s-image", "link": "h2 a"},
        # Liste görünümü
        {"card": "li[data-asin]", "name": "h3 span", "price": ".a-price .a-offscreen", "img": "img", "link": "a.a-link-normal"},
    ]

    for sel in selectors:
        cards = soup.select(sel["card"])
        if not cards:
            continue

        print(f"{len(cards)} ürün kartı bulundu.")

        for card in cards:
            name_el = card.select_one(sel["name"])
            price_el = card.select_one(sel["price"])
            img_el = card.select_one(sel["img"])
            link_el = card.select_one(sel["link"])

            if not name_el or not img_el:
                continue

            name = name_el.get_text(strip=True)
            price = price_el.get_text(strip=True) if price_el else "Fiyat yok"

            image_url = (
                img_el.get("data-src")
                or img_el.get("src")
                or ""
            )
            # Küçük boyutlu placeholder görüntülerini atla
            if not image_url or "data:image" in image_url or len(image_url) < 10:
                continue

            href = link_el.get("href", "") if link_el else ""
            product_url = urljoin(base_url, href) if href else ""

            products.append({
                "name": name,
                "price": price,
                "image_url": image_url,
                "product_url": product_url,
            })

        if products:
            break

    # Alternatif: JSON-LD schema verisinden çek
    if not products:
        products = _extract_from_jsonld(soup, base_url)

    print(f"Toplam {len(products)} ürün bulundu.")
    return products


def _extract_from_jsonld(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """JSON-LD schema.org verisinden ürün bilgilerini çıkar."""
    products = []
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        try:
            data = json.loads(script.string or "")
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                items = data.get("itemListElement", [data])
            else:
                continue

            for item in items:
                if item.get("@type") not in ("Product", "ListItem"):
                    continue
                name = item.get("name", "")
                img = item.get("image", "")
                price = ""
                offers = item.get("offers", {})
                if isinstance(offers, dict):
                    price = str(offers.get("price", ""))
                url = item.get("url", "")
                if name and img:
                    products.append({
                        "name": name,
                        "price": price,
                        "image_url": img if isinstance(img, str) else (img[0] if img else ""),
                        "product_url": url,
                    })
        except (json.JSONDecodeError, AttributeError):
            continue
    return products


def load_products_from_json(filepath: str) -> list[dict]:
    """Manuel olarak kaydedilmiş ürün JSON dosyasını yükle."""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_products_to_json(products: list[dict], filepath: str) -> None:
    """Ürünleri JSON dosyasına kaydet."""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"Ürünler kaydedildi: {filepath}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Kullanım: python3 scraper.py <amazon_storefront_url>")
        sys.exit(1)
    url = sys.argv[1]
    products = scrape_storefront(url)
    if products:
        save_products_to_json(products, "products.json")
    else:
        print("Ürün bulunamadı. Manuel JSON dosyası kullanabilirsiniz.")
