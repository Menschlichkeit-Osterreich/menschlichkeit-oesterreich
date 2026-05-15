repo_full="Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
milestone="🔧 Technical Debt & n8n-Gate | Legacy-Backlog-Items und n8n-Workflow-Validierungsgate"
assignee="humanobmann"
labels="spec/speckit-repowide,spec/secrets-governance,area/secrets,status/planned"

titles=(
"[Speckit Repo Secrets] S401 Workflow-Secret-Referenzen gegen Manifest/BWS abgleichen"
"[Speckit Repo Secrets] S402 Kritische fehlende Secrets in BWS je Umgebung verifizieren/anlegen"
"[Speckit Repo Secrets] S403 Repo/Env-Secrets aus BWS auf Workflow-Bedarf synchronisieren"
"[Speckit Repo Secrets] S404 Deprecated Secret-Aliase konsolidieren"
"[Speckit Repo Secrets] S405 Secret-Validierungspipeline an Manifest-Schema anpassen"
"[Speckit Repo Secrets] S406 Security-Alerts in Secret-Remediation-Issues ueberfuehren"
)

for title in "${titles[@]}"; do
  body="Quelle: specs/004-repo-secrets-governance/tasks.md. \nAkzeptanzkriterien: ${title:23} abgeschlossen."
  
  # Search using REST
  query="repo:$repo_full type:issue in:title \"$title\""
  existing=$(gh api "search/issues" -f q="$query" --jq '.total_count')
  
  if [[ "$existing" -eq 0 ]]; then
    echo "Creating: $title"
    # gh issue create uses GraphQL for some things, but let's try. 
    # If it fails, we might need a REST equivalent for issue creation.
    issue_url=$(gh issue create --repo "$repo_full" --title "$title" --body "$body" --assignee "$assignee" --milestone "$milestone" --label "$labels")
    if [[ $? -eq 0 ]]; then
       echo "Created: $issue_url"
       # Project operations are EXCLUSIVELY GraphQL. This will fail.
       gh project item-add 2 --owner Menschlichkeit-Osterreich --url "$issue_url"
    else
       echo "Failed to create issue $title"
    fi
  else
    echo "Skipped (exists): $title"
    issue_url=$(gh api "search/issues" -f q="$query" --jq '.items[0].html_url')
    # Try adding anyway, though it will likely fail
    gh project item-add 2 --owner Menschlichkeit-Osterreich --url "$issue_url"
  fi
done
