#!/bin/bash
# Publish local changes → GitHub → Netlify auto-deploys
# One-time setup: see instructions in chat / connect GitHub to Netlify first.

set -e
cd "$(dirname "$0")"

MSG="${1:-Update site content}"

if ! git remote get-url origin &>/dev/null; then
  echo "❌ No GitHub remote yet."
  echo "   Create a repo at https://github.com/new then run:"
  echo "   git remote add origin https://github.com/YOUR_USERNAME/ielts-task1.git"
  echo "   git push -u origin main"
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "✓ Nothing new to publish."
  exit 0
fi

git commit -m "$MSG"
git push origin main
echo "✓ Pushed. Netlify will update in ~30 seconds."
