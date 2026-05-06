# MÖ Brand Plugin für Claude Code & Cowork

**Menschlichkeit Österreich – Brand Guidelines v1.0 als Claude Code Plugin**

Dieses Plugin macht die vollständigen Markenrichtlinien von Menschlichkeit Österreich für Claude Code Agenten und Cowork verfügbar. Es erstellt, prüft und exportiert alle Brand-Assets im definierten Stil.

## Installation

### Claude Code (Terminal)

```bash
# Lokal testen
claude --plugin-dir ./moe-brand-plugin

# Oder aus einem Marketplace installieren
claude /plugin install <marketplace-url>/moe-brand-plugin
```

### Cowork (Desktop)

1. Plugin-Ordner entpacken
2. In Cowork: Einstellungen → Plugins → Ordner hinzufügen → `moe-brand-plugin/` wählen
3. Plugin wird automatisch geladen

## Verfügbare Skills

| Skill           | Befehl                      | Funktion                                    |
| --------------- | --------------------------- | ------------------------------------------- |
| Brand-Check     | `/moe-brand:brand-check`    | Zentrale Richtlinien-Referenz & Validierung |
| Social Media    | `/moe-brand:social-media`   | Instagram, Facebook, LinkedIn Grafiken      |
| E-Mail-Signatur | `/moe-brand:email-signatur` | HTML-Signaturen für E-Mail-Programme        |
| Briefpapier     | `/moe-brand:briefpapier`    | DIN A4 Briefe und formelle Dokumente        |
| Präsentation    | `/moe-brand:praesentation`  | Pitch-Decks, Workshop-Folien                |
| Flyer & Poster  | `/moe-brand:flyer-poster`   | Print-Material, Roll-Ups, Visitenkarten     |
| Infografik      | `/moe-brand:infografik`     | Diagramme, Kennzahlen, Wirkungsberichte     |
| Brand Voice     | `/moe-brand:text-voice`     | Texte schreiben & prüfen                    |
| Logo-Export     | `/moe-brand:logo-export`    | Logo-Varianten & Exporte                    |
| Farb-Kontrast   | `/moe-brand:farb-kontrast`  | WCAG-Kontrastprüfung                        |

## Schnellbefehle (Commands)

| Befehl                    | Funktion                                 |
| ------------------------- | ---------------------------------------- |
| `/moe-brand:farben`       | Farbpalette als Schnellreferenz          |
| `/moe-brand:typo`         | Typografie-Regeln                        |
| `/moe-brand:css-vars`     | CSS Custom Properties zum Kopieren       |
| `/moe-brand:checkliste`   | 10-Punkte-Prüfliste vor Veröffentlichung |
| `/moe-brand:canva-setup`  | Canva Brand Kit Einrichtungsanleitung    |
| `/moe-brand:cowork-guide` | Cowork & Claude Code Integrations-Tipps  |

## Agents

| Agent            | Funktion                                         |
| ---------------- | ------------------------------------------------ |
| `brand-designer` | Erstellt komplette Asset-Pakete (Standard-Agent) |
| `brand-reviewer` | Prüft Assets auf Brand-Konformität               |

## Anwendungsbeispiele

```
# Social-Media-Post erstellen
> Erstelle einen Instagram-Post zum Thema "Demokratie-Workshop am 15. April"

# E-Mail-Signatur generieren
> /moe-brand:email-signatur Maria Huber, Vorstandsmitglied

# Bestehenden Text prüfen
> /moe-brand:text-voice [Text hier einfügen]

# Farben prüfen
> /moe-brand:farb-kontrast #D4611E auf #FFFFFF

# Komplettes Event-Kit
> Erstelle für den Workshop "Demokratie erleben" am 20. Mai:
> - Instagram-Post
> - Facebook-Event-Grafik
> - Flyer DIN lang
> - Pressemitteilung
```

## Marken-Kerndaten

| Eigenschaft   | Wert                                                             |
| ------------- | ---------------------------------------------------------------- |
| Verein        | Menschlichkeit Österreich                                        |
| ZVR           | 1182213083                                                       |
| Sitz          | 3140 Pottenbrunn                                                 |
| Claim         | Gemeinsam gestalten – Ein Österreich, das niemanden zurücklässt. |
| Website       | menschlichkeit-oesterreich.at                                    |
| Primärfarbe   | #D4611E (Logo-Orange) / #B54A0F (Text-Orange)                    |
| Sekundärfarbe | #1B4965 (Demokratie-Blau)                                        |
| Headline-Font | Nunito Sans                                                      |
| Body-Font     | Source Sans 3                                                    |
| Icon-System   | Phosphor Icons                                                   |

## Dateistruktur

```
moe-brand-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin-Manifest
├── skills/
│   ├── brand-check/SKILL.md     # Zentrale Richtlinien
│   ├── social-media/SKILL.md    # Social-Media-Templates
│   ├── email-signatur/SKILL.md  # E-Mail-Signaturen
│   ├── briefpapier/SKILL.md     # Briefvorlagen
│   ├── praesentation/SKILL.md   # Folien-Präsentationen
│   ├── flyer-poster/SKILL.md    # Print-Material
│   ├── infografik/SKILL.md      # Datenvisualisierung
│   ├── text-voice/SKILL.md      # Brand Voice & Texte
│   ├── logo-export/SKILL.md     # Logo-Varianten
│   └── farb-kontrast/SKILL.md   # WCAG-Prüfung
├── agents/
│   ├── brand-designer.md        # Haupt-Design-Agent
│   └── brand-reviewer.md        # Qualitätsprüfer
├── commands/
│   ├── farben.md                # Farbpalette
│   ├── typo.md                  # Typografie
│   ├── css-vars.md              # CSS Variables
│   ├── checkliste.md            # Prüfliste
│   ├── canva-setup.md           # Canva Brand Kit Anleitung
│   └── cowork-guide.md          # Cowork & Claude Code Guide
├── hooks/
│   └── hooks.json               # Auto-Reminder bei HTML/SVG/CSS
├── templates/
│   ├── moe-brand-starter.css    # Vollständiges CSS mit allen Tokens
│   ├── tailwind.config.moe.js   # Tailwind CSS Konfiguration
│   ├── MOe-Email-Signatur-Vorlage.html
│   ├── MOe-Briefpapier-A4-Vorlage.html
│   └── MOe-Social-Template-Mission-Blau.svg
├── settings.json                # Standard-Agent-Einstellung
└── README.md                    # Dokumentation
```

## Prinzipien

1. **Nicht neu gestalten** – bestehenden Stil ableiten und ergänzen
2. **WCAG AA minimum** – Barrierefreiheit ist nicht optional
3. **Konsistenz** – jedes Asset stärkt die Marke
4. **Authentizität** – echte Menschen, echte Geschichten

## Lizenz

MIT – Erstellt für den Verein Menschlichkeit Österreich

## Version

v1.0.0 – März 2026
