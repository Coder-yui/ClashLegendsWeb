# 内容来源与边界

- 源提交：`f190774c85ef7f8207247d59a25c2496f41a5ec2`。
- 2026-10-20 通过本地 `git rev-parse HEAD` 和远程 `git ls-remote ... refs/heads/main` 核实一致；源工作区干净。
- 已读入口：`README.md`、`docs/README.md`、`docs/units/README.md`。
- 选择依据：`scripts/data/card_db.gd` 注册 79 个定义，`selectable_ids()` 对编译结果采用 `selectable` 默认 true；`scripts/ui/deck_builder.gd` 使用此入口。结果为 66 个可选、13 个不可选。4 个内嵌形态不重复计数。
- 配置依据：完整编译全部注册卡牌定义，使用原 `card_definition_compiler.gd` 与原 `card_schema.gd`。网站不解析 GDScript 数值表达式、不启动整场游戏、不执行重压力测试。
- 部署默认等待：`scripts/unit.gd` 的 `stats.get("deploy_time", 1.0)`；编队不虚构单实体生命值。
- 比赛规则：`docs/units/arena.md` 与 `scripts/battle/match_rules.gd`。胜负、加时、平局依照当前实现。
- 主动席/镜像：`docs/units/mirror.md` 与 `scripts/battle/match_runtime.gd`。镜像配置的简介“复制体不携带主动”仅覆盖普通席；主动席继承预选技能，以当前实现和单位手册修正网站文案。
- 冰冻强化：`docs/units/freeze.md`。扩大的半径只属于减速区域，不扩大冻结区域；减速区持续时间由基础冻结 duration + 技能 slow_duration 得到，当前为 5 秒。
- 卡萨丁明确保留地面身份、独立过河与穿兵规则；天使、凯隐、纳尔形态区别独立介绍。
- 数值为共享 JSON；技能与基础效果中文/英文共用同一数值表。描述为编辑式概括，精确数值在表中给出；不将攻击间隔误写成攻速。

逐实体文件和逐素材记录见 `content/sources.json`。媒体仅取源游戏实际使用的卡面与技能图标，转换为浏览器可用 WebP。保留本地宣传视频目录，但没有未经选择直接复制或转码视频；本版使用真实卡面与明确标注的战场结构示意。

未核实游戏下载发行包和线上联机服务，未提供下载按钮。公开前须确认受众，并核查图片权利与适用政策；非官方说明不代表获得授权。没有上传原始模型、音频包、私人记录或开发素材库。
