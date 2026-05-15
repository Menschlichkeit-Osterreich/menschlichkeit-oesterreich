#!/bin/bash
REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
milestones=(
"🏗️ Foundation & Platform (US1) | Setup, Foundational Prerequisites und Produktionsplattform stabil betreiben"
"💰 Donation Pipeline (US2) | End-to-End-Spendenfluss absichern mit Gates und Evidence"
"🔒 Governance & DSGVO (US3) | Datenschutz und Governance verankern, Compliance-Gates"
"🛡️ Resilience & Monitoring (US4+US5) | Backups, Restore, Monitoring und Alerts fuer kritische Signale"
"🤝 Handover & Polish (US6) | Teamfaehige Betriebsuebergabe und Abschlussarbeiten"
"🔧 Technical Debt & n8n-Gate | Legacy-Backlog-Items und n8n-Workflow-Validierungsgate"
)

existing=$(gh api repos/$REPO/milestones --jq '.[].title')

for title in "${milestones[@]}"; do
    if echo "$existing" | grep -qxF "$title"; then
        echo "Milestone already exists: $title"
    else
        echo "Creating milestone: $title"
        gh api repos/$REPO/milestones -f title="$title" -f state="open" > /dev/null
    fi
done

gh api repos/$REPO/milestones --jq '.[] | "|\(.number) | \(.title)|"'
