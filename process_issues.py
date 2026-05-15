import json
import re
from datetime import datetime, timezone, timedelta

# Load project info
with open('project_info.json') as f:
    project_data = json.load(f)

project_v2 = project_data['data']['organization']['projectV2']
project_id = project_v2['id']

workflow_status_field = next(f for f in project_v2['fields']['nodes'] if f['name'] == 'Workflow Status')
status_options = {opt['name']: opt['id'] for opt in workflow_status_field['options']}

FIELD_ID = workflow_status_field['id']
BACKLOG_ID = status_options['📋 Backlog']
IN_PROGRESS_ID = status_options['🔄 In Progress']
REVIEW_ID = status_options['👀 Review']

# Load open issues
with open('open_issues.json') as f:
    issues_data = json.load(f)

issues = issues_data['data']['repository']['issues']['nodes']

results = {
    "open_issues": len(issues),
    "added_to_project": 0,
    "status_updates": 0,
    "outdated_candidate_marks": 0,
    "outdated_list": [],
    "errors": []
}

outdated_regex = re.compile(r'(wordpress|wp-|legacy root|obsolete path|deprecated)', re.IGNORECASE)
now = datetime.now(timezone.utc)
one_year_ago = now - timedelta(days=365)

commands = []

for issue in issues:
    # 1. Check if in Project 2
    in_project_2 = any(p['project']['number'] == 2 for p in issue['projectItems']['nodes'])
    
    # Generate item_id for later if already in project, else we'll need to add it
    item_id = None
    if in_project_2:
        item_id = next(p['id'] for p in issue['projectItems']['nodes'] if p['project']['number'] == 2)
    else:
        # Command to add to project
        commands.append(f'gh project item-add 2 --owner Menschlichkeit-Osterreich --url https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/issues/{issue["number"]} > item_{issue["number"]}.json')
        results["added_to_project"] += 1
    
    # 2. Determine Workflow Status
    status_to_set = BACKLOG_ID # Default
    
    labels = [l['name'] for l in issue['labels']['nodes']]
    milestone_title = issue['milestone']['title'] if issue['milestone'] else ""
    
    if 'status/missing' in labels:
        status_to_set = BACKLOG_ID
    elif any(s in milestone_title for s in ["Foundation & Platform (US1)", "Donation Pipeline (US2)", "Governance & DSGVO (US3)"]):
        status_to_set = IN_PROGRESS_ID
    elif any(s in milestone_title for s in ["Resilience & Monitoring (US4+US5)"]):
        status_to_set = REVIEW_ID
    elif any(s in milestone_title for s in ["Technical Debt & n8n-Gate", "Handover & Polish (US6)"]):
        status_to_set = BACKLOG_ID
    
    # If we know the item_id (already in project) or if we are adding it (shell logic will handle it), 
    # we need to set the field. 
    # To keep the script simple, I will output the logic for shell to execute.
    
    # 3. Outdated candidate logic
    created_at = datetime.fromisoformat(issue['createdAt'].replace('Z', '+00:00'))
    is_outdated = False
    if outdated_regex.search(issue['title']):
        is_outdated = True
    elif created_at < one_year_ago and not issue['milestone']:
        is_outdated = True
        
    if is_outdated:
        if 'triage/outdated-candidate' not in labels:
            commands.append(f'gh issue edit {issue["number"]} --add-label "triage/outdated-candidate"')
            results["outdated_candidate_marks"] += 1
        if len(results["outdated_list"]) < 20:
            results["outdated_list"].append(f'#{issue["number"]} {issue["title"]}')

    # Output status update command (we will use a helper to get item_id if it was just added)
    # For now, let's prepare the command assuming it's in the project.
    if item_id:
        commands.append(f'gh project item-edit --id {item_id} --field-id {FIELD_ID} --project-id {project_id} --single-select-option-id {status_to_set}')
        results["status_updates"] += 1

# Note: The status_updates count for new items will be handled in the bash script when we get the new item_id.

with open('commands.sh', 'w') as f:
    for cmd in commands:
        f.write(cmd + " \n")

print(json.dumps(results))
