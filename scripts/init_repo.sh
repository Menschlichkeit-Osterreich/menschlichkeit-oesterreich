#!/usr/bin/env bash
set -euo pipefail

# ====== GitHub-Remote anpassen ======
GITHUB_REMOTE="git@github.com:DEIN-USER/menschlichkeit-oesterreich-monorepo.git"

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_DIR="${BASE_DIR}/menschlichkeit-oesterreich-monorepo"

mkdir -p "$REPO_DIR"

# .gitignore (defensiv) – wird nur geschrieben, wenn nicht vorhanden
if [[ ! -f "${REPO_DIR}/.gitignore" ]]; then
  cat > "${REPO_DIR}/.gitignore" <<'IGN'
# WordPress
httpdocs/wp-content/uploads/
httpdocs/wp-content/cache/
httpdocs/wp-content/upgrade/

# Node/PHP Vendors
**/node_modules/
**/vendor/

# OS/Misc
.DS_Store
Thumbs.db
*.log
*.zip
IGN
fi

# Erst Sync fahren
bash "$(dirname "$0")/sync_all.sh"

# Git initialisieren
cd "$REPO_DIR"
if [[ ! -d .git ]]; then
  git init
  git checkout -b main
  git remote add origin "$GITHUB_REMOTE"
fi

# Sicherheit: nicht committen, wenn nichts da
if git status --porcelain | grep -q .; then
  git add .
  git commit -m "Initial import from Plesk (main, api, crm)"
else
  echo "ℹ︎ Keine Änderungen zum Committen."
fi

# Push
git push -u origin main
echo "✓ Push nach GitHub fertig: $GITHUB_REMOTE"
