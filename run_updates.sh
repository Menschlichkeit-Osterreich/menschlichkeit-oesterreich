#!/bin/bash
PROJECT_ID="PVT_kwDODiODFs4BXxSE"
STATUS_FIELD_ID="PVTSSF_lADODiODFs4BXxSEzhS75TI"
BACKLOG_ID="8beac7a" # wait, the ID was 8dbeac7a. Fixed below.
# Fixed IDs from project_info.json:
# 📋 Backlog: 8dbeac7a
# 🔄 In Progress: 3dd6e66e
# 👀 Review: 6463af48

# Create label if it doesn't exist
gh label create "triage/outdated-candidate" --color A2A2A2 --description "Item is potentially outdated" || true

# Helper to get status ID
get_status_id() {
    local labels="$1"
    local milestone="$2"
    if [[ "$labels" == *"status/missing"* ]]; then echo "8dbeac7a";
    elif [[ "$milestone" == *"Foundation & Platform (US1)"* || "$milestone" == *"Donation Pipeline (US2)"* || "$milestone" == *"Governance & DSGVO (US3)"* ]]; then echo "3dd6e66e";
    elif [[ "$milestone" == *"Resilience & Monitoring (US4+US5)"* ]]; then echo "6463af48";
    elif [[ "$milestone" == *"Technical Debt & n8n-Gate"* || "$milestone" == *"Handover & Polish (US6)"* ]]; then echo "8dbeac7a";
    else echo "8dbeac7a"; fi
}

# Counters
added=0
updated=0
marked=0

# Process issues from open_issues.json
jq -c '.data.repository.issues.nodes[]' open_issues.json | while read -r issue; do
    number=$(echo "$issue" | jq -r '.number')
    id=$(echo "$issue" | jq -r '.id')
    title=$(echo "$issue" | jq -r '.title')
    created_at=$(echo "$issue" | jq -r '.createdAt')
    labels=$(echo "$issue" | jq -r '.labels.nodes[].name' | tr '\n' ',' )
    milestone=$(echo "$issue" | jq -r '.milestone.title // ""')
    
    # 1. Ensure in Project 2
    item_id=$(echo "$issue" | jq -r '.projectItems.nodes[] | select(.project.number == 2) | .id')
    if [[ -z "$item_id" ]]; then
        item_id=$(gh project item-add 2 --owner Menschlichkeit-Osterreich --url "https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/issues/$number" --format json | jq -r '.id')
        ((added++))
    fi
    
    # 2. Update Status
    status_id=$(get_status_id "$labels" "$milestone")
    gh project item-edit --id "$item_id" --field-id "$STATUS_FIELD_ID" --project-id "$PROJECT_ID" --single-select-option-id "$status_id" > /dev/null
    ((updated++))
    
    # 3. Mark outdated
    is_outdated=false
    if [[ "$title" =~ (wordpress|wp-|legacy\ root|obsolete\ path|deprecated) ]]; then
        is_outdated=true
    fi
    # Use python for date comparison
    if [[ "$is_outdated" == "false" && -z "$milestone" ]]; then
        if python3 -c "from datetime import datetime, timezone, timedelta; c = datetime.fromisoformat('$created_at'.replace('Z', '+00:00')); print('true' if c < datetime.now(timezone.utc) - timedelta(days=365) else 'false')" | grep -q "true"; then
            is_outdated=true
        fi
    fi
    
    if [[ "$is_outdated" == "true" ]]; then
        if [[ "$labels" != *"triage/outdated-candidate"* ]]; then
            gh issue edit "$number" --add-label "triage/outdated-candidate" > /dev/null
            ((marked++))
        fi
    fi
done

echo "Summary: Added: $added, Updated: $updated, Marked: $marked"
