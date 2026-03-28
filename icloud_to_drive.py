"""
iCloud → Google Drive Uploader
Tüm iCloud dosyalarını Google Drive'a klasör yapısını koruyarak yükler.

Gereksinimler:
  pip install pyicloud google-api-python-client google-auth-httplib2 google-auth-oauthlib tqdm

Kurulum:
  1. Google Drive API'yi etkinleştir: https://console.cloud.google.com/
  2. OAuth 2.0 credentials.json indir
  3. Bu scripti çalıştır: python icloud_to_drive.py
"""

import os
import io
import sys
import json
import time
import logging
from pathlib import Path

from pyicloud import PyiCloudService
from pyicloud.exceptions import PyiCloudFailedLoginException, PyiCloud2SARequiredException

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.errors import HttpError

from tqdm import tqdm

# ─── Yapılandırma ─────────────────────────────────────────────────────────────

ICLOUD_EMAIL = os.environ.get("ICLOUD_EMAIL", "")          # iCloud Apple ID
ICLOUD_PASSWORD = os.environ.get("ICLOUD_PASSWORD", "")    # iCloud şifresi

DRIVE_TARGET_FOLDER_ID = "1_2SHi2LPmRK6TZzpqKF09OlLTP067JRx"  # Hedef Drive klasörü
CREDENTIALS_FILE = "credentials.json"  # Google API credentials dosyası
TOKEN_FILE = "token.json"              # Kayıtlı oturum token'ı

SCOPES = ["https://www.googleapis.com/auth/drive"]

