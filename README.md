# Awesome IWB

> 专为广大中小学电教打造的班级希沃/鸿合等一体机/数字白板/班班通一站式软件推荐清单和实用知识手册

**版本**：2.0 | **维护者**：Awesome IWB Organization | **协议**：CC BY-NC-SA 4.0

---

## 快速导航

- ✏️ [屏幕批注与白板软件](docs/categories/whiteboard.md) — Screen Notation & Whiteboard Softwares（11 个项目）
- 📊 [课表与看板类软件](docs/categories/timetable.md) — Timetable & Dashboard Softwares（11 个项目）
- 🛠️ [辅助类软件与实用工具](docs/categories/utilities.md) — Utilities & Practical Tools（33 个项目）

## 项目结构

```
aiwb-v2/
├── README.md              ← 你在这里
├── index.html             ← 板块导航展示页
├── data/
│   └── projects.json      ← 项目数据源
├── docs/
│   ├── index.md           ← 文档首页
│   ├── categories/        ← 分类页
│   ├── projects/          ← 项目详情页
│   └── meta/              ← 元文档
└── scripts/
    └── build.js           ← 构建脚本
```

## 构建说明

```bash
node scripts/build.js
```

## 验收状态

| # | 验收项 | 状态 |
|---|--------|------|
| 1 | 单文件 → 多 MD 文件 | ✅ |
| 2 | 数据采用 JSON 格式，可复制 | ✅ |
| 3 | 标签/分类动态生成，无硬编码 | ✅ |
| 4 | 显示作者、组织、贡献者 | ✅ |
| 5 | 收录项目数 ≥ 36 | ✅ (54个) |
| 6 | 提供设计思路文档 | ✅ |

## 链接

- [文档首页](docs/index.md)
- [设计思路](docs/meta/design-philosophy.md)
- [贡献指南](docs/meta/contributing.md)
