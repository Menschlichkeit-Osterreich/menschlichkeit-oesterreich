"""Pytest Konfiguration: Stellt sicher, dass das FastAPI Modul auffindbar ist.

Fügt den Pfad `api.menschlichkeit-oesterreich.at` zum Pythonpfad hinzu,
damit Imports wie `from app.lib.pii_sanitizer import ...` funktionieren.
"""
from __future__ import annotations
import sys
import pathlib

root = pathlib.Path(__file__).resolve().parent.parent
api_path = root / "api.menschlichkeit-oesterreich.at"
if api_path.exists():
    sys.path.insert(0, str(api_path))