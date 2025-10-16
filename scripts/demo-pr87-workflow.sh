#!/bin/bash
# PR-87 Merge-Bot Workflow Demonstration
# Zeigt den kompletten Validierungs- und Merge-Prozess

set -e

echo "🤖 merge-bot: PR-87 Validierungs-Workflow"
echo "=========================================="
echo ""

# Agent-Kontext
export AGENT_NAME="merge-bot"
export AGENT_ROLE="validator"
export ENVIRONMENT="stage"
export PR_NUMBER=87
export USER="peschull"

echo "📋 Agent-Kontext:"
echo "  Name: $AGENT_NAME"
echo "  Rolle: $AGENT_ROLE"
echo "  Umgebung: $ENVIRONMENT"
echo "  PR: #$PR_NUMBER"
echo "  User: $USER"
echo ""

# Schritt 1: Validierung ausführen
echo "🔍 Schritt 1: PR-Validierung"
echo "----------------------------"
if pwsh scripts/validate-pr.ps1 -Environment "$ENVIRONMENT" -PullRequestNumber $PR_NUMBER -DryRun; then
    echo "✅ Validierung erfolgreich"
    VALIDATION_STATUS="passed"
else
    echo "❌ Validierung fehlgeschlagen"
    VALIDATION_STATUS="failed"
    echo ""
    echo "📝 Prüfe Konflikt-Log..."
    if [ -f "logs/conflicts/PR-${PR_NUMBER}.txt" ]; then
        cat "logs/conflicts/PR-${PR_NUMBER}.txt"
    fi
    exit 1
fi
echo ""

# Schritt 2: Audit-Tag erstellen
echo "🏷️  Schritt 2: Audit-Tag erstellen"
echo "---------------------------------"
pwsh scripts/create-audit-tag.ps1 \
    -PullRequestNumber $PR_NUMBER \
    -User "$USER" \
    -AgentId "$AGENT_NAME" \
    -Environment "$ENVIRONMENT"
echo ""

# Schritt 3: Audit-Logs anzeigen
echo "📋 Schritt 3: Audit-Trail anzeigen"
echo "----------------------------------"
echo "Audit-Logs in logs/audit/:"
ls -lh logs/audit/PR-*.txt 2>/dev/null | tail -5 || echo "Keine Audit-Logs gefunden"
echo ""

if [ -f "$(ls -t logs/audit/PR-${PR_NUMBER}-*.txt 2>/dev/null | head -1)" ]; then
    echo "Letzter Audit-Log:"
    echo "---"
    cat "$(ls -t logs/audit/PR-${PR_NUMBER}-*.txt | head -1)"
    echo "---"
fi
echo ""

# Schritt 4: Git-Tag prüfen
echo "🔖 Schritt 4: Git-Tag verifizieren"
echo "----------------------------------"
if git tag | grep -q "audit-pr-${PR_NUMBER}-validated"; then
    echo "✅ Audit-Tag gefunden:"
    git tag -l "audit-pr-${PR_NUMBER}-*" -n1
else
    echo "⚠️  Kein Audit-Tag gefunden"
fi
echo ""

# Schritt 5: Merge-Vorbereitung
echo "🚀 Schritt 5: Merge-Vorbereitung"
echo "--------------------------------"
if [ "$VALIDATION_STATUS" == "passed" ]; then
    echo "✅ Alle Quality Gates bestanden"
    echo ""
    echo "Merge-Befehle (manuell ausführen):"
    echo "-----------------------------------"
    echo "# Option 1: GitHub CLI (empfohlen)"
    echo "gh pr merge ${PR_NUMBER} --squash --delete-branch"
    echo ""
    echo "# Option 2: Git (manuell)"
    echo "git checkout main"
    echo "git merge --squash copilot/validate-secrets-and-conflicts"
    echo "git commit -m 'Merge PR #${PR_NUMBER}: PR validation infrastructure'"
    echo "git push origin main"
    echo "git branch -D copilot/validate-secrets-and-conflicts"
    echo ""
    echo "Merge-Log wird erstellt in: logs/merge/PR-${PR_NUMBER}.txt"
else
    echo "❌ Validierung fehlgeschlagen - Merge blockiert"
    echo ""
    echo "Rollback-Prozedur:"
    echo "------------------"
    echo "Siehe: .github/prompts/rollback-masterprompt.md"
    echo ""
    echo "Oder ausführen:"
    echo "./scripts/emergency-rollback.sh --pr=${PR_NUMBER} --reason='Validation failed'"
fi
echo ""

# Schritt 6: Zusammenfassung
echo "📊 Schritt 6: Zusammenfassung"
echo "----------------------------"
echo "Status: $([ "$VALIDATION_STATUS" == "passed" ] && echo '✅ BEREIT FÜR MERGE' || echo '❌ MERGE BLOCKIERT')"
echo ""
echo "Dateien erstellt:"
find logs/ -type f -name "*.txt" -o -name "*.log" | grep "PR-${PR_NUMBER}" | while read file; do
    echo "  - $file"
done
echo ""

echo "Git-Tags:"
git tag -l "audit-pr-${PR_NUMBER}-*" | while read tag; do
    echo "  - $tag"
done
echo ""

echo "=========================================="
echo "✅ Workflow abgeschlossen"
echo ""

# Zeige nächste Schritte
if [ "$VALIDATION_STATUS" == "passed" ]; then
    echo "🎯 Nächste Schritte:"
    echo "  1. Review: Prüfe Audit-Logs"
    echo "  2. Approve: PR manuell genehmigen (falls erforderlich)"
    echo "  3. Merge: gh pr merge $PR_NUMBER --squash --delete-branch"
    echo "  4. Verify: Deployment überwachen"
    echo "  5. Document: Merge-Log in logs/merge/ prüfen"
else
    echo "⚠️  Nächste Schritte:"
    echo "  1. Fix: Behebe Validierungs-Fehler"
    echo "  2. Revalidate: Führe validate-pr.ps1 erneut aus"
    echo "  3. Rollback: Falls nötig, siehe rollback-masterprompt.md"
fi
echo ""

exit 0
