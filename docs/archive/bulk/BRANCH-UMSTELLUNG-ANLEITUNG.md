# Anleitung: Default-Branch auf chore/figma-mcp-make umstellen

## ✅ Status

- **Aktueller Arbeitsbranch:** `chore/figma-mcp-make` (alle Ihre Arbeit ist hier)
- **Lokaler main Branch:** Gelöscht ✅
- **Remote main Branch:** Noch vorhanden (kann nicht automatisch gelöscht werden)

## 🔧 Manuelle Schritte auf GitHub (erforderlich)

### 1. Default-Branch umstellen

1. Öffnen Sie: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/branches
2. Unter "Default branch" klicken Sie auf das ⇄ Symbol (Switch)
3. Wählen Sie `chore/figma-mcp-make` aus
4. Klicken Sie "Update" und bestätigen Sie die Warnung

### 2. Main Branch löschen (nach Umstellung)

Nach dem Umstellen des Default-Branches können Sie `main` löschen:

**Option A: Über GitHub UI**

1. Gehen Sie zu: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/branches
2. Suchen Sie `main` in der Liste
3. Klicken Sie auf das 🗑️ Symbol (Delete)

**Option B: Über Terminal** (nach Default-Branch-Umstellung)

```bash
git push origin --delete main
```

### 3. Lokale Git-Konfiguration aktualisieren

Nach dem Löschen von main auf GitHub:

```bash
# Remote-Tracking aktualisieren
git fetch --prune

# Default-Branch lokal auf chore/figma-mcp-make setzen
git remote set-head origin chore/figma-mcp-make

# Überprüfen
git branch -a
```

## 📋 Ergebnis

Nach diesen Schritten:

- ✅ `chore/figma-mcp-make` ist der einzige Branch
- ✅ `chore/figma-mcp-make` ist der Default-Branch auf GitHub
- ✅ Alle Ihre Arbeit ist geschützt und aktiv
- ✅ `main` existiert nicht mehr

## 🔄 Alternative: Umbenennen statt Löschen

Falls Sie den Branch-Namen `chore/figma-mcp-make` zu `main` umbenennen möchten:

```bash
# Lokal umbenennen
git branch -m chore/figma-mcp-make main

# Remote löschen und neu pushen
git push origin :chore/figma-mcp-make main

# Default-Branch auf GitHub auf main setzen (siehe oben)

# Upstream setzen
git push -u origin main
```

---

**Hinweis:** Diese Datei kann gelöscht werden, nachdem Sie die Umstellung abgeschlossen haben.
