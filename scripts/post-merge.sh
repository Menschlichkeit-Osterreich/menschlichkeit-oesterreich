#!/bin/bash
set -e

if [ -f "apps/website/package.json" ]; then
  cd apps/website
  npm install --no-fund --no-audit < /dev/null
  cd ../..
fi
