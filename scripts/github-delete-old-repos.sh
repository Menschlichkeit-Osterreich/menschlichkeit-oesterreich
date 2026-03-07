#!/usr/bin/env bash

# Direkter GitHub Repository Cleanup
# Löscht die identifizierten redundanten Repositories

echo "🗑️ GitHub Repository Cleanup - Direkte Ausführung"
echo "================================================="
echo

# Berechtigung prüfen
if ! gh auth status | grep -q "delete_repo"; then
    echo "❌ Fehlende delete_repo Berechtigung."
    echo "   Führen Sie zuerst aus: gh auth refresh -h github.com -s delete_repo"
    echo "   Dann starten Sie das Script erneut."
    exit 1
fi

echo "✅ Repository-Lösch-Berechtigung bestätigt"
echo
echo "Basierend auf 'gh repo list' werden folgende Repositories gelöscht:"
echo

# Bestätigung einholen
echo "❌ ZU LÖSCHENDE REPOSITORIES:"
echo "   - peschull/menschlichkeit-oesterreich-monorepo"
echo "   - peschull/menschlichkeit-oesterreich" 
echo "   - peschull/crm.menschlichkeit-oesterreich"
echo "   - peschull/api.menschlichkeit-oesterreich"
echo
echo "✅ BEHALTEN:"
echo "   - Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development (Haupt-Repository)"
echo "   - peschull/webgames (anderes Projekt)"
echo

read -p "🔥 Sind Sie sicher? Alle Inhalte sind im Haupt-Repository konsolidiert? (yes/no): " confirm

if [[ $confirm != "yes" ]]; then
    echo "❌ Abgebrochen. Keine Repositories gelöscht."
    exit 1
fi

echo
echo "🚀 Starte Repository-Löschung..."
echo

# Repository 1: Monorepo-Duplikat
echo "🗑️ Lösche: menschlichkeit-oesterreich-monorepo"
if gh repo delete peschull/menschlichkeit-oesterreich-monorepo --yes; then
    echo "✅ Erfolgreich gelöscht: monorepo"
else
    echo "❌ Fehler beim Löschen: monorepo"
fi

echo

# Repository 2: Ursprüngliches Haupt-Repository  
echo "🗑️ Lösche: menschlichkeit-oesterreich"
if gh repo delete peschull/menschlichkeit-oesterreich --yes; then
    echo "✅ Erfolgreich gelöscht: menschlichkeit-oesterreich"
else
    echo "❌ Fehler beim Löschen: menschlichkeit-oesterreich"
fi

echo

# Repository 3: CRM-Repository
echo "🗑️ Lösche: crm.menschlichkeit-oesterreich"
if gh repo delete peschull/crm.menschlichkeit-oesterreich --yes; then
    echo "✅ Erfolgreich gelöscht: crm"
else
    echo "❌ Fehler beim Löschen: crm"
fi

echo

# Repository 4: API-Repository
echo "🗑️ Lösche: api.menschlichkeit-oesterreich"
if gh repo delete peschull/api.menschlichkeit-oesterreich --yes; then
    echo "✅ Erfolgreich gelöscht: api"
else
    echo "❌ Fehler beim Löschen: api"
fi

echo
echo "🎉 Repository-Cleanup abgeschlossen!"
echo
echo "✅ Verbleibende Repositories:"
echo "   - Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development (Haupt-Repository)"
echo "   - peschull/webgames (separates Projekt)"
echo
echo "🔍 Überprüfung:"
gh repo list

echo
echo "✨ GitHub-Account ist jetzt bereinigt!"
echo "   Alle Projektinhalte befinden sich in:"
echo "   github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"