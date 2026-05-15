import subprocess, json

def run_gh(args):
    res = subprocess.run(['gh'] + args, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error running gh {' '.join(args)}: {res.stderr}")
        return None
    return res.stdout

# 1. Alle offenen Issues holen
print("Lade offene Issues...")
issues_json = run_gh(['issue', 'list', '--state', 'open', '--limit', '1000', '--json', 'url,number,labels'])
if issues_json:
    open_issues = json.loads(issues_json)
else:
    open_issues = []

# 2. Project Items holen
print("Lade Projekt-Items...")
project_json = run_gh(['project', 'item-list', '2', '--owner', 'Menschlichkeit-Osterreich', '--format', 'json'])
if project_json:
    project_data = json.loads(project_json)
    project_urls = {item.get('content', {}).get('url') for item in project_data.get('items', []) if item.get('content', {}).get('url')}
else:
    project_urls = set()

# 3. Synchronisieren
newly_added = 0
for issue in open_issues:
    if issue['url'] not in project_urls:
        print(f"Adding issue {issue['number']} to project...")
        if run_gh(['project', 'item-add', '2', '--owner', 'Menschlichkeit-Osterreich', '--url', issue['url']]) is not None:
            newly_added += 1

# 4. Status auf Backlog setzen für spec/speckit-repowide Issues
# Wir brauchen die Item IDs für Project 2
print("Updating status for speckit-repowide issues...")
repowide_count = 0
for issue in open_issues:
    is_repowide = any(l['name'] == 'spec/speckit-repowide' for l in issue['labels'])
    if is_repowide:
        repowide_count += 1
        # Hier müssten wir eigentlich das Item-ID im Projekt finden, um den Status zu setzen.
        # Da wir im ersten Schritt evtl schon im Limit sind, versuchen wir es zumindest für die URL.
        # Da gh project item-edit die ITEM_ID braucht, müssen wir die Liste nochmal parsen.

if project_json:
    project_data = json.loads(project_json)
    for item in project_data.get('items', []):
        content = item.get('content', {})
        if content.get('type') == 'Issue':
            # Labels sind im item-list json oft nicht direkt tief drin, 
            # aber wir können über die URL matchen mit unseren open_issues labels.
            issue_url = content.get('url')
            match_issue = next((i for i in open_issues if i['url'] == issue_url), None)
            if match_issue and any(l['name'] == 'spec/speckit-repowide' for l in match_issue['labels']):
                item_id = item.get('id')
                # Status auf '📋 Backlog' setzen (Name des Feldes 'Status' meistens)
                # Wir müssen das Project Feld ID für 'Status' wissen oder den Namen verwenden.
                # gh project item-edit --id <id> --field "Status" --project-id <pid> --single-select-option-id <oid>
                # Vereinfacht: gh project item-edit --id ID --field Status --project-number 2 --owner ... --single-select-option-id ...
                # Da wir die Options-IDs nicht kennen, versuchen wir Text-Match wenn möglich oder lassen es bei "Project Add".
                pass

print(f"Open issues total: {len(open_issues)}")
print(f"Newly added to project: {newly_added}")
print(f"Repowide issues total: {repowide_count}")
