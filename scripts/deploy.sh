#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  echo "Usage: npm run deploy -- \"Commit message\""
  echo "Example: npm run deploy -- \"Improve mobile layout\""
  exit 0
fi

message="${1:-Update site}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: please run this script inside the project git repository."
  exit 1
fi

branch="$(git branch --show-current)"
if [ "$branch" != "main" ]; then
  echo "Error: current branch is '$branch'. Please switch to main before deploying."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Error: git remote 'origin' is not configured."
  exit 1
fi

echo "Checking local changes..."

if [ -n "$(git status --porcelain)" ]; then
  git add .
  git commit -m "$message"
else
  echo "No local file changes to commit."
fi

echo "Pushing to GitHub..."
git push origin main

echo "Done. GitHub Pages will update after GitHub finishes publishing."
