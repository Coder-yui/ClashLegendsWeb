# ClashLegends 网站

个人游戏宣传站与双语图鉴。静态 HTML / CSS / JavaScript，Node 构建脚本；不需要 npm 依赖、数据库或游戏引擎来构建和浏览。

## 本地打开

```sh
npm run build
npm run check
npm run dev
```

在本机打开 http://127.0.0.1:4173/zh/ 或 http://127.0.0.1:4173/en/ 。服务只绑定回环地址，不能用这个地址在手机上访问。退出服务器后，再运行 `npm run dev` 即可恢复。

## 内容与结构

- `content/catalog.json`：经审阅的共享数字、双语文字、关系与素材路径；86 个注册定义，73 张可选卡牌，13 个关联实体；5 个内嵌形态。
- `content/copy.tsv`、`abilities.tsv`、`fields.tsv`：双语编辑源及字段单位。技能名含本项目译名。
- `content/sources.json`：逐实体与素材来源、核对状态、公开素材待核查标记。
- `src/site.mjs`：首页、图鉴、统一详情、总览、机制、更新、关于模板。
- `src/app.js`：名称/别名搜索、费用和类型筛选、同实体语言切换、菜单。
- `public/media`：仅使用的 WebP 卡面与技能图标，约 2.4 MiB。
- `dist`：标准静态构建输出；184 个双语页面，另含根语言入口与 404 页面。
- `tools/check.mjs`：ID、关系、翻译、数值类型、图片、内部路由/锚点、私人路径与未翻译正文检查。

页面采用 `/zh/` 与 `/en/` 的实体目录，每个目录有真实 `index.html`，直链与刷新不依赖 SPA 回退。浏览器前进后退恢复列表查询。语言 URL 优先，根路径才参考本地偏好或浏览器语言。

## 游戏来源

本机三个板块在同一 `Projects/` 下：游戏为 `ClashLegends/`，宣传素材为 `ClashLegends-promo-materials/`，网站为本目录。内容准备脚本默认读取同级游戏工程；网站日常构建使用自己的快照与 `public/media/`，不从宣传目录动态加载素材，因此宣传目录整理不改变站内路由。

采用 `b33fac18c20bd477918ead43ce9e903ce97e21d2`，核对日期 2026-10-25；本次从干净的本地游戏源码导出。源游戏只读，未复制整个资产库。选卡数量来自 `CardDB.selectable_ids()` 的语义及编译后 `selectable` 字段，而非文档条目数量。

网站的日常构建不需要原游戏。要主动更新快照，先确认干净的游戏源码，再运行：

```sh
python3 tools/import_snapshot.py "/path/to/ClashLegends" --godot "/path/to/Godot"
npm run build
npm run check
```

更新导入需要 Python + Pillow 和 Godot。只复制定义与最小依赖到 `.work/export`，在该隔离目录执行编译。`ArenaRules` 中继承自 CardDB 的常量引用改为直接读取相同 CardSchema 常量，仅为隔离导出解决依赖；不修改原游戏。新增卡牌或技能缺翻译时导入会失败，必须补齐双语内容后重试。更新日期、计数断言和版本说明也需随新快照审阅。

详见 [来源核查](docs/CONTENT_AUDIT.md)、[验证记录](docs/VALIDATION.md)、[Sites 交接](docs/DEPLOYMENT.md)。
