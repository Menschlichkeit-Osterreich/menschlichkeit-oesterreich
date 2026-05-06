---
description: Zeigt wie das MÖ Brand Plugin mit Cowork (Desktop) und Claude Code optimal genutzt wird. Tipps für Automatisierung und Workflows.
disable-model-invocation: true
---

# Cowork & Claude Code Integration – MÖ Brand Plugin

## In Cowork (Desktop-App)

### Plugin laden

1. Ordner `moe-brand-plugin/` an gewünschter Stelle ablegen
2. Cowork starten → Einstellungen → Plugins → Ordner wählen
3. Der `brand-designer` Agent wird automatisch als Standard aktiviert

### Typische Workflows

**Asset erstellen:**

> "Erstelle einen Instagram-Post für den Workshop Demokratie erleben am 15. Mai"
> → Agent nutzt `/moe-brand:social-media` und erstellt SVG/HTML

**Texte prüfen:**

> "Prüfe diesen Newsletter-Text auf Brand-Konformität: [Text]"
> → Agent nutzt `/moe-brand:text-voice` und gibt Feedback

**Komplettes Event-Kit:**

> "Erstelle ein komplettes Materialpaket für die Jahreshauptversammlung"
> → Agent kombiniert mehrere Skills (Einladung, Präsentation, Social Media)

## In Claude Code (Terminal)

### Plugin laden

```bash
claude --plugin-dir ./moe-brand-plugin
```

### Schnellbefehle

```
/moe-brand:farben        → Farbpalette
/moe-brand:typo           → Typografie-Regeln
/moe-brand:css-vars       → CSS Variables zum Kopieren
/moe-brand:checkliste     → Prüfliste vor Veröffentlichung
/moe-brand:canva-setup    → Canva Brand Kit Anleitung
```

### Skills direkt aufrufen

```
/moe-brand:social-media Workshop Demokratie erleben, 15. Mai 2026
/moe-brand:email-signatur Maria Huber, Vorstandsmitglied
/moe-brand:briefpapier Einladung Jahreshauptversammlung
/moe-brand:farb-kontrast #B54A0F auf #FFFFFF
```

### Agent wechseln

```
/agents                    → Liste aller Agents
brand-designer             → Erstellt Assets (Standard)
brand-reviewer             → Prüft Assets
```

## Best Practices

1. **Immer vom Template starten** – nie von Null. Nutze die Templates in `/templates/`
2. **Brand-Check am Ende** – jedes Asset vor Veröffentlichung durch den Reviewer laufen lassen
3. **Dateinamen-Schema einhalten** – `MOe-[Kategorie]-[Beschreibung]-[Version].[Format]`
4. **CSS Variables nutzen** – `/moe-brand:css-vars` kopieren statt Hex-Werte hardcoden
5. **Hooks beachten** – Bei HTML/SVG/CSS-Dateien erinnert das Plugin automatisch an die Checkliste
