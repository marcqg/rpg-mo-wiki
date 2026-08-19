#!/usr/bin/env python3
"""
extract-images.py
Télécharge les planches de sprites depuis https://data.mo.ee/
et découpe chaque image pour les items, pets, mobs et objets du jeu.
Enregistre les images PNG transparentes dans static/img/
"""

import os
import json
import ssl
import io
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "game")
STATIC_IMG_DIR = os.path.join(ROOT, "static", "img")

ITEMS_IMG_DIR = os.path.join(STATIC_IMG_DIR, "items")
PETS_IMG_DIR = os.path.join(STATIC_IMG_DIR, "pets")
MOBS_IMG_DIR = os.path.join(STATIC_IMG_DIR, "mobs")
OBJECTS_IMG_DIR = os.path.join(STATIC_IMG_DIR, "objects")

SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

BASE_URL = "https://data.mo.ee/"

def make_dirs():
    for d in [ITEMS_IMG_DIR, PETS_IMG_DIR, MOBS_IMG_DIR, OBJECTS_IMG_DIR]:
        os.makedirs(d, exist_ok=True)

def fetch_image(url_path):
    full_url = BASE_URL + url_path.lstrip("/")
    try:
        req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=20) as resp:
            data = resp.read()
            img = Image.open(io.BytesIO(data)).convert("RGBA")
            return url_path, img
    except Exception as e:
        print(f"Erreur lors du téléchargement de {full_url}: {e}")
        return url_path, None

def to_int(val, default=0):
    if isinstance(val, list):
        return int(val[0]) if len(val) > 0 and isinstance(val[0], (int, float)) else default
    if isinstance(val, (int, float)):
        return int(val)
    try:
        return int(val)
    except Exception:
        return default

def crop_tile(sheet_img, x, y, tile_w, tile_h):
    if not sheet_img:
        return None
    sw, sh = sheet_img.size
    ix = to_int(x, 0)
    iy = to_int(y, 0)
    tw = to_int(tile_w, 32)
    th = to_int(tile_h, 32)

    left = ix * tw
    top = iy * th
    right = left + tw
    bottom = top + th

    if left < 0 or top < 0 or right > sw or bottom > sh:
        right = min(right, sw)
        bottom = min(bottom, sh)
        if left >= right or top >= bottom:
            return None

    return sheet_img.crop((left, top, right, bottom))

