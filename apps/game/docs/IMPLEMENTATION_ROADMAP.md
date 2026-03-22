# Implementation Roadmap

## Sofort blockierend
- Root-App als einzige Produktlaufzeit durchziehen
- Weltzustandsmodell, Rollen-Asymmetrie und Teacher-Review im `Gemeinde`-Slice stabil halten
- `v2` explizit nicht als Reparaturziel behandeln

## Hoch
- Welt 1 playtesten und Consequence-Tuning ueber echte Durchlaeufe nachschaerfen
- `Schule`, `Arbeit`, `Medien` auf dasselbe Szenario- und Teacher-Schema heben
- Save-State- und Analytics-Migration fuer spaetere Content-Wellen robust halten

## Mittel
- Rollen-Mastery und asynchrone Community-/Klassenformate vorbereiten
- AssetContainer-, SceneLoader- und externe Asset-Pipeline fuer spaetere 3D-Ausbaustufen planen
- Teacher-Exports um CSV oder PDF-nahe Formate erweitern

## Nice to have
- WebGPU-Fallback pfadweise aktivieren
- nicht-toxische Event- oder Community-Challenges
- spaetere visuelle Tiefenbohrung mit kuratierten Assets statt nur prozeduraler Geometrie

## Release-Stufen
1. Vertical Slice tief
   - Welt `Gemeinde`
   - alle 6 Rollen
   - persistenter Weltzustand
   - Teacher-Review lokal
2. MVP
   - Welten `Schule`, `Arbeit`, `Medien`
   - konsistente Difficulty- und Lernzielmatrix
   - erste Rollen-Mastery
3. Post-MVP
   - weitere Welten
   - asynchrone soziale Formate
   - optionaler Sync und staerkere Asset-Pipeline
