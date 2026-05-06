#!/usr/bin/env bash

# GitHub Repository Cleanup Script
# Hilft beim Identifizieren und Entfernen alter Repositories

echo "🔍 GitHub Repository Cleanup Helper"
echo "=================================="
echo

# GitHub CLI prüfen
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) ist nicht installiert."
    echo "   Installation: https://cli.github.com/"
    echo "   Oder verwenden Sie die manuelle Methode aus GITHUB-REPOSITORY-CLEANUP-GUIDE.md"
    exit 1
fi

# GitHub Authentication prüfen
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI nicht authentifiziert."
    echo "   Führen Sie aus: gh auth login"
    exit 1
fi

# Repository-Lösch-Berechtigung prüfen
echo "🔐 Überprüfe Repository-Lösch-Berechtigungen..."
if ! gh auth status | grep -q "delete_repo"; then
    echo "❌ Fehlende delete_repo Berechtigung."
    echo "   Führen Sie aus: gh auth refresh -h github.com -s delete_repo"
    echo "   Dann starten Sie das Script erneut."
    exit 1
fi

echo "✅ GitHub CLI ist bereit mit delete_repo Berechtigung"
echo

# Alle Repositories des Users anzeigen
echo "📋 Alle GitHub Repositories:"
echo "----------------------------"
gh repo list --limit 50

echo
echo "🎯 IDENTIFIZIERTE REPOSITORIES ZUM LÖSCHEN:"
echo "============================================"
echo
echo "✅ BEHALTEN (Haupt-Repository):"
echo "   - Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development"
echo
echo "❌ ZU LÖSCHEN (konsolidiert in Haupt-Repository):"
echo "   - peschull/menschlichkeit-oesterreich-monorepo"
echo "   - peschull/menschlichkeit-oesterreich" 
echo "   - peschull/crm.menschlichkeit-oesterreich"
echo "   - peschull/api.menschlichkeit-oesterreich"
echo
echo "❓ PRÜFEN (nicht projekt-relevant):"
echo "   - peschull/webgames (anderes Projekt)"
echo
echo "🎯 Empfohlene Aktionen:"
echo "======================"
echo
echo "1. Führen Sie die unten stehenden Befehle aus:"
echo "2. Jeder Befehl löscht ein konsolidiertes Repository"
echo "3. Bestätigen Sie jede Löschung einzeln"
echo
echo "⚠️  WARNUNG: Repository-Löschung ist UNWIDERRUFLICH!"
echo
echo "� SCHRITT 1: Berechtigung aktivieren"
echo "====================================="
echo "gh auth refresh -h github.com -s delete_repo"
echo
echo "�🗑️ SCHRITT 2: LÖSCH-BEFEHLE (nach Berechtigung ausführen):"
echo "=========================================================="
echo
echo "# 1. Monorepo-Duplikat löschen"
echo "gh repo delete peschull/menschlichkeit-oesterreich-monorepo --yes"
echo
echo "# 2. Ursprüngliches Haupt-Repository löschen (jetzt konsolidiert)"  
echo "gh repo delete peschull/menschlichkeit-oesterreich --yes"
echo
echo "# 3. Separates CRM-Repository löschen"
echo "gh repo delete peschull/crm.menschlichkeit-oesterreich --yes"
echo
echo "# 4. Separates API-Repository löschen"
echo "gh repo delete peschull/api.menschlichkeit-oesterreich --yes"
echo
echo "✅ Behalten Sie nur: menschlichkeit-oesterreich-development"