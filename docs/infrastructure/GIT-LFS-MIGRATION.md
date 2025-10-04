# Git LFS Migration Guide

_Last updated: 2025-10-05_

## 1. Ziel

Große binäre Assets (PDF, Medien, Archivdateien) werden via [Git Large File Storage](https://git-lfs.github.com/) versioniert, um das Repo schlank zu halten und Bandbreite bei Clones/CI zu sparen.

## 2. Aktueller Stand

- `.gitattributes` konfiguriert folgende Patterns für LFS:
  - `*.pdf`, `*.jar`, `*.phar`, `*.zip`, `*.7z`
  - gängige Medienformate (`*.png`, `*.jpg`, `*.mp4`, ...)
  - explizit das Verzeichnis `Pdf/`
- Neue Commits schreiben automatisch LFS-Pointer für diese Dateitypen, sobald `git lfs` installiert ist.

## 3. Voraussetzungen

```bash
# Installation (lokal / CI Container)
brew install git-lfs        # macOS
apt-get install git-lfs     # Debian/Ubuntu
choco install git-lfs       # Windows

# Repository vorbereiten
git lfs install --skip-smudge
```

> `--skip-smudge` verhindert das automatische Auschecken großer Dateien bei CI-Builds. Für Entwickler:innen optional.

## 4. Migration bestehender Dateien

> ⚠️ Die folgenden Schritte überschreiben die Arbeitskopie. Führe sie auf einem frischen Branch aus und committe anschließend die LFS-Pointer.

```bash
# Stelle sicher, dass keine ungesicherten Änderungen vorliegen
git status

# Lade LFS-Filterregeln aus .gitattributes
git lfs install

# Konvertiere große Assets im aktuellen HEAD in LFS-Pointer
# (ohne Historie umzuschreiben)
git lfs migrate import --yes --include="*.pdf,*.jar,*.phar,*.zip,*.7z,*.png,*.jpg,*.jpeg" --fixup HEAD

# Arbeitskopie prüfen
git status

# Pointer + .gitattributes committen
git add .gitattributes Pdf/*.pdf .codacy/codacy-analysis-cli-assembly.jar vendor/phpstan/phpstan/phpstan.phar
# ggf. weitere Dateien ergänzen
git commit -m "chore: migrate large binaries to git lfs"
```

### Optional: Historie bereinigen

Soll die gesamte Historie von großen Dateien befreit werden, kann `git lfs migrate import --everything` eingesetzt werden. Das rewritet History und erfordert Force-Pushs – nur nach Team-Absprache verwenden.

## 5. CI Integration

Ergänze die folgenden Schritte in Build-Pipelines (z. B. GitHub Actions):

```yaml
- uses: actions/checkout@v4
  with:
    lfs: true
- run: git lfs install --local --skip-smudge
```

## 6. Monitoring & Policy

1. Für neue Dateitypen den Pattern-Katalog in `.gitattributes` erweitern.
2. `git lfs ls-files` erlaubt Kontrolle, ob alle großen Dateien korrekt erfasst sind.
3. In `docs/Repo & MCP-Server Optimierung.md` unter Phase 1 wurde der Punkt „Git LFS Migration“ abgeschlossen.

## 7. Offene Punkte

- Historische Commits >50 MB prüfen und ggf. Bereinigung planen (`git lfs migrate import --everything`).
- Team-Wiki um LFS-Onboarding ergänzen (z. B. `docs/governance/DEVELOPER-ONBOARDING.md`).