def main():
    make_dirs()

    print("1. Chargement des métadonnées des données et planches...")
    with open(os.path.join(DATA_DIR, "sheets.json"), "r", encoding="utf-8") as f:
        sheets_meta = json.load(f)

    with open(os.path.join(DATA_DIR, "items.json"), "r", encoding="utf-8") as f:
        items = json.load(f)

    with open(os.path.join(DATA_DIR, "pets.json"), "r", encoding="utf-8") as f:
        pets = json.load(f)

    with open(os.path.join(DATA_DIR, "mobs.json"), "r", encoding="utf-8") as f:
        mobs = json.load(f)

    with open(os.path.join(DATA_DIR, "objects.json"), "r", encoding="utf-8") as f:
        objects = json.load(f)

    unique_sheet_urls = set(s["url"] for s in sheets_meta.values() if "url" in s)
    print(f"2. Téléchargement des {len(unique_sheet_urls)} planches de sprites en parallèle...")
    
    loaded_sheets = {}
    with ThreadPoolExecutor(max_workers=16) as executor:
        results = executor.map(fetch_image, list(unique_sheet_urls))
        for url_path, img in results:
            if img:
                loaded_sheets[url_path] = img

    print(f"   {len(loaded_sheets)} planches téléchargées avec succès.")

    # 3. Découpage des Items
    print("3. Découpage des icônes d'items...")
    items_count = 0
    for it in items:
        img_info = it.get("img")
        if not img_info or not isinstance(img_info, dict):
            continue
        
        sheet_id = str(img_info.get("sheet"))
        sheet_info = sheets_meta.get(sheet_id)
        if not sheet_info:
            continue

        sheet_url = sheet_info.get("url")
        sheet_img = loaded_sheets.get(sheet_url)
        if not sheet_img:
            continue

        tile_w = sheet_info.get("tile_width", 32)
        tile_h = sheet_info.get("tile_height", 32)
        x = img_info.get("x", 0)
        y = img_info.get("y", 0)

        cropped = crop_tile(sheet_img, x, y, tile_w, tile_h)
        if cropped:
            out_path = os.path.join(ITEMS_IMG_DIR, f"{it['id']}.png")
            cropped.save(out_path, "PNG")
            items_count += 1

    print(f"   ✅ {items_count} images d'items créées.")

    # 4. Découpage des Pets
    print("4. Découpage des icônes de familiers (pets)...")
    pets_count = 0
    for p in pets:
        img_info = p.get("img")
        if not img_info or not isinstance(img_info, dict):
            continue
        
        sheet_id = str(img_info.get("sheet"))
        sheet_info = sheets_meta.get(sheet_id)
        if not sheet_info:
            continue

        sheet_url = sheet_info.get("url")
        sheet_img = loaded_sheets.get(sheet_url)
        if not sheet_img:
            continue

        tile_w = sheet_info.get("tile_width", 32)
        tile_h = sheet_info.get("tile_height", 32)
        x = img_info.get("x", 0)
        y = img_info.get("y", 0)

        cropped = crop_tile(sheet_img, x, y, tile_w, tile_h)
        if cropped:
            out_path = os.path.join(PETS_IMG_DIR, f"{p['id']}.png")
            cropped.save(out_path, "PNG")
            pets_count += 1

    print(f"   ✅ {pets_count} images de pets créées.")

    # 5. Découpage des Monstres (ceux avec sheet)
    print("5. Découpage des monstres et boss...")
    mobs_count = 0
    for m in mobs:
        img_info = m.get("img")
        if not img_info or not isinstance(img_info, dict):
            continue
        
        sheet_id = str(img_info.get("sheet"))
        sheet_info = sheets_meta.get(sheet_id)
        if not sheet_info:
            continue

        sheet_url = sheet_info.get("url")
        sheet_img = loaded_sheets.get(sheet_url)
        if not sheet_img:
            continue

        tile_w = sheet_info.get("tile_width", 32)
        tile_h = sheet_info.get("tile_height", 32)
        x = img_info.get("x", 0)
        y = img_info.get("y", 0)

        cropped = crop_tile(sheet_img, x, y, tile_w, tile_h)
        if cropped:
            out_path = os.path.join(MOBS_IMG_DIR, f"{m['id']}.png")
            cropped.save(out_path, "PNG")
            mobs_count += 1

    print(f"   ✅ {mobs_count} images de monstres créées.")

    # 6. Découpage des Objets
    print("6. Découpage des objets interactifs...")
    objects_count = 0
    for o in objects:
        img_info = o.get("img")
        if not img_info or not isinstance(img_info, dict):
            continue
        
        sheet_id = str(img_info.get("sheet"))
        sheet_info = sheets_meta.get(sheet_id)
        if not sheet_info:
            continue

        sheet_url = sheet_info.get("url")
        sheet_img = loaded_sheets.get(sheet_url)
        if not sheet_img:
            continue

        tile_w = sheet_info.get("tile_width", 32)
        tile_h = sheet_info.get("tile_height", 32)
        x = img_info.get("x", 0)
        y = img_info.get("y", 0)

        cropped = crop_tile(sheet_img, x, y, tile_w, tile_h)
        if cropped:
            out_path = os.path.join(OBJECTS_IMG_DIR, f"{o['id']}.png")
            cropped.save(out_path, "PNG")
            objects_count += 1

    print(f"   ✅ {objects_count} images d'objets créées.")
    print("🎉 Extraction de toutes les images terminée !")

if __name__ == "__main__":
    main()
