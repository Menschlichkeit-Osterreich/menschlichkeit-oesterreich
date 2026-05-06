#!/usr/bin/env python3
"""
Simplified Asset Management System
Educational Gaming System - ohne CairoSVG Dependencies
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import re

# Nur Pillow für Basis-Funktionalität
try:
    from PIL import Image, ImageDraw
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Warning: Pillow not available - thumbnail generation disabled")

class SimpleAssetManager:
    """
    Vereinfachtes Asset Management System für Educational Gaming
    Fokus auf SVG-Generierung und Metadaten ohne externe Dependencies
    """
    
    def __init__(self, base_path: str = "./web/games"):
        self.base_path = Path(base_path)
        self.assets_path = self.base_path / "assets"
        self.generated_path = self.assets_path / "generated"
        self.metadata_path = self.assets_path / "metadata"
        self.thumbnails_path = self.assets_path / "thumbnails"
        
        # Erstelle Verzeichnisse
        for path in [self.assets_path, self.generated_path, 
                     self.metadata_path, self.thumbnails_path]:
            path.mkdir(exist_ok=True)
        
        # Asset Familien aus batch_prompt_template.csv
        self.asset_families = {
            "icons_values": {
                "items": ["equality", "freedom", "solidarity", "justice"],
                "composition_rules": {
                    "style": "minimalist_icons",
                    "background": "transparent",
                    "centering": True,
                    "padding": "20px"
                }
            },
            "map_regions": {
                "items": ["austria", "vienna", "graz", "linz", "salzburg", 
                         "innsbruck", "klagenfurt", "bregenz", "eisenstadt", "st_poelten"],
                "composition_rules": {
                    "style": "isometric_tiles", 
                    "background": "transparent",
                    "centering": True
                }
            },
            "minigames_bridge_puzzle": {
                "items": ["bridge_start", "bridge_middle", "bridge_end", "water",
                         "character_left", "character_right", "plank_horizontal", "plank_vertical"],
                "composition_rules": {
                    "style": "game_sprites",
                    "background": "transparent", 
                    "pixel_perfect": True
                }
            },
            "ui_buttons": {
                "items": ["play", "pause", "settings"],
                "composition_rules": {
                    "style": "modern_ui",
                    "background": "transparent",
                    "centering": True,
                    "padding": "12px"
                }
            },
            "characters": {
                "items": ["teacher", "student_male", "student_female"],
                "composition_rules": {
                    "style": "character_avatars",
                    "background": "transparent",
                    "centering": True
                }
            }
        }
    
    def generate_all_assets(self) -> Dict[str, List[Dict]]:
        """
        Generiert alle Assets für alle Familien
        """
        all_results = {}
        
        print("🚀 Starting batch asset generation...")
        print(f"   Families: {len(self.asset_families)}")
        print(f"   Total items: {sum(len(f['items']) for f in self.asset_families.values())}")
        
        for family_name in self.asset_families:
            try:
                results = self.generate_batch_assets(family_name)
                all_results[family_name] = results
                
                success_count = sum(1 for r in results if r['status'] == 'success')
                print(f"✅ {family_name}: {success_count}/{len(results)} assets generated")
                
            except Exception as e:
                print(f"❌ Failed to generate {family_name}: {e}")
                all_results[family_name] = {"error": str(e)}
        
        # Speichere Gesamtübersicht
        summary_path = self.metadata_path / "batch_generation_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Generation summary saved to: {summary_path}")
        return all_results
    
    def generate_batch_assets(self, family_name: str) -> List[Dict]:
        """
        Generiert Assets für eine komplette Familie
        """
        if family_name not in self.asset_families:
            raise ValueError(f"Unknown asset family: {family_name}")
        
        family = self.asset_families[family_name]
        results = []
        
        print(f"🎨 Generating assets for family: {family_name}")
        print(f"   Items: {len(family['items'])}")
        print(f"   Style: {family['composition_rules']['style']}")
        
        for item_name in family['items']:
            asset_id = f"{family_name}_{item_name}"
            
            try:
                # Generiere SVG
                svg_content = self._generate_svg_for_item(
                    family_name, 
                    item_name, 
                    family['composition_rules']
                )
                
                # Speichere SVG
                svg_path = self.generated_path / f"{asset_id}.svg"
                with open(svg_path, 'w', encoding='utf-8') as f:
                    f.write(svg_content)
                
                # Generiere Metadaten
                metadata = self._generate_simple_metadata(
                    str(svg_path),
                    asset_id=asset_id,
                    family=family_name,
                    item=item_name,
                    svg_content=svg_content
                )
                
                # Speichere Metadaten
                metadata_path = self.metadata_path / f"{asset_id}.json"
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
                
                results.append({
                    "asset_id": asset_id,
                    "family": family_name,
                    "item": item_name,
                    "svg_path": str(svg_path),
                    "metadata_path": str(metadata_path),
                    "metadata": metadata,
                    "status": "success"
                })
                
                print(f"  ✓ {asset_id}")
                
            except Exception as e:
                print(f"  ❌ {asset_id}: {e}")
                results.append({
                    "asset_id": asset_id,
                    "family": family_name,
                    "item": item_name,
                    "error": str(e),
                    "status": "error"
                })
        
        return results
    
    def _generate_simple_metadata(self, file_path: str, **kwargs) -> Dict:
        """
        Generiert vereinfachte Metadaten ohne externe Dependencies
        """
        asset_id = kwargs.get('asset_id', '')
        family = kwargs.get('family', '')
        item = kwargs.get('item', '')
        svg_content = kwargs.get('svg_content', '')
        
        # Analysiere SVG für Basis-Informationen
        colors = self._extract_colors_from_svg(svg_content)
        file_size = len(svg_content.encode('utf-8'))
        content_hash = hashlib.sha256(svg_content.encode('utf-8')).hexdigest()
        
        metadata = {
            "id": asset_id,
            "title": self._generate_title(family, item),
            "alt_text": self._generate_alt_text(family, item),
            "description": f"Generiertes SVG Asset für {family} - {item}",
            "tags": self._generate_tags(family, item),
            "file_info": {
                "path": file_path,
                "format": "svg",
                "size_bytes": file_size,
                "hash": content_hash
            },
            "colors": colors,
            "accessibility": {
                "alt_text_provided": True,
                "high_contrast": len(colors) <= 5,  # Vereinfachte Heuristik
                "semantic_meaning": True
            },
            "usage": {
                "category": family,
                "subcategory": item,
                "recommended_contexts": self._get_usage_contexts(family, item)
            },
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "generator": "SimpleAssetManager",
                "version": "1.0.0",
                "license": "Educational Use",
                "attribution": "Auto-generated for Educational Gaming System"
            }
        }
        
        return metadata
    
    def _extract_colors_from_svg(self, svg_content: str) -> List[str]:
        """
        Extrahiert Farben aus SVG-Content mit RegEx
        """
        colors = set()
        
        # Suche nach fill="color" und stroke="color"
        fill_pattern = r'fill="([^"]+)"'
        stroke_pattern = r'stroke="([^"]+)"'
        
        fills = re.findall(fill_pattern, svg_content)
        strokes = re.findall(stroke_pattern, svg_content)
        
        for color in fills + strokes:
            if color not in ["none", "transparent"]:
                colors.add(color)
        
        return list(colors)
    
    def _generate_svg_for_item(self, family: str, item: str, rules: Dict) -> str:
        """
        Generiert SVG-Content basierend auf Familie und Item
        """
        if family == "icons_values":
            return self._generate_value_icon(item, rules)
        elif family == "map_regions":
            return self._generate_map_region(item, rules)
        elif family == "minigames_bridge_puzzle":
            return self._generate_bridge_element(item, rules)
        elif family == "ui_buttons":
            return self._generate_ui_button(item, rules)
        elif family == "characters":
            return self._generate_character(item, rules)
        else:
            return self._generate_placeholder(item, rules)
    
    def _generate_value_icon(self, value: str, rules: Dict) -> str:
        """Generiert Icons für demokratische Werte"""
        icons = {
            "equality": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .icon-primary { fill: #0ea5e9; }
            .icon-secondary { fill: #22c55e; }
            .icon-stroke { stroke: #0369a1; stroke-width: 2; fill: none; }
            .icon-text { font-family: Inter, sans-serif; font-size: 8px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Zwei gleiche Kreise symbolisieren Gleichheit -->
    <circle cx="25" cy="35" r="12" class="icon-primary"/>
    <circle cx="75" cy="35" r="12" class="icon-primary"/>
    <!-- Verbindende Waage -->
    <rect x="20" y="58" width="60" height="6" rx="3" class="icon-secondary"/>
    <line x1="50" y1="50" x2="50" y2="64" class="icon-stroke"/>
    <text x="50" y="85" class="icon-text">Gleichheit</text>
</svg>""",
            "freedom": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .icon-primary { fill: #0ea5e9; }
            .icon-accent { fill: #f59e0b; }
            .icon-stroke { stroke: #0369a1; stroke-width: 2; fill: none; }
            .icon-text { font-family: Inter, sans-serif; font-size: 8px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Vogel im Flug als Freiheitssymbol -->
    <path d="M30 40 Q50 25 70 40" class="icon-stroke"/>
    <path d="M50 40 Q35 50 30 60" class="icon-stroke"/>
    <path d="M50 40 Q65 50 70 60" class="icon-stroke"/>
    <circle cx="50" cy="30" r="6" class="icon-accent"/>
    <!-- Horizont -->
    <line x1="15" y1="70" x2="85" y2="70" stroke="#22c55e" stroke-width="2"/>
    <text x="50" y="90" class="icon-text">Freiheit</text>
</svg>""",
            "solidarity": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .icon-primary { fill: #0ea5e9; }
            .icon-secondary { fill: #22c55e; }
            .icon-text { font-family: Inter, sans-serif; font-size: 8px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Zwei Hände die sich reichen -->
    <ellipse cx="30" cy="40" rx="8" ry="12" class="icon-primary"/>
    <ellipse cx="70" cy="40" rx="8" ry="12" class="icon-primary"/>
    <!-- Verbindung -->
    <rect x="35" y="38" width="30" height="4" rx="2" class="icon-secondary"/>
    <!-- Herz als Symbol der Solidarität -->
    <path d="M50 55 Q45 50 40 55 Q45 60 50 65 Q55 60 60 55 Q55 50 50 55" class="icon-secondary"/>
    <text x="50" y="85" class="icon-text">Solidarität</text>
</svg>""",
            "justice": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .icon-primary { fill: #0ea5e9; }
            .icon-secondary { fill: #22c55e; }
            .icon-neutral { fill: #64748b; }
            .icon-text { font-family: Inter, sans-serif; font-size: 8px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Waage der Gerechtigkeit -->
    <rect x="47" y="25" width="6" height="35" class="icon-neutral"/>
    <!-- Waagschalen -->
    <ellipse cx="30" cy="45" rx="12" ry="4" class="icon-secondary"/>
    <ellipse cx="70" cy="45" rx="12" ry="4" class="icon-secondary"/>
    <!-- Aufhängung -->
    <line x1="50" y1="35" x2="30" y2="41" stroke="#64748b" stroke-width="2"/>
    <line x1="50" y1="35" x2="70" y2="41" stroke="#64748b" stroke-width="2"/>
    <!-- Basis -->
    <rect x="35" y="60" width="30" height="4" rx="2" class="icon-neutral"/>
    <text x="50" y="85" class="icon-text">Gerechtigkeit</text>
</svg>"""
        }
        return icons.get(value, self._generate_placeholder(value, rules))
    
    def _generate_map_region(self, region: str, rules: Dict) -> str:
        """Generiert isometrische Karten-Tiles"""
        # Verschiedene Farben für verschiedene Regionen
        colors = {
            "austria": "#0ea5e9", "vienna": "#22c55e", "graz": "#f59e0b", 
            "linz": "#ef4444", "salzburg": "#8b5cf6", "innsbruck": "#06b6d4",
            "klagenfurt": "#f97316", "bregenz": "#84cc16", "eisenstadt": "#ec4899", 
            "st_poelten": "#6366f1"
        }
        
        color = colors.get(region, "#64748b")
        
        return f"""<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="{region}Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:{color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:{color};stop-opacity:0.7" />
        </linearGradient>
        <style>
            .region-text {{ font-family: Inter, sans-serif; font-size: 7px; fill: white; text-anchor: middle; font-weight: bold; }}
        </style>
    </defs>
    <!-- Isometrischer Würfel -->
    <path d="M50 25 L75 40 L50 55 L25 40 Z" fill="url(#{region}Grad)" stroke="{color}" stroke-width="1"/>
    <path d="M25 40 L50 55 L50 75 L25 60 Z" fill="{color}" opacity="0.6"/>
    <path d="M50 55 L75 40 L75 60 L50 75 Z" fill="{color}" opacity="0.4"/>
    <text x="50" y="48" class="region-text">{region[:3].upper()}</text>
    <text x="50" y="90" style="font-family: Inter, sans-serif; font-size: 8px; fill: #0f172a; text-anchor: middle;">{region.replace('_', ' ').title()}</text>
</svg>"""
    
    def _generate_bridge_element(self, element: str, rules: Dict) -> str:
        """Generiert Brücken-Puzzle Elemente"""
        elements = {
            "bridge_start": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .wood { fill: #92400e; }
            .metal { fill: #64748b; }
        </style>
    </defs>
    <!-- Start-Plattform -->
    <rect x="5" y="35" width="40" height="30" rx="4" class="wood"/>
    <!-- Anschlussstelle -->
    <circle cx="50" cy="50" r="8" class="metal"/>
    <rect x="45" y="46" width="10" height="8" class="metal"/>
</svg>""",
            "bridge_middle": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .wood { fill: #92400e; }
            .metal { fill: #64748b; }
        </style>
    </defs>
    <!-- Brücken-Mittelteil -->
    <rect x="10" y="40" width="80" height="20" rx="2" class="wood"/>
    <!-- Verstrebungen -->
    <rect x="20" y="42" width="4" height="16" class="metal"/>
    <rect x="50" y="42" width="4" height="16" class="metal"/>
    <rect x="76" y="42" width="4" height="16" class="metal"/>
</svg>""",
            "bridge_end": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .wood { fill: #92400e; }
            .metal { fill: #64748b; }
        </style>
    </defs>
    <!-- End-Plattform -->
    <rect x="55" y="35" width="40" height="30" rx="4" class="wood"/>
    <!-- Anschlussstelle -->
    <circle cx="50" cy="50" r="8" class="metal"/>
    <rect x="45" y="46" width="10" height="8" class="metal"/>
</svg>""",
            "water": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Wasser -->
    <rect x="0" y="0" width="100" height="100" fill="url(#waterGrad)"/>
    <!-- Wellen -->
    <path d="M0 25 Q25 15 50 25 T100 25" stroke="#60a5fa" stroke-width="2" fill="none"/>
    <path d="M0 50 Q25 40 50 50 T100 50" stroke="#60a5fa" stroke-width="2" fill="none"/>
    <path d="M0 75 Q25 65 50 75 T100 75" stroke="#60a5fa" stroke-width="2" fill="none"/>
</svg>""",
            "character_left": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .skin { fill: #fde68a; }
            .hair { fill: #92400e; }
            .clothes { fill: #3b82f6; }
            .eyes { fill: #1f2937; }
        </style>
    </defs>
    <!-- Kopf -->
    <circle cx="35" cy="30" r="15" class="skin"/>
    <!-- Haare -->
    <path d="M25 20 Q35 15 45 20 Q35 10 25 20" class="hair"/>
    <!-- Augen -->
    <circle cx="30" cy="27" r="1.5" class="eyes"/>
    <circle cx="40" cy="27" r="1.5" class="eyes"/>
    <!-- Mund -->
    <path d="M32 35 Q35 37 38 35" stroke="#1f2937" stroke-width="1" fill="none"/>
    <!-- Körper -->
    <rect x="25" y="45" width="20" height="25" rx="3" class="clothes"/>
    <!-- Arme -->
    <rect x="18" y="50" width="6" height="15" rx="3" class="skin"/>
    <rect x="46" y="50" width="6" height="15" rx="3" class="skin"/>
    <!-- Beine -->
    <rect x="28" y="70" width="6" height="20" rx="3" class="clothes"/>
    <rect x="36" y="70" width="6" height="20" rx="3" class="clothes"/>
</svg>""",
            "character_right": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .skin { fill: #fde68a; }
            .hair { fill: #451a03; }
            .clothes { fill: #ef4444; }
            .eyes { fill: #1f2937; }
        </style>
    </defs>
    <!-- Kopf -->
    <circle cx="65" cy="30" r="15" class="skin"/>
    <!-- Haare -->
    <path d="M55 20 Q65 15 75 20 Q65 10 55 20" class="hair"/>
    <!-- Augen -->
    <circle cx="60" cy="27" r="1.5" class="eyes"/>
    <circle cx="70" cy="27" r="1.5" class="eyes"/>
    <!-- Mund -->
    <path d="M62 35 Q65 37 68 35" stroke="#1f2937" stroke-width="1" fill="none"/>
    <!-- Körper -->
    <rect x="55" y="45" width="20" height="25" rx="3" class="clothes"/>
    <!-- Arme -->
    <rect x="48" y="50" width="6" height="15" rx="3" class="skin"/>
    <rect x="76" y="50" width="6" height="15" rx="3" class="skin"/>
    <!-- Beine -->
    <rect x="58" y="70" width="6" height="20" rx="3" class="clothes"/>
    <rect x="66" y="70" width="6" height="20" rx="3" class="clothes"/>
</svg>""",
            "plank_horizontal": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .wood { fill: #92400e; }
            .wood-grain { stroke: #451a03; stroke-width: 0.5; }
        </style>
    </defs>
    <!-- Horizontal Planke -->
    <rect x="10" y="40" width="80" height="20" rx="2" class="wood"/>
    <!-- Holzmaserung -->
    <line x1="15" y1="45" x2="85" y2="45" class="wood-grain"/>
    <line x1="15" y1="50" x2="85" y2="50" class="wood-grain"/>
    <line x1="15" y1="55" x2="85" y2="55" class="wood-grain"/>
    <!-- Nägel -->
    <circle cx="20" cy="50" r="1" fill="#451a03"/>
    <circle cx="80" cy="50" r="1" fill="#451a03"/>
</svg>""",
            "plank_vertical": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .wood { fill: #92400e; }
            .wood-grain { stroke: #451a03; stroke-width: 0.5; }
        </style>
    </defs>
    <!-- Vertikale Planke -->
    <rect x="40" y="10" width="20" height="80" rx="2" class="wood"/>
    <!-- Holzmaserung -->
    <line x1="45" y1="15" x2="45" y2="85" class="wood-grain"/>
    <line x1="50" y1="15" x2="50" y2="85" class="wood-grain"/>
    <line x1="55" y1="15" x2="55" y2="85" class="wood-grain"/>
    <!-- Nägel -->
    <circle cx="50" cy="20" r="1" fill="#451a03"/>
    <circle cx="50" cy="80" r="1" fill="#451a03"/>
</svg>"""
        }
        return elements.get(element, self._generate_placeholder(element, rules))
    
    def _generate_ui_button(self, button: str, rules: Dict) -> str:
        """Generiert moderne UI Button Icons"""
        buttons = {
            "play": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Kreis-Button -->
    <circle cx="50" cy="50" r="35" fill="url(#playGrad)" stroke="#15803d" stroke-width="2"/>
    <!-- Play-Symbol -->
    <path d="M42 35 L65 50 L42 65 Z" fill="white"/>
    <!-- Schatten für 3D-Effekt -->
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
</svg>""",
            "pause": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="pauseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Kreis-Button -->
    <circle cx="50" cy="50" r="35" fill="url(#pauseGrad)" stroke="#b45309" stroke-width="2"/>
    <!-- Pause-Symbol -->
    <rect x="40" y="35" width="6" height="30" fill="white" rx="2"/>
    <rect x="54" y="35" width="6" height="30" fill="white" rx="2"/>
    <!-- Schatten -->
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
</svg>""",
            "settings": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#64748b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#475569;stop-opacity:1" />
        </linearGradient>
    </defs>
    <!-- Kreis-Button -->
    <circle cx="50" cy="50" r="35" fill="url(#settingsGrad)" stroke="#334155" stroke-width="2"/>
    <!-- Zahnrad -->
    <circle cx="50" cy="50" r="12" fill="white"/>
    <circle cx="50" cy="50" r="6" fill="url(#settingsGrad)"/>
    <!-- Zähne -->
    <rect x="48" y="28" width="4" height="8" fill="white"/>
    <rect x="48" y="64" width="4" height="8" fill="white"/>
    <rect x="28" y="48" width="8" height="4" fill="white"/>
    <rect x="64" y="48" width="8" height="4" fill="white"/>
    <!-- Diagonale Zähne -->
    <rect x="35" y="33" width="6" height="4" fill="white" transform="rotate(45 38 35)"/>
    <rect x="59" y="33" width="6" height="4" fill="white" transform="rotate(-45 62 35)"/>
    <rect x="35" y="63" width="6" height="4" fill="white" transform="rotate(-45 38 65)"/>
    <rect x="59" y="63" width="6" height="4" fill="white" transform="rotate(45 62 65)"/>
    <!-- Schatten -->
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="rgba(0,0,0,0.2)"/>
</svg>"""
        }
        return buttons.get(button, self._generate_placeholder(button, rules))
    
    def _generate_character(self, character: str, rules: Dict) -> str:
        """Generiert detaillierte Charakter Avatare"""
        characters = {
            "teacher": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .skin { fill: #fde68a; }
            .hair { fill: #92400e; }
            .clothes { fill: #3b82f6; }
            .eyes { fill: #1f2937; }
            .text { font-family: Inter, sans-serif; font-size: 7px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Kopf -->
    <circle cx="50" cy="30" r="18" class="skin"/>
    <!-- Haare mit Brille -->
    <path d="M35 20 Q50 12 65 20 Q50 8 35 20" class="hair"/>
    <!-- Brille -->
    <circle cx="44" cy="27" r="6" fill="none" stroke="#1f2937" stroke-width="1"/>
    <circle cx="56" cy="27" r="6" fill="none" stroke="#1f2937" stroke-width="1"/>
    <line x1="50" y1="25" x2="50" y2="27" stroke="#1f2937" stroke-width="1"/>
    <!-- Augen -->
    <circle cx="44" cy="27" r="2" class="eyes"/>
    <circle cx="56" cy="27" r="2" class="eyes"/>
    <!-- Lächeln -->
    <path d="M45 35 Q50 38 55 35" stroke="#1f2937" stroke-width="1" fill="none"/>
    <!-- Körper (Anzug) -->
    <rect x="35" y="48" width="30" height="30" rx="4" class="clothes"/>
    <!-- Krawatte -->
    <path d="M50 48 L47 58 L53 58 Z" fill="#dc2626"/>
    <!-- Hemd -->
    <rect x="42" y="52" width="16" height="4" fill="white"/>
    <!-- Arme -->
    <rect x="25" y="53" width="8" height="18" rx="4" class="skin"/>
    <rect x="67" y="53" width="8" height="18" rx="4" class="skin"/>
    <!-- Beine -->
    <rect x="40" y="78" width="8" height="15" rx="4" fill="#1f2937"/>
    <rect x="52" y="78" width="8" height="15" rx="4" fill="#1f2937"/>
    <text x="50" y="98" class="text">Lehrer</text>
</svg>""",
            "student_male": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .skin { fill: #fde68a; }
            .hair { fill: #451a03; }
            .clothes { fill: #ef4444; }
            .eyes { fill: #1f2937; }
            .text { font-family: Inter, sans-serif; font-size: 7px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Kopf -->
    <circle cx="50" cy="32" r="16" class="skin"/>
    <!-- Haare (kurz) -->
    <path d="M37 22 Q50 16 63 22 Q50 12 37 22" class="hair"/>
    <!-- Augen -->
    <circle cx="45" cy="29" r="2" class="eyes"/>
    <circle cx="55" cy="29" r="2" class="eyes"/>
    <!-- Lächeln -->
    <path d="M47 37 Q50 39 53 37" stroke="#1f2937" stroke-width="1" fill="none"/>
    <!-- T-Shirt -->
    <rect x="37" y="48" width="26" height="25" rx="3" class="clothes"/>
    <!-- Logo auf T-Shirt -->
    <circle cx="50" cy="58" r="4" fill="white"/>
    <!-- Arme -->
    <rect x="30" y="50" width="6" height="15" rx="3" class="skin"/>
    <rect x="64" y="50" width="6" height="15" rx="3" class="skin"/>
    <!-- Jeans -->
    <rect x="40" y="73" width="20" height="18" rx="2" fill="#1e40af"/>
    <!-- Beine -->
    <rect x="42" y="91" width="6" height="2" fill="#1f2937"/>
    <rect x="52" y="91" width="6" height="2" fill="#1f2937"/>
    <text x="50" y="98" class="text">Schüler</text>
</svg>""",
            "student_female": """<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .skin { fill: #fde68a; }
            .hair { fill: #f59e0b; }
            .clothes { fill: #ec4899; }
            .eyes { fill: #1f2937; }
            .text { font-family: Inter, sans-serif; font-size: 7px; fill: #0f172a; text-anchor: middle; }
        </style>
    </defs>
    <!-- Kopf -->
    <circle cx="50" cy="32" r="16" class="skin"/>
    <!-- Lange Haare -->
    <path d="M35 22 Q50 12 65 22 Q50 5 35 22" class="hair"/>
    <path d="M35 22 Q40 35 35 45" class="hair"/>
    <path d="M65 22 Q60 35 65 45" class="hair"/>
    <!-- Augen -->
    <circle cx="45" cy="29" r="2" class="eyes"/>
    <circle cx="55" cy="29" r="2" class="eyes"/>
    <!-- Wimpern -->
    <path d="M43 27 L44 26" stroke="#1f2937" stroke-width="0.5"/>
    <path d="M53 27 L54 26" stroke="#1f2937" stroke-width="0.5"/>
    <!-- Lächeln -->
    <path d="M47 37 Q50 39 53 37" stroke="#1f2937" stroke-width="1" fill="none"/>
    <!-- Kleid -->
    <path d="M37 48 L63 48 L68 73 L32 73 Z" class="clothes"/>
    <!-- Muster auf Kleid -->
    <circle cx="45" cy="58" r="2" fill="white"/>
    <circle cx="55" cy="63" r="2" fill="white"/>
    <!-- Arme -->
    <rect x="28" y="50" width="6" height="15" rx="3" class="skin"/>
    <rect x="66" y="50" width="6" height="15" rx="3" class="skin"/>
    <!-- Beine -->
    <rect x="42" y="73" width="6" height="18" rx="3" class="skin"/>
    <rect x="52" y="73" width="6" height="18" rx="3" class="skin"/>
    <!-- Schuhe -->
    <rect x="40" y="91" width="8" height="3" fill="#dc2626"/>
    <rect x="52" y="91" width="8" height="3" fill="#dc2626"/>
    <text x="50" y="98" class="text">Schülerin</text>
</svg>"""
        }
        return characters.get(character, self._generate_placeholder(character, rules))
    
    def _generate_placeholder(self, item: str, rules: Dict) -> str:
        """Generiert professionelle Platzhalter-SVG"""
        return f"""<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .placeholder {{ fill: #f3f4f6; stroke: #d1d5db; stroke-width: 2; }}
            .placeholder-text {{ font-family: Inter, sans-serif; font-size: 8px; fill: #6b7280; text-anchor: middle; }}
            .placeholder-label {{ font-family: Inter, sans-serif; font-size: 6px; fill: #9ca3af; text-anchor: middle; }}
        </style>
    </defs>
    <rect x="15" y="15" width="70" height="70" rx="8" class="placeholder"/>
    <circle cx="50" cy="40" r="8" fill="#d1d5db"/>
    <rect x="35" y="55" width="30" height="4" rx="2" fill="#d1d5db"/>
    <rect x="40" y="65" width="20" height="3" rx="1.5" fill="#d1d5db"/>
    <text x="50" y="92" class="placeholder-text">{item.replace('_', ' ').title()}</text>
</svg>"""
    
    def _generate_title(self, family: str, item: str) -> str:
        """Generiert benutzerfreundlichen Titel"""
        title_map = {
            "icons_values": {
                "equality": "Gleichheit Icon",
                "freedom": "Freiheit Icon", 
                "solidarity": "Solidarität Icon",
                "justice": "Gerechtigkeit Icon"
            },
            "characters": {
                "teacher": "Lehrer Avatar",
                "student_male": "Schüler Avatar",
                "student_female": "Schülerin Avatar"
            },
            "ui_buttons": {
                "play": "Play Button",
                "pause": "Pause Button", 
                "settings": "Einstellungen Button"
            }
        }
        
        if family in title_map and item in title_map[family]:
            return title_map[family][item]
        
        return f"{item.replace('_', ' ').title()} ({family.replace('_', ' ').title()})"
    
    def _generate_alt_text(self, family: str, item: str) -> str:
        """Generiert detaillierten Alt-Text für Accessibility"""
        alt_map = {
            "icons_values": {
                "equality": "Symbol für Gleichheit - Zwei identische Kreise mit ausbalancierter Waage, symbolisiert gleiche Rechte und Chancen",
                "freedom": "Symbol für Freiheit - Stilisierter Vogel im Flug über dem Horizont, symbolisiert Bewegungsfreiheit und Selbstbestimmung",
                "solidarity": "Symbol für Solidarität - Zwei sich reichende Hände mit Herz, symbolisiert Zusammenhalt und gegenseitige Unterstützung", 
                "justice": "Symbol für Gerechtigkeit - Ausbalancierte Waage mit gleichen Gewichten, symbolisiert faire Rechtsprechung"
            },
            "characters": {
                "teacher": "Lehrer Avatar - Person mit Brille, Anzug und Krawatte in professioneller Haltung",
                "student_male": "Schüler Avatar - Junger Mann in T-Shirt und Jeans mit freundlichem Lächeln",
                "student_female": "Schülerin Avatar - Junge Frau mit langen Haaren in rosa Kleid"
            },
            "ui_buttons": {
                "play": "Play Button - Grüner Kreis mit weißem Dreieck-Symbol für Start/Wiedergabe",
                "pause": "Pause Button - Orange Kreis mit zwei weißen Balken für Pause/Stopp",
                "settings": "Einstellungen Button - Grauer Kreis mit Zahnrad-Symbol für Konfiguration"
            }
        }
        
        if family in alt_map and item in alt_map[family]:
            return alt_map[family][item]
        
        return f"{self._generate_title(family, item)} - Grafisches Element für das Educational Gaming System"
    
    def _generate_tags(self, family: str, item: str) -> List[str]:
        """Generiert relevante Tags für Suche und Organisation"""
        base_tags = ["educational", "gaming", "democracy", "ui", "svg", "accessible"]
        
        family_tags = {
            "icons_values": ["icon", "value", "democracy", "concept", "symbol"],
            "map_regions": ["map", "geography", "austria", "region", "isometric"],
            "minigames_bridge_puzzle": ["game", "puzzle", "bridge", "element", "interactive"],
            "ui_buttons": ["button", "interface", "control", "ui", "interactive"],
            "characters": ["character", "avatar", "person", "role", "human"]
        }
        
        tags = base_tags + family_tags.get(family, [])
        tags.append(item.replace("_", "-"))
        
        return list(set(tags))
    
    def _get_usage_contexts(self, family: str, item: str) -> List[str]:
        """Definiert empfohlene Verwendungskontexte"""
        contexts = {
            "icons_values": ["Democracy learning modules", "Value-based exercises", "Concept explanation"],
            "map_regions": ["Geography games", "Regional quizzes", "Austria exploration"],
            "minigames_bridge_puzzle": ["Bridge building game", "Logic puzzles", "Problem solving"],
            "ui_buttons": ["Game controls", "Interface elements", "Navigation"],
            "characters": ["Role-playing scenarios", "Character selection", "Storytelling"]
        }
        
        return contexts.get(family, ["General educational gaming"])

def main():
    """CLI Interface für das vereinfachte Asset Management"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Simple Educational Game Asset Manager")
    parser.add_argument("--action", choices=["generate", "validate", "all"], 
                       default="all", help="Action to perform")
    parser.add_argument("--family", help="Specific asset family to process")
    parser.add_argument("--output", help="Output directory", default="./web/games")
    
    args = parser.parse_args()
    
    print("🎮 Simple Asset Management System")
    print("   Educational Gaming Platform - Democracy Learning")
    print()
    
    manager = SimpleAssetManager(args.output)
    
    if args.action in ["generate", "all"]:
        if args.family:
            if args.family in manager.asset_families:
                results = manager.generate_batch_assets(args.family)
                success_count = sum(1 for r in results if r['status'] == 'success')
                print(f"✅ Generated {success_count}/{len(results)} assets for {args.family}")
            else:
                print(f"❌ Unknown family: {args.family}")
                print(f"Available families: {list(manager.asset_families.keys())}")
        else:
            results = manager.generate_all_assets()
            total_families = len(results)
            successful_families = sum(1 for r in results.values() if isinstance(r, list))
            total_assets = sum(len(r) for r in results.values() if isinstance(r, list))
            successful_assets = sum(
                sum(1 for item in r if item['status'] == 'success') 
                for r in results.values() if isinstance(r, list)
            )
            
            print()
            print("📊 Generation Summary:")
            print(f"   Families processed: {successful_families}/{total_families}")
            print(f"   Assets generated: {successful_assets}/{total_assets}")
            print(f"   Success rate: {(successful_assets/total_assets*100):.1f}%")

if __name__ == "__main__":
    main()