# 🚀 Quick Fix: Default-Branch auf 'main' ändern

## ⚡ 1-Klick-Lösung

**Klicken Sie hier und folgen Sie den Schritten:**

➡️ **https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/settings/branches**

### Was Sie sehen werden:

1. **"Default branch"** Sektion ganz oben
2. Ein Button mit zwei Pfeilen (⇄) rechts neben `chore/figma-mcp-make`
3. **KLICKEN** Sie auf diesen Button
4. Wählen Sie **`main`** aus dem Dropdown
5. Klicken Sie **"Update"**
6. Bestätigen Sie mit **"I understand, update the default branch"**

## ✅ Fertig!

Danach läuft dieser Befehl automatisch:

```bash
git push origin --delete chore/figma-mcp-make
```

---

**Warum manuell?** 
Das GitHub Token hat keine `repo:admin` Berechtigung für Branch-Einstellungen.

**Dauer:** ~30 Sekunden ⏱️
