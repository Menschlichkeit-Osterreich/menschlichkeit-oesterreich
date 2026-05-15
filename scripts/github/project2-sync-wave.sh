#!/usr/bin/env bash
set -euo pipefail

REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
OWNER="Menschlichkeit-Osterreich"
PROJECT_NUMBER="2"

echo "[1/8] Fetch open issues (REST)"
gh api "/repos/${REPO}/issues?state=open&per_page=100" --paginate > /tmp/moe_open_issues.json

python3 - <<'PY'
import json
with open('/tmp/moe_open_issues.json','r',encoding='utf-8') as f:
    data=json.load(f)
# REST issues endpoint can include PRs; filter them out
issues=[i for i in data if 'pull_request' not in i]
with open('/tmp/moe_open_issues_only.json','w',encoding='utf-8') as f:
    json.dump(issues,f)
print(f"open_issues={len(issues)}")
PY

echo "[2/8] Fetch project items"
gh project item-list "${PROJECT_NUMBER}" --owner "${OWNER}" --format json --limit 5000 > /tmp/moe_project_items.json

python3 - <<'PY'
import json
with open('/tmp/moe_open_issues_only.json','r',encoding='utf-8') as f:
    issues=json.load(f)
with open('/tmp/moe_project_items.json','r',encoding='utf-8') as f:
    items=json.load(f).get('items',[])
issue_urls={i['html_url'] for i in issues}
project_urls={it.get('content',{}).get('url') for it in items if isinstance(it,dict)}
missing=sorted([u for u in issue_urls if u not in project_urls])
with open('/tmp/moe_missing_urls.txt','w',encoding='utf-8') as f:
    for u in missing:
        f.write(u+'\n')
print(f"project_before={len(project_urls)}")
print(f"missing_before={len(missing)}")
PY

echo "[3/8] Add missing issues to project"
if [[ -s /tmp/moe_missing_urls.txt ]]; then
  while IFS= read -r url; do
    gh project item-add "${PROJECT_NUMBER}" --owner "${OWNER}" --url "$url" >/dev/null
  done < /tmp/moe_missing_urls.txt
fi

echo "[4/8] Ensure Plan Wave field exists"
FIELDS_JSON="$(gh project field-list "${PROJECT_NUMBER}" --owner "${OWNER}" --format json)"
export FIELDS_JSON
PLAN_WAVE_ID="$(python3 - <<'PY'
import json,os
fields=json.loads(os.environ['FIELDS_JSON']).get('fields',[])
for f in fields:
    if f.get('name')=='Plan Wave':
        print(f.get('id',''))
        break
PY
)"

if [[ -z "${PLAN_WAVE_ID}" ]]; then
  gh project field-create "${PROJECT_NUMBER}" --owner "${OWNER}" --name "Plan Wave" --data-type SINGLE_SELECT --single-select-options "Wave A (P0 Critical),Wave B (P0/P1 Core),Wave C (P1 Experience),Wave D (P1/P2 Hardening),Wave E (P2 Optimization)" >/dev/null
  FIELDS_JSON="$(gh project field-list "${PROJECT_NUMBER}" --owner "${OWNER}" --format json)"
  export FIELDS_JSON
fi

python3 - <<'PY'
import json,subprocess,sys

with open('/tmp/moe_open_issues_only.json','r',encoding='utf-8') as f:
    issues=json.load(f)
project=json.loads(subprocess.check_output(['gh','project','view','2','--owner','Menschlichkeit-Osterreich','--format','json'],text=True))
project_id=project['id']
fields=json.loads(subprocess.check_output(['gh','project','field-list','2','--owner','Menschlichkeit-Osterreich','--format','json'],text=True)).get('fields',[])
items=json.loads(subprocess.check_output(['gh','project','item-list','2','--owner','Menschlichkeit-Osterreich','--format','json','--limit','5000'],text=True)).get('items',[])

wave_field=next(f for f in fields if f.get('name')=='Plan Wave')
wave_field_id=wave_field['id']
options={o['name']:o['id'] for o in wave_field.get('options',[])}

url_to_item={it.get('content',{}).get('url'):it.get('id') for it in items if isinstance(it,dict) and it.get('content',{}).get('url')}

def pick_wave(labels):
    s=set(labels)
    if 'P0' in s or 'phase/us2-donation' in s or 'phase/us3-governance' in s:
        return 'Wave A (P0 Critical)'
    if 'spec/n8n-gate' in s or 'backlog/legacy' in s or 'area/integrations' in s or 'area/interface' in s:
        return 'Wave B (P0/P1 Core)'
    if any(l.startswith('area/screens-') for l in s) or 'area/figma' in s or 'area/templates' in s or any(l.startswith('area/design-') for l in s) or 'area/flows' in s:
        return 'Wave C (P1 Experience)'
    if 'phase/us4-resilience' in s or 'phase/us6-handover' in s or 'masterplan' in s:
        return 'Wave D (P1/P2 Hardening)'
    return 'Wave E (P2 Optimization)'

counts={k:0 for k in options.keys()}
for issue in issues:
    url=issue.get('html_url')
    item_id=url_to_item.get(url)
    if not item_id:
        continue
    labels=[l.get('name') for l in issue.get('labels',[]) if isinstance(l,dict) and l.get('name')]
    wave=pick_wave(labels)
    opt=options.get(wave)
    if not opt:
        continue
    subprocess.check_call(['gh','project','item-edit','--id',item_id,'--project-id',project_id,'--field-id',wave_field_id,'--single-select-option-id',opt],stdout=subprocess.DEVNULL)
    counts[wave]+=1

print('wave_counts=')
for k,v in counts.items():
    print(f"  {k}: {v}")
PY

echo "[5/8] Final completeness proof"
gh project item-list "${PROJECT_NUMBER}" --owner "${OWNER}" --format json --limit 5000 > /tmp/moe_project_items_after.json
python3 - <<'PY'
import json
with open('/tmp/moe_open_issues_only.json','r',encoding='utf-8') as f:
    issues=json.load(f)
with open('/tmp/moe_project_items_after.json','r',encoding='utf-8') as f:
    items=json.load(f).get('items',[])
issue_urls={i['html_url'] for i in issues}
project_urls={it.get('content',{}).get('url') for it in items if isinstance(it,dict)}
missing=[u for u in issue_urls if u not in project_urls]
print(f"open_total={len(issue_urls)}")
print(f"project_after={len(project_urls)}")
print(f"missing_after={len(missing)}")
if missing:
    print('missing_urls:')
    for u in sorted(missing):
        print(u)
PY

echo "[6/8] Cleanup"
rm -f /tmp/moe_open_issues.json /tmp/moe_open_issues_only.json /tmp/moe_project_items.json /tmp/moe_missing_urls.txt /tmp/moe_project_items_after.json

echo "Done."
