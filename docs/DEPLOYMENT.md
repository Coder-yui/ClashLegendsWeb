# Sites 发布交接

现有站点：https://clash-legends-web.loyal-cake-5939.chatgpt.site

- Site 身份由 `.openai/hosting.json` 保存，更新时复用，不创建新站。
- 2026-10-25 通过 Sites get_site 确认当前为公开访问；更新保持原受众。
- 无运行时服务和数据库，`npm run build` 生成静态 `dist/`。
- 使用 Sites source helper 同步精确源码提交并打包，再保存版本与部署；凭据仅通过受保护 stdin 传入。
- GitHub 仓库：https://github.com/Coder-yui/ClashLegendsWeb 。
- 仅打包网站产物，不包含 `.work`、原游戏或开发素材库。