# Atlanacak dosya/klasör adları
SKIP_NAMES = {".DS_Store", ".icloud", "desktop.ini", "Thumbs.db"}

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("icloud_to_drive.log", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ─── Google Drive ──────────────────────────────────────────────────────────────

def authenticate_google_drive():
    """Google Drive OAuth2 kimlik doğrulaması."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                log.error(
                    "credentials.json bulunamadı!\n"
                    "Google Cloud Console'dan OAuth credentials indirip "
                    "bu scriptle aynı klasöre koy.\n"
                    "https://console.cloud.google.com/apis/credentials"
                )
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


def get_or_create_folder(service, name, parent_id=None):
    """Drive'da klasör varsa ID'sini döner, yoksa oluşturur."""
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, fields="files(id, name)").execute()
    files = results.get("files", [])
    if files:
        return files[0]["id"]

    metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
    }
    if parent_id:
        metadata["parents"] = [parent_id]

    folder = service.files().create(body=metadata, fields="id").execute()
    log.info(f"Klasör oluşturuldu: {name}")
    return folder["id"]


def file_exists_in_drive(service, name, parent_id):
    """Dosya Drive'da zaten varsa True döner."""
    query = f"name='{name}' and '{parent_id}' in parents and trashed=false"
    results = service.files().list(q=query, fields="files(id)").execute()
    return len(results.get("files", [])) > 0


def upload_file_to_drive(service, file_data: bytes, filename: str, parent_id: str, mime_type: str = "application/octet-stream"):
    """Dosyayı Drive'a yükler."""
    if file_exists_in_drive(service, filename, parent_id):
        log.info(f"  [ATLA] Zaten mevcut: {filename}")
        return

    metadata = {"name": filename, "parents": [parent_id]}
    media = MediaIoBaseUpload(io.BytesIO(file_data), mimetype=mime_type, resumable=True)

    for attempt in range(3):
        try:
            service.files().create(body=metadata, media_body=media, fields="id").execute()
            return
        except HttpError as e:
            if attempt < 2:
                wait = 2 ** attempt
                log.warning(f"  Yükleme hatası ({e}), {wait}s sonra tekrar deneniyor...")
                time.sleep(wait)
            else:
                raise

# ─── iCloud ────────────────────────────────────────────────────────────────────

def authenticate_icloud(email: str, password: str) -> PyiCloudService:
    """iCloud oturumu açar, 2FA varsa terminal üzerinden doğrular."""
    try:
        api = PyiCloudService(email, password)
    except PyiCloudFailedLoginException:
        log.error("iCloud girişi başarısız. E-posta veya şifreyi kontrol et.")
        sys.exit(1)

    if api.requires_2fa:
        code = input("iCloud 2FA kodu (telefonuna gelen): ").strip()
        result = api.validate_2fa_code(code)
        if not result:
            log.error("Geçersiz 2FA kodu.")
            sys.exit(1)
        if not api.is_trusted_session:
            api.trust_session()

    elif api.requires_2sa:
        devices = api.trusted_devices
        for i, dev in enumerate(devices):
            print(f"  [{i}] {dev.get('deviceName', 'Bilinmeyen cihaz')}")
        idx = int(input("Kod gönderilecek cihaz numarası: "))
        device = devices[idx]
        if not api.send_verification_code(device):
            log.error("Doğrulama kodu gönderilemedi.")
            sys.exit(1)
        code = input("Gelen kod: ").strip()
        if not api.validate_verification_code(device, code):
            log.error("Geçersiz doğrulama kodu.")
            sys.exit(1)

    return api


def walk_icloud(node, path=""):
    """iCloud Drive düğümlerini özyinelemeli olarak gezer, (yol, düğüm) verir."""
    name = node.name
    if name in SKIP_NAMES:
        return

    current_path = f"{path}/{name}" if path else name

    if node.type == "folder":
        for child in node.dir():
            yield from walk_icloud(child, current_path)
    else:
        yield current_path, node

# ─── Ana Akış ─────────────────────────────────────────────────────────────────

def main():
    # Kimlik bilgilerini al
    email = ICLOUD_EMAIL or input("iCloud e-posta: ").strip()
    password = ICLOUD_PASSWORD or input("iCloud şifre: ").strip()

    log.info("iCloud'a bağlanılıyor...")
    icloud = authenticate_icloud(email, password)
    log.info("iCloud bağlantısı başarılı.")

    log.info("Google Drive'a bağlanılıyor...")
    drive = authenticate_google_drive()
    log.info("Google Drive bağlantısı başarılı.")

    # Hedef Drive klasörünü doğrula
    root_folder_id = DRIVE_TARGET_FOLDER_ID
    try:
        meta = drive.files().get(fileId=root_folder_id, fields="id,name").execute()
        log.info(f"Hedef klasör: '{meta['name']}' (ID: {root_folder_id})")
    except HttpError as e:
        log.error(f"Hedef Drive klasörüne erişilemiyor: {e}\nKlasör ID'sini ve izinleri kontrol et.")
        sys.exit(1)

    # iCloud Drive dosyalarını tara
    log.info("iCloud Drive taranıyor...")
    drive_root = icloud.drive.root
    all_items = list(walk_icloud(drive_root))
    log.info(f"Toplam {len(all_items)} dosya bulundu.")

    # Klasör ID önbelleği (tekrar sorgulamayı önler)
    folder_cache: dict[str, str] = {"": root_folder_id}

    def ensure_folder_path(rel_path: str) -> str:
        """İç içe klasörleri Drive'da oluşturur, leaf klasör ID'sini döner."""
        if rel_path in folder_cache:
            return folder_cache[rel_path]
        parts = rel_path.split("/")
        current_id = root_folder_id
        accumulated = ""
        for part in parts:
            accumulated = f"{accumulated}/{part}" if accumulated else part
            if accumulated not in folder_cache:
                folder_cache[accumulated] = get_or_create_folder(drive, part, current_id)
            current_id = folder_cache[accumulated]
        return current_id

    # Yükleme
    success = failed = skipped = 0
    for file_path, node in tqdm(all_items, desc="Yükleniyor", unit="dosya"):
        parts = file_path.rsplit("/", 1)
        folder_rel = parts[0] if len(parts) > 1 else ""
        filename = parts[-1]

        try:
            parent_id = ensure_folder_path(folder_rel) if folder_rel else root_folder_id

            if file_exists_in_drive(drive, filename, parent_id):
                log.info(f"  [ATLA] {file_path}")
                skipped += 1
                continue

            log.info(f"  [YUKLE] {file_path}")
            data = node.open(stream=True).read()
            upload_file_to_drive(drive, data, filename, parent_id)
            success += 1

        except Exception as e:
            log.error(f"  [HATA] {file_path}: {e}")
            failed += 1

    log.info(f"\n{'='*50}")
    log.info(f"Tamamlandi! Yuklenen: {success} | Atlanan: {skipped} | Hata: {failed}")
    log.info(f"{'='*50}")


if __name__ == "__main__":
    main()
