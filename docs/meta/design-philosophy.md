# Awesome IWB v2 设计思路文档

版本：v2.0
更新日期：2026-07-14
状态：设计阶段

---

## 1. 项目背景

Awesome IWB（Interactive Whiteboard）是一个精选的交互白板相关软件、工具与资源合集。v1 版本采用单文件 README.md 组织内容，随着收录项目数量增长，维护成本急剧上升：

- 内容堆叠在一个文件中，难以快速定位
- 缺乏结构化的元数据管理
- 分类和标签硬编码在 Markdown 中，修改需要手动同步多处
- 新增项目时容易遗漏字段或破坏格式

v2 的核心目标是解决这些问题，建立一个**数据驱动、可扩展、易维护**的项目文档体系。

---

## 2. 设计原则

### 2.1 数据与展示分离

所有项目信息集中存储在 `data/projects.json`，Markdown 文件由构建脚本自动生成。这样做的优势：

- **单一数据源（Single Source of Truth）**：修改项目信息只需改 JSON，重新构建即可
- **格式校验**：可在构建时验证必填字段、项目数量等
- **可移植性**：JSON 格式易于被其他工具读取、迁移或转换为其他格式

### 2.2 标签与分类动态生成

分类列表和标签均从数据中读取，构建脚本动态生成标签云和分类导航。这意味着：

- 添加/删除分类只需修改 JSON 中的 `categories` 数组
- 添加/删除标签只需修改项目数据中的 `tags` 数组
- 无需手动编辑 Markdown 中的分类表或标签列表

### 2.3 多层级导航

文档采用三级导航结构：

1. **README.md** — 项目总览，快速入口
2. **docs/index.md** — 文档首页，完整分类导航 + 全局标签云
3. **docs/categories/*.md** — 分类页，按类别浏览项目
4. **docs/projects/*.md** — 项目详情页，完整元数据

每层页面均包含面包屑导航，方便读者跳转。

### 2.4 可扩展性

- 用户可通过 Fork 后修改 `projects.json` 自定义分类
- 构建脚本不依赖特定分类 ID，新增分类会自动生成对应页面
- 项目数据格式统一，便于批量导入/导出

---

## 3. 数据架构

### 3.1 JSON 结构设计

```
projects.json
├── meta           — 项目元信息（版本、描述、维护者、协议）
├── categories[]   — 分类定义（id、中文名、英文名、图标、主题色）
└── projects[]     — 项目列表
    ├── id           — 唯一标识（slug 格式）
    ├── name         — 项目名称
    ├── description  — 简要描述
    ├── category[]   — 所属分类（支持多分类）
    ├── author       — 作者
    ├── organization — 所属组织（可选）
    ├── contributors[] — 贡献者列表（可选）
    ├── tags[]       — 标签
    ├── repo         — GitHub 仓库地址（可选）
    ├── homepage     — 官网地址（可选）
    └── license      — 开源协议（可选）
```

### 3.2 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 数据格式 | JSON | 通用、可读、易解析 |
| 多分类 | category 为数组 | 一个项目可能属于多个领域 |
| 字段可选性 | 大多数字段可选 | 降低贡献门槛，不同类型项目信息完整度不同 |
| ID 命名 | kebab-case | URL 友好，Markdown 链接可直接使用 |

---

## 4. 构建流程

```
data/projects.json
       │
       ▼
  scripts/build.js
       │
       ├──→ docs/categories/*.md   (分类页)
       ├──→ docs/projects/*.md     (项目详情页)
       ├──→ docs/index.md         (文档首页)
       └──→ README.md              (项目总览)
```

构建脚本执行以下步骤：
1. 加载并校验 JSON 数据（项目数 ≥ 36，必填字段检查）
2. 按分类聚合项目，生成分类页
3. 为每个项目生成独立详情页
4. 生成带导航的文档首页和 README

---

## 5. 分类方案

当前 v2 采用 6 个分类，基于交互白板生态的主要使用场景划分：

| 分类 | 覆盖范围 | 典型项目 |
|------|----------|----------|
| 屏幕批注与白板软件 | 核心白板工具 | OpenBoard, Excalidraw, tldraw |
| 课表与看板类软件 | 教学管理 | Wekan, Focalboard, Taskcafe |
| 辅助类软件与实用工具 | 截图、录屏、图像编辑 | OBS Studio, GIMP, Inkscape |
| AI 辅助工具 | AI 推理、语音识别、图像生成 | Ollama, Whisper.cpp, SD WebUI |
| 开发框架与 SDK | 白板开发技术栈 | Fabric.js, Konva.js, Yjs |
| 设计与素材资源 | 图标、插画、图片 | Tabler Icons, Unsplash, Open Peeps |

用户可自由增删分类，只需：
1. 在 `categories` 数组中添加/删除条目
2. 更新项目的 `category` 字段
3. 运行 `node scripts/build.js` 重新生成

---

## 6. 技术选型

| 模块 | 方案 | 理由 |
|------|------|------|
| 数据存储 | JSON 文件 | 无需数据库，GitHub 原生支持 |
| 构建工具 | Node.js 原生脚本 | 零依赖，跨平台 |
| 文档输出 | Markdown | GitHub 原生渲染，无需额外部署 |
| 展示页面 | HTML + CSS | 板块导航展示页，本地可打开 |

选择纯 Node.js 脚本（零依赖）的原因：
- 降低贡献者的环境搭建成本
- 构建逻辑简单，无需引入构建工具链
- JSON 解析和文件写入是 Node.js 内置能力

---

## 7. 板块导航展示页

为了提供更好的视觉导航体验，项目额外包含一个 `index.html` 板块导航展示页：

- **布局**：2x2 + 额外行的卡片网格（对应 6 个分类）
- **设计风格**：渐变背景 + 3D 插画，参考现代 SaaS 产品首页
- **交互**：点击卡片跳转到对应的 Markdown 分类页
- **技术**：纯 HTML + CSS，无 JS 依赖

---

## 8. 未来演进方向

- **CI 自动构建**：通过 GitHub Actions 在每次 push 时自动运行 build.js
- **更多输出格式**：支持从同一 JSON 生成 HTML 站点、JSON-LD 等
- **搜索功能**：为 JSON 数据添加全文搜索索引
- **贡献者统计**：从 GitHub API 自动拉取贡献者信息
- **国际化**：支持多语言描述字段

---

## 附录

- 数据规范详见：`data/projects.json`
- 构建脚本详见：`scripts/build.js`
- 分类页输出：`docs/categories/*.md`
- 项目详情输出：`docs/projects/*.md`
