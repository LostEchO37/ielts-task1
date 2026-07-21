#!/usr/bin/env bash
# Netlify「是否构建」判断 — 节省 production deploy credits（每次约 15 credits）
#
# 规则：只有 commit message 含 [release] 或 [deploy] 时才构建
# 普通 git push（备份代码）→ 跳过 Netlify 构建
#
# Netlify ignore 约定：exit 0 = 跳过构建，exit 1 = 执行构建

MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")

if echo "$MSG" | grep -qiE '\[(release|deploy)\]'; then
  echo "Netlify: commit marked for release — building."
  exit 1
fi

echo "Netlify: no [release]/[deploy] tag — skipping build (saves ~15 credits)."
exit 0
