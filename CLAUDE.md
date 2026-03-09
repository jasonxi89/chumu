# 初慕 (chumu) 项目规则

## Post-hook: 每次改完代码后
1. **bump 版本号** — `src/utils/version.ts` 的 `APP_VERSION` 和 `package.json` 的 `version`（功能 +minor，修复 +patch）
2. **构建** — `npx taro build --type weapp`
3. **commit & push** — `git add -A && git commit -m "..." && git push`

这样用户刷新开发者工具就能通过 console 的版本号确认是最新代码。
