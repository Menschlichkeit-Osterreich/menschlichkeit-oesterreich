#!/usr/bin/env python3
"""
Asset Management System Integration
Integriert das meta_thumbnail_tool mit dem Educational Gaming System
"""

import os
import sys
import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional

# Import the original meta_thumbnail_tool
sys.path.append(str(Path(__file__).parent))
from meta_thumbnail_tool import AssetMetadataGenerator, AssetProcessor, ColorAnalyzer

class EducationalGameAssetManager:
    """
    Asset Manager für das Educational Gaming System
    Integriert Batch-Verarbeitung, Metadaten-Generierung und Qualitätskontrolle
    """
    
    def __init__(self, base_path: str = "./web/games"):
        self.base_path = Path(base_path)
        self.assets_path = self.base_path / "assets"
        self.generated_path = self.assets_path / "generated"
        self.metadata_path = self.assets_path / "metadata"
        
        # Erstelle Verzeichnisse
        self.assets_path.mkdir(exist_ok=True)
        self.generated_path.mkdir(exist_ok=True)
        self.metadata_path.mkdir(exist_ok=True)
        
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
        
        # Initialisiere Tools
        self.metadata_generator = AssetMetadataGenerator()
        self.asset_processor = AssetProcessor()
        self.color_analyzer = ColorAnalyzer()
    
    def generate_batch_assets(self, family_name: str) -> List[Dict]:
        """
        Generiert Assets für eine komplette Familie basierend auf den Templates
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
            
            # Generiere SVG basierend auf Typ
            svg_content = self._generate_svg_for_item(
                family_name, 
                item_name, 
                family['composition_rules']
            )
            
            # Speichere SVG
            svg_path = self.generated_path / f"{asset_id}.svg"
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            # Generiere Metadaten und Thumbnail
            try:
                metadata = self.metadata_generator.generate_metadata(
                    str(svg_path),
                    asset_id=asset_id,
                    title=self._generate_title(family_name, item_name),
                    alt_text=self._generate_alt_text(family_name, item_name),
                    tags=self._generate_tags(family_name, item_name)
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
                
            except Exception as e:
                print(f"❌ Error processing {asset_id}: {e}")
                results.append({
                    "asset_id": asset_id,
                    "family": family_name,
                    "item": item_name,
                    "svg_path": str(svg_path),
                    "error": str(e),
                    "status": "error"
                })
        
        return results
    
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
            "equality": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="30" r="15" fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/>
                    <circle cx="75" cy="30" r="15" fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/>
                    <rect x="20" y="55" width="60" height="8" rx="4" fill="#22c55e"/>
                    <text x="50" y="85" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Gleichheit</text>
                </svg>
            """,
            "freedom": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 70 L50 30 L70 70" stroke="#0ea5e9" stroke-width="3" fill="none"/>
                    <circle cx="50" cy="25" r="8" fill="#f59e0b"/>
                    <path d="M20 75 L80 75" stroke="#22c55e" stroke-width="2"/>
                    <text x="50" y="90" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Freiheit</text>
                </svg>
            """,
            "solidarity": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="35" cy="35" r="10" fill="#0ea5e9"/>
                    <circle cx="65" cy="35" r="10" fill="#0ea5e9"/>
                    <path d="M25 50 Q50 70 75 50" stroke="#22c55e" stroke-width="4" fill="none"/>
                    <text x="50" y="85" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Solidarität</text>
                </svg>
            """,
            "justice": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="45" y="20" width="10" height="40" fill="#64748b"/>
                    <rect x="25" y="35" width="50" height="4" fill="#0ea5e9"/>
                    <circle cx="35" cy="45" r="8" fill="#22c55e"/>
                    <circle cx="65" cy="45" r="8" fill="#22c55e"/>
                    <text x="50" y="80" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Gerechtigkeit</text>
                </svg>
            """
        }
        return icons.get(value, self._generate_placeholder(value, rules))
    
    def _generate_map_region(self, region: str, rules: Dict) -> str:
        """Generiert isometrische Karten-Tiles"""
        # Vereinfachte isometrische Tiles
        return f"""
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="regionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
                </linearGradient>
            </defs>
            <path d="M50 20 L80 35 L50 50 L20 35 Z" fill="url(#regionGrad)" stroke="#0284c7" stroke-width="1"/>
            <path d="M20 35 L50 50 L50 80 L20 65 Z" fill="#0284c7" opacity="0.7"/>
            <path d="M50 50 L80 35 L80 65 L50 80 Z" fill="#075985" opacity="0.8"/>
            <text x="50" y="45" text-anchor="middle" font-family="Inter" font-size="6" fill="white">{region.upper()}</text>
        </svg>
        """
    
    def _generate_bridge_element(self, element: str, rules: Dict) -> str:
        """Generiert Brücken-Puzzle Elemente"""
        elements = {
            "bridge_start": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="40" width="30" height="20" fill="#8B5CF6" rx="2"/>
                    <circle cx="35" cy="50" r="5" fill="#A855F7"/>
                </svg>
            """,
            "water": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="100" height="100" fill="#3B82F6"/>
                    <path d="M0 30 Q25 20 50 30 T100 30" stroke="#60A5FA" stroke-width="2" fill="none"/>
                    <path d="M0 60 Q25 50 50 60 T100 60" stroke="#60A5FA" stroke-width="2" fill="none"/>
                </svg>
            """,
            "plank_horizontal": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="40" width="80" height="20" fill="#92400E" rx="2"/>
                    <line x1="20" y1="45" x2="20" y2="55" stroke="#451A03" stroke-width="1"/>
                    <line x1="80" y1="45" x2="80" y2="55" stroke="#451A03" stroke-width="1"/>
                </svg>
            """
        }
        return elements.get(element, self._generate_placeholder(element, rules))
    
    def _generate_ui_button(self, button: str, rules: Dict) -> str:
        """Generiert UI Button Icons"""
        buttons = {
            "play": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" fill="#22C55E" stroke="#16A34A" stroke-width="2"/>
                    <path d="M40 35 L65 50 L40 65 Z" fill="white"/>
                </svg>
            """,
            "pause": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
                    <rect x="38" y="35" width="8" height="30" fill="white" rx="2"/>
                    <rect x="54" y="35" width="8" height="30" fill="white" rx="2"/>
                </svg>
            """,
            "settings": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" fill="#64748B" stroke="#475569" stroke-width="2"/>
                    <circle cx="50" cy="50" r="12" fill="white"/>
                    <path d="M50 30 L55 35 L50 40 L45 35 Z" fill="white"/>
                    <path d="M70 50 L65 55 L60 50 L65 45 Z" fill="white"/>
                    <path d="M50 70 L45 65 L50 60 L55 65 Z" fill="white"/>
                    <path d="M30 50 L35 45 L40 50 L35 55 Z" fill="white"/>
                </svg>
            """
        }
        return buttons.get(button, self._generate_placeholder(button, rules))
    
    def _generate_character(self, character: str, rules: Dict) -> str:
        """Generiert Charakter Avatare"""
        characters = {
            "teacher": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="20" fill="#FDE68A"/>
                    <circle cx="45" cy="27" r="2" fill="#1F2937"/>
                    <circle cx="55" cy="27" r="2" fill="#1F2937"/>
                    <path d="M45 35 Q50 38 55 35" stroke="#1F2937" stroke-width="1" fill="none"/>
                    <rect x="35" y="50" width="30" height="35" fill="#3B82F6" rx="5"/>
                    <rect x="40" y="55" width="20" height="5" fill="#1E40AF"/>
                    <text x="50" y="95" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Lehrer</text>
                </svg>
            """,
            "student_male": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="18" fill="#FDE68A"/>
                    <circle cx="45" cy="27" r="2" fill="#1F2937"/>
                    <circle cx="55" cy="27" r="2" fill="#1F2937"/>
                    <path d="M47 35 Q50 37 53 35" stroke="#1F2937" stroke-width="1" fill="none"/>
                    <rect x="37" y="48" width="26" height="32" fill="#EF4444" rx="4"/>
                    <text x="50" y="95" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Schüler</text>
                </svg>
            """,
            "student_female": """
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="30" r="18" fill="#FDE68A"/>
                    <path d="M35 25 Q50 15 65 25 Q50 35 35 25" fill="#F59E0B"/>
                    <circle cx="45" cy="27" r="2" fill="#1F2937"/>
                    <circle cx="55" cy="27" r="2" fill="#1F2937"/>
                    <path d="M47 35 Q50 37 53 35" stroke="#1F2937" stroke-width="1" fill="none"/>
                    <rect x="37" y="48" width="26" height="32" fill="#EC4899" rx="4"/>
                    <text x="50" y="95" text-anchor="middle" font-family="Inter" font-size="8" fill="#0f172a">Schülerin</text>
                </svg>
            """
        }
        return characters.get(character, self._generate_placeholder(character, rules))
    
    def _generate_placeholder(self, item: str, rules: Dict) -> str:
        """Generiert Platzhalter-SVG"""
        return f"""
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="80" height="80" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="2" rx="8"/>
            <text x="50" y="45" text-anchor="middle" font-family="Inter" font-size="8" fill="#6B7280">{item}</text>
            <text x="50" y="60" text-anchor="middle" font-family="Inter" font-size="6" fill="#9CA3AF">placeholder</text>
        </svg>
        """
    
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
            }
        }
        
        if family in title_map and item in title_map[family]:
            return title_map[family][item]
        
        return f"{item.replace('_', ' ').title()} ({family})"
    
    def _generate_alt_text(self, family: str, item: str) -> str:
        """Generiert Accessibility Alt-Text"""
        alt_map = {
            "icons_values": {
                "equality": "Symbol für Gleichheit - zwei gleiche Kreise mit verbindender Linie",
                "freedom": "Symbol für Freiheit - stilisierter Vogel im Flug",
                "solidarity": "Symbol für Solidarität - zwei verbundene Hände", 
                "justice": "Symbol für Gerechtigkeit - Waage im Gleichgewicht"
            }
        }
        
        if family in alt_map and item in alt_map[family]:
            return alt_map[family][item]
        
        return f"{self._generate_title(family, item)} - Grafisches Element für das Educational Gaming System"
    
    def _generate_tags(self, family: str, item: str) -> List[str]:
        """Generiert relevante Tags für Suche und Organisation"""
        base_tags = ["educational", "gaming", "democracy", "ui", "svg"]
        
        family_tags = {
            "icons_values": ["icon", "value", "democracy", "concept"],
            "map_regions": ["map", "geography", "austria", "region"],
            "minigames_bridge_puzzle": ["game", "puzzle", "bridge", "element"],
            "ui_buttons": ["button", "interface", "control", "ui"],
            "characters": ["character", "avatar", "person", "role"]
        }
        
        tags = base_tags + family_tags.get(family, [])
        tags.append(item.replace("_", "-"))
        
        return list(set(tags))
    
    def validate_assets(self) -> Dict:
        """
        Validiert generierte Assets auf Qualität und WCAG-Konformität
        """
        validation_results = {
            "total_assets": 0,
            "valid_assets": 0,
            "wcag_compliant": 0,
            "issues": []
        }
        
        for svg_file in self.generated_path.glob("*.svg"):
            validation_results["total_assets"] += 1
            
            try:
                # Lade Metadaten
                metadata_file = self.metadata_path / f"{svg_file.stem}.json"
                if metadata_file.exists():
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        metadata = json.load(f)
                    
                    # Prüfe WCAG Konformität
                    contrast_ratio = metadata.get('contrast_ratio', 0)
                    if contrast_ratio >= 4.5:  # WCAG AA Standard
                        validation_results["wcag_compliant"] += 1
                    
                    validation_results["valid_assets"] += 1
                else:
                    validation_results["issues"].append(f"Missing metadata for {svg_file.name}")
                    
            except Exception as e:
                validation_results["issues"].append(f"Error validating {svg_file.name}: {e}")
        
        return validation_results

def main():
    """CLI Interface für Asset Management"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Educational Game Asset Manager")
    parser.add_argument("--action", choices=["generate", "validate", "all"], 
                       default="all", help="Action to perform")
    parser.add_argument("--family", help="Specific asset family to process")
    parser.add_argument("--output", help="Output directory", default="./web/games")
    
    args = parser.parse_args()
    
    manager = EducationalGameAssetManager(args.output)
    
    if args.action in ["generate", "all"]:
        if args.family:
            if args.family in manager.asset_families:
                results = manager.generate_batch_assets(args.family)
                print(f"Generated {len(results)} assets for {args.family}")
            else:
                print(f"Unknown family: {args.family}")
                print(f"Available families: {list(manager.asset_families.keys())}")
        else:
            results = manager.generate_all_assets()
            total = sum(len(r) for r in results.values() if isinstance(r, list))
            print(f"Generated {total} total assets across all families")
    
    if args.action in ["validate", "all"]:
        validation = manager.validate_assets()
        print(f"Validation Results:")
        print(f"  Total Assets: {validation['total_assets']}")
        print(f"  Valid Assets: {validation['valid_assets']}")
        print(f"  WCAG Compliant: {validation['wcag_compliant']}")
        if validation['issues']:
            print(f"  Issues: {len(validation['issues'])}")
            for issue in validation['issues'][:5]:  # Show first 5 issues
                print(f"    - {issue}")

if __name__ == "__main__":
    main()