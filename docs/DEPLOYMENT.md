# Sites 发布交接

当前仅本地开发，**未注册 Site、未上传、未部署、未公开**。

## 已准备

- `npm run build` 输出标准静态 `dist/`；无运行时 Node 服务或数据库。
- `.openai/hosting.json` 已声明 `static.directory = "dist"`。未设置 project_id，因为尚未创建 Sites 项目，不可自行填造。
- 每个中文/英文页面均有物理目录入口。托管应支持目录 `index.html` 和 `404.html`，不需要重写到单个 SPA 页面。
- 当前 canonical 与 hreflang 使用站内路径。拿到真实部署域名后，将其变为该域的绝对 URL；不要使用示例域名作为生产 canonical。
- 只发布 `dist/` 对应的静态产物；源码归档包含网站源码与托管配置，不包含 `.work`、原游戏项目或开发素材库。

## 用户确认发布范围后

1. 重新阅读当前 Sites 技能；检查是否已有真实 project_id，已有则复用。
2. 用户选择私有或公开受众。新站默认私有；私有部署 URL 也是真实远程部署，不是本地预览。
3. 核查计划公开的媒体与适用政策。素材来源记录在 `content/sources.json`。
4. 获得实际 Site ID，写入 `.openai/hosting.json`，补齐真实域名 SEO 元数据；再次构建和检查。
5. 按 Sites 当前 source helper 流程准备精确网站源码提交、同步源码并生成匹配归档，再保存版本，最后部署该版本。
6. 检查部署终态及权限；验证 `/zh/`、`/en/`、`/zh/cards/anivia/`、`/en/cards/mirror/` 的直接访问、刷新与语言切换。
7. 返回工具确认的真实部署 URL。失败时保留源码、产物与实际错误，不编造成功链接。

本轮没有执行以上远程操作。正式发布前不以本机回环地址作为跨设备访问地址。

## Sites 托管（2026-10-20）

本轮已获用户授权同步 GitHub 并部署 Sites。站点身份保存在 `.openai/hosting.json`，沿用静态 `dist` 输出。Sites 新站保持默认私有访问。后续使用同一 project_id 更新，不重复创建站点。GitHub 项目仓库为 https://github.com/Coder-yui/ClashLegendsWeb 。部署凭据只通过受保护 stdin 传入 helper，不写入仓库。
