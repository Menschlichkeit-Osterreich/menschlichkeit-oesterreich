# Branch-Umbenennung: chore/figma-mcp-make → main

## ✅ Bereits erledigt (lokal)

- ✅ Lokaler Branch wurde umbenannt: `chore/figma-mcp-make` → `main`
- ✅ Neuer Branch `main` wurde zu GitHub gepusht
- ✅ Sie befinden sich jetzt auf dem Branch `main`

## ⚠️ Manuelle Schritte erforderlich

Da die GitHub API-Berechtigung nicht ausreicht, müssen Sie den Default-Branch **manuell auf GitHub ändern**:

### Schritt 1: Default-Branch ändern

1. Öffnen Sie: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/branches
2. Unter "Default branch" klicken Sie auf den **Umschalter** (Switch-Icon)
3. Wählen Sie `main` aus der Liste
4. Klicken Sie auf **Update**
5. Bestätigen Sie mit **"I understand, update the default branch"**

### Schritt 2: Alten Branch löschen

Nach der Default-Branch-Änderung können Sie den alten Branch löschen:

```bash
git push origin --delete chore/figma-mcp-make
```

### Schritt 3: Branch-Protection-Regeln anpassen

Falls Branch-Protection-Regeln existieren:

1. Gehen Sie zu: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/branch_protection_rules
2. Aktualisieren Sie Regeln von `chore/figma-mcp-make` auf `main`
3. Oder erstellen Sie neue Regeln für `main`

## 🔍 Überprüfung

Nach der Änderung:

```bash
# Zeige Remote-Branches
git branch -r

# Zeige Default-Branch
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

## 📋 Aktueller Status

- **Lokaler Branch:** `main` ✅
- **Remote Branch:** `main` existiert ✅
- **GitHub Default-Branch:** Noch `chore/figma-mcp-make` ⚠️ (manuell ändern!)

---

**Datum:** 2025-10-10  
**Commits:**

- `1e1b5a0049215b23c75a3ccb8150569e84c025d5` (lokaler HEAD)
- `1e1b5a0020dbae7f5d9cfd23e1bd67c9f58b7d2d` (zuletzt gepushter Remote-Commit)
