import os
import glob
import json

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(root)
map_path = '.github/prompts/MIGRATION_MAP.json'
with open(map_path, 'r', encoding='utf-8') as f:
    mig = json.load(f)
mapping = mig.get('mappings', {})

prompt_dir = '.github/prompts'
files = glob.glob(prompt_dir + '/**/*.prompt.md', recursive=True) + glob.glob(prompt_dir + '/*.prompt.md')
updated = []
for fp in sorted(set(files)):
    rel = os.path.relpath(fp, '.github').replace('\\', '/')
    target = mapping.get(rel)
    with open(fp, 'r', encoding='utf-8') as f:
        text = f.read()

    if text.startswith('---'):
        parts = text.split('---')
        if len(parts) >= 3:
            fm_text = parts[1].strip() + '\n'
            body = '---'.join(parts[2:]).lstrip('\n')
        else:
            fm_text = ''
            body = text
    else:
        fm_text = ''
        body = text

    kv = {}
    for line in fm_text.splitlines():
        if ':' in line:
            key, val = line.split(':', 1)
            kv[key.strip()] = val.strip()

    if target:
        kv['status'] = 'DEPRECATED'
        kv['deprecatedDate'] = '2025-10-08'
        kv['lastUpdated'] = '2026-03-31'
    else:
        if kv.get('status', '').upper() != 'DEPRECATED':
            kv['status'] = kv.get('status', 'ACTIVE')
        kv['lastUpdated'] = '2026-03-31'

    kv.pop('mode', None)
    kv.pop('tools', None)

    kv.setdefault('title', os.path.basename(fp))
    kv.setdefault('description', '')
    kv.setdefault('version', '1.0.0')
    kv.setdefault('audience', "['Team']")
    kv.setdefault('language', 'de-AT')
    kv.setdefault('category', 'general')
    kv.setdefault('tags', "['expert']")

    order = ['title', 'description', 'lastUpdated', 'status', 'deprecatedDate', 'category', 'tags', 'version', 'language', 'audience']
    lines = ['---']
    for k in order:
        if k in kv:
            lines.append(f"{k}: {kv[k]}")
    for k, v in kv.items():
        if k not in order:
            lines.append(f"{k}: {v}")
    lines.append('---')

    body = body.lstrip('\n')
    banner = ''
    if target:
        banner = f"> **DEPRECATED** — Migriert nach `{target}`. Diese Datei wird als Referenz beibehalten.\n\n"
        if body.startswith('> **DEPRECATED**'):
            body_lines = body.splitlines()
            i = 1
            while i < len(body_lines) and body_lines[i].strip() == '':
                i += 1
            body = '\n'.join(body_lines[i:]).lstrip('\n')

    new_text = '\n'.join(lines) + '\n\n' + banner + body

    if new_text != text:
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(new_text)
        updated.append(fp)

print(f'Updated {len(updated)} files')
for u in updated:
    print(u)
