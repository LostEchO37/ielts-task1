#!/bin/bash
# 正式发布 → GitHub → Netlify 构建（消耗 ~15 credits / 次）
#
# 日常开发：本地预览即可，改完先不要 push，或 push 时不加 [release]（Netlify 会跳过构建）
# 确认无误后再运行：./deploy.sh "Release v2.1: 描述"
#
# 也可在 Netlify 控制台 Lock auto publishing，仅手动 Trigger deploy

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

# 避免重复 [release] 标签
if echo "$MSG" | grep -qiE '\[(release|deploy)\]'; then
  FULL_MSG="$MSG"
else
  FULL_MSG="$MSG [release]"
fi

git add -A
if git diff --cached --quiet; then
  echo "✓ Nothing new to publish."
  exit 0
fi

git commit -m "$FULL_MSG"
git push origin main

echo ""
echo "✓ Pushed with [release] — Netlify 将构建并上线（约 15 credits）。"
echo "  若 credits 已用完，Deploy 会被 Skip，需等下月恢复或升级套餐。"
echo "  仅备份代码、不上线：git push 时不要加 [release]（Netlify 自动跳过）。"
echo ""
