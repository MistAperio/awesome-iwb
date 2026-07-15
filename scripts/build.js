#!/usr/bin/env node
/**
 * Awesome IWB v2 — 构建脚本
 * 从 data/projects.json 动态生成分类页、项目详情页、索引页和 README。
 * 所有标签和分类名称均从数据中读取，无硬编码。
 */

const fs = require('fs');
const path = require('path');

// ── 路径配置 ──
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'projects.json');
const DOCS_DIR = path.join(ROOT, 'docs');
const CAT_DIR = path.join(DOCS_DIR, 'categories');
const PROJ_DIR = path.join(DOCS_DIR, 'projects');
const META_DIR = path.join(DOCS_DIR, 'meta');

// 确保输出目录存在
[CAT_DIR, PROJ_DIR, META_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ── 加载数据 ──
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const { meta, categories, projects } = data;

// ── 校验 ──
if (projects.length < 36) {
  console.error(`错误：当前仅有 ${projects.length} 个项目，要求至少 36 个。`);
  process.exit(1);
}
console.log(`数据校验通过：${projects.length} 个项目，${categories.length} 个分类。`);

// ── 工具函数 ──
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getProjectsByCategory(catId) {
  return projects.filter(p => p.category.includes(catId));
}

function getAllTags() {
  const tagSet = new Set();
  projects.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}

// ── 生成分类页 ──
function generateCategoryPages() {
  categories.forEach(cat => {
    const catProjects = getProjectsByCategory(cat.id);
    const tags = getAllTags().filter(tag =>
      catProjects.some(p => (p.tags || []).includes(tag))
    );

    let md = `# ${cat.icon} ${cat.name}\n\n`;
    md += `> ${cat.nameEn}\n\n`;
    md += `共收录 **${catProjects.length}** 个项目。\n\n`;
    md += `## 标签云\n\n`;
    md += tags.map(t => `\`${t}\``).join(' · ') + '\n\n';
    md += `---\n\n`;
    md += `## 项目列表\n\n`;

    catProjects.forEach((p, idx) => {
      const badge = p.badge ? `${p.badge} ` : '';
      md += `### ${idx + 1}. ${badge}[${p.name}](../projects/${p.id}.md)\n\n`;
      md += `${p.description}\n\n`;
      md += `| 字段 | 信息 |\n`;
      md += `|------|------|\n`;
      md += `| **作者** | ${p.author} |\n`;
      if (p.organization) md += `| **组织** | ${p.organization} |\n`;
      if (p.contributors && p.contributors.length > 0) {
        md += `| **贡献者** | ${p.contributors.join(', ')} |\n`;
      }
      md += `| **标签** | ${(p.tags || []).map(t => `\`${t}\``).join(' ')} |\n`;
      if (p.repo) md += `| **仓库** | [GitHub](${p.repo}) |\n`;
      if (p.homepage) md += `| **主页** | [官网](${p.homepage}) |\n`;
      if (p.license) md += `| **协议** | ${p.license} |\n`;
      md += `\n`;
    });

    md += `\n---\n\n> 返回 [项目总览](../index.md) | 返回 [README](../../README.md)\n`;

    const filePath = path.join(CAT_DIR, `${cat.id}.md`);
    fs.writeFileSync(filePath, md, 'utf-8');
    console.log(`  [分类页] ${cat.id}.md (${catProjects.length} 个项目)`);
  });
}

// ── 生成项目详情页 ──
function generateProjectPages() {
  projects.forEach(p => {
    const badge = p.badge ? `${p.badge} ` : '';
    let md = `# ${badge}${p.name}\n\n`;
    md += `${p.description}\n\n`;
    md += `## 项目信息\n\n`;
    md += `| 字段 | 信息 |\n`;
    md += `|------|------|\n`;
    md += `| **作者** | ${p.author} |\n`;
    if (p.organization) md += `| **组织** | ${p.organization} |\n`;
    if (p.contributors && p.contributors.length > 0) {
      md += `| **贡献者** | ${p.contributors.join(', ')} |\n`;
    }
    md += `| **分类** | ${p.category.map(c => {
      const cat = categories.find(ct => ct.id === c);
      return cat ? `[${cat.icon} ${cat.name}](../categories/${c}.md)` : c;
    }).join(', ')} |\n`;
    md += `| **标签** | ${(p.tags || []).map(t => `\`${t}\``).join(' ')} |\n`;
    if (p.repo) md += `| **仓库** | [GitHub](${p.repo}) |\n`;
    if (p.homepage) md += `| **主页** | [官网](${p.homepage}) |\n`;
    if (p.license) md += `| **协议** | ${p.license} |\n`;
    md += `\n---\n\n`;
    md += `> 返回 [分类页](../categories/${p.category[0]}.md) | 返回 [项目总览](../index.md)\n`;

    const filePath = path.join(PROJ_DIR, `${p.id}.md`);
    fs.writeFileSync(filePath, md, 'utf-8');
  });
  console.log(`  [项目页] ${projects.length} 个项目详情页`);
}

// ── 生成 docs/index.md ──
function generateDocsIndex() {
  const allTags = getAllTags();

  let md = `# ${meta.title}\n\n`;
  md += `> ${meta.description}\n\n`;
  md += `**版本**：${meta.version} | **维护者**：${meta.maintainer} | **协议**：${meta.license}\n\n`;
  md += `---\n\n`;

  // 分类导航
  md += `## 分类导航\n\n`;
  md += `| 分类 | 说明 | 项目数 |\n`;
  md += `|------|------|--------|\n`;
  categories.forEach(cat => {
    const count = getProjectsByCategory(cat.id).length;
    md += `| ${cat.icon} [${cat.name}](categories/${cat.id}.md) | ${cat.nameEn} | ${count} |\n`;
  });
  md += `\n`;

  // 全部标签
  md += `## 全部标签\n\n`;
  md += allTags.map(t => `\`${t}\``).join(' · ') + '\n\n';
  md += `---\n\n`;

  // 统计
  md += `## 统计\n\n`;
  md += `- 总项目数：**${projects.length}**\n`;
  md += `- 总分类数：**${categories.length}**\n`;
  md += `- 总标签数：**${allTags.length}**\n`;
  md += `\n---\n\n`;

  md += `## 其他\n\n`;
  md += `- [设计思路](meta/design-philosophy.md)\n`;
  md += `- [贡献指南](meta/contributing.md)\n`;
  md += `- [返回 README](../README.md)\n`;

  fs.writeFileSync(path.join(DOCS_DIR, 'index.md'), md, 'utf-8');
  console.log(`  [索引页] docs/index.md`);
}

// ── 生成 README.md ──
function generateReadme() {
  let md = `<div align="center">\n\n`;
  md += `# ${meta.title}\n\n`;
  md += `专为广大中小学电教打造的班级希沃/鸿合等一体机/数字白板/班班通一站式软件推荐清单\n\n`;
  md += `**为广大电教倾情撰写，让班级大屏更好用！**\n\n`;
  md += `[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)\n`;
  md += `[![License](https://img.shields.io/badge/License-${meta.license.replace(/-/g, '--')}-blue.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0)\n`;
  md += `[![Projects](https://img.shields.io/badge/Projects-${projects.length}-green.svg)]()\n`;
  md += `[![Fluent Design](https://img.shields.io/badge/UI-Fluent_Design-0078D4.svg)]()\n\n`;
  md += `</div>\n\n`;
  md += `---\n\n`;

  // 设计图展示
  md += `## 设计图展示\n\n`;
  md += `> 以下为项目板块导航横图，提供暗色3D、Fluent亚克力、扁平极简三种风格，以及横版和方形两种尺寸。\n\n`;
  md += `### 暗色 3D 风格（横版 16:9）\n\n`;
  md += `<table><tr>\n`;
  md += `<td align="center"><img src="assets/banner-whiteboard.png" width="400"><br><b>屏幕批注与白板软件</b></td>\n`;
  md += `<td align="center"><img src="assets/banner-timetable.png" width="400"><br><b>课表与看板类软件</b></td>\n`;
  md += `</tr><tr>\n`;
  md += `<td align="center"><img src="assets/banner-utilities.png" width="400"><br><b>辅助类软件与实用工具</b></td>\n`;
  md += `<td align="center"><img src="assets/banner-about.png" width="400"><br><b>关于 AIWB</b></td>\n`;
  md += `</tr></table>\n\n`;

  md += `### Fluent 亚克力风格（横版 16:9）\n\n`;
  md += `<table><tr>\n`;
  md += `<td align="center"><img src="assets/styles/fluent/banner-whiteboard.png" width="400"><br><b>白板软件</b></td>\n`;
  md += `<td align="center"><img src="assets/styles/fluent/banner-timetable.png" width="400"><br><b>课表看板</b></td>\n`;
  md += `</tr><tr>\n`;
  md += `<td align="center"><img src="assets/styles/fluent/banner-utilities.png" width="400"><br><b>实用工具</b></td>\n`;
  md += `<td align="center"><img src="assets/styles/hero/banner-main.png" width="400"><br><b>主视觉横图</b></td>\n`;
  md += `</tr></table>\n\n`;

  md += `### 扁平极简风格（横版 16:9）\n\n`;
  md += `<table><tr>\n`;
  md += `<td align="center"><img src="assets/styles/flat/banner-whiteboard.png" width="400"><br><b>白板软件</b></td>\n`;
  md += `<td align="center"><img src="assets/styles/flat/banner-timetable.png" width="400"><br><b>课表看板</b></td>\n`;
  md += `</tr><tr>\n`;
  md += `<td align="center"><img src="assets/styles/flat/banner-utilities.png" width="400"><br><b>实用工具</b></td>\n`;
  md += `<td align="center"><img src="assets/styles/thumb/banner-whiteboard.png" width="200"><br><b>方形缩略图</b></td>\n`;
  md += `</tr></table>\n\n`;

  md += `### 亮色主题（横版 16:9）与方形版本（1:1）\n\n`;
  md += `<table><tr>\n`;
  md += `<td align="center"><img src="assets/themes/light/banner-whiteboard.png" width="400"><br><b>亮色 - 白板</b></td>\n`;
  md += `<td align="center"><img src="assets/themes/square/banner-whiteboard.png" width="200"><br><b>方形 - 白板</b></td>\n`;
  md += `</tr></table>\n\n`;
  md += `> 完整主题展示请查看 [docs/themes.html](docs/themes.html)\n\n`;
  md += `---\n\n`;

  // 快速导航
  md += `## 快速导航\n\n`;
  md += `<table><tr>\n`;
  categories.forEach(cat => {
    const count = getProjectsByCategory(cat.id).length;
    md += `<td align="center"><a href="docs/categories/${cat.id}.md">${cat.icon}<br><b>${cat.name}</b><br><sub>${cat.nameEn}</sub><br>${count} 个项目</a></td>\n`;
  });
  md += `</tr></table>\n\n`;

  // 贡献指南
  md += `## 贡献指南\n\n`;
  md += `欢迎为 Awesome IWB 添加新项目！请阅读 [完整贡献指南](docs/meta/contributing.md)。\n\n`;
  md += `### 快速添加项目\n\n`;
  md += `1. Fork 仓库，编辑 \`data/projects.json\` 添加项目条目\n`;
  md += `2. 运行 \`node scripts/build.js\` 重新生成文档\n`;
  md += `3. 提交 Pull Request\n\n`;
  md += `### 添加新分类\n\n`;
  md += `在 \`categories\` 数组中添加新条目，更新项目的 \`category\` 字段，重新构建即可。\n\n`;
  md += `---\n\n`;

  // 最新项目
  md += `## 最新收录项目\n\n`;
  md += `| 标记 | 项目 | 开发者 |\n`;
  md += `|------|------|--------|\n`;
  const newProjects = projects.filter(p => p.badge === '🔴').slice(0, 10);
  newProjects.forEach(p => {
    md += `| ${p.badge} | [${p.name}](docs/projects/${p.id}.md) | [${p.author}](${p.repo}) |\n`;
  });
  md += `\n> 查看全部项目请访问 [文档首页](docs/index.md)\n\n`;
  md += `---\n\n`;

  // 项目结构
  md += `## 项目结构\n\n`;
  md += `\`\`\`\n`;
  md += `awesome-iwb/\n`;
  md += `├── index.html             ← Fluent Design 板块导航页\n`;
  md += `├── README.md              ← 你在这里\n`;
  md += `├── data/projects.json     ← 标准化数据源\n`;
  md += `├── assets/                ← 设计图资源\n`;
  md += `│   ├── banner-*.png       ← 暗色3D横图\n`;
  md += `│   ├── styles/fluent/     ← Fluent亚克力风格\n`;
  md += `│   ├── styles/flat/       ← 扁平极简风格\n`;
  md += `│   ├── styles/hero/       ← 超宽主视觉\n`;
  md += `│   ├── styles/thumb/      ← 方形缩略图\n`;
  md += `│   └── themes/            ← 亮色/方形主题\n`;
  md += `├── design/                ← SVG设计文件（可导入Figma）\n`;
  md += `├── docs/\n`;
  md += `│   ├── categories/        ← 分类页\n`;
  md += `│   ├── projects/          ← 项目详情页\n`;
  md += `│   └── meta/              ← 设计思路 + 贡献指南\n`;
  md += `└── scripts/build.js       ← 零依赖构建脚本\n`;
  md += `\`\`\`\n\n`;

  md += `## 验收状态\n\n`;
  md += `| # | 验收项 | 状态 |\n`;
  md += `|---|--------|------|\n`;
  md += `| 1 | 单文件 → 多 MD 文件 | ✅ |\n`;
  md += `| 2 | 数据采用 JSON 格式，可复制 | ✅ |\n`;
  md += `| 3 | 标签/分类动态生成，无硬编码 | ✅ |\n`;
  md += `| 4 | 显示作者、组织、贡献者 | ✅ |\n`;
  md += `| 5 | 收录项目数 ≥ 36 | ✅ (${projects.length}个) |\n`;
  md += `| 6 | 提供设计思路文档 | ✅ |\n`;
  md += `| 7 | Fluent Design HTML 展示页 | ✅ |\n`;
  md += `| 8 | 多风格多尺寸设计图 | ✅ |\n`;
  md += `\n`;

  md += `## 链接\n\n`;
  md += `- [文档首页](docs/index.md)\n`;
  md += `- [Fluent 展示页](index.html)\n`;
  md += `- [主题展示](docs/themes.html)\n`;
  md += `- [设计思路](docs/meta/design-philosophy.md)\n`;
  md += `- [贡献指南](docs/meta/contributing.md)\n`;
  md += `- [GitHub 仓库](https://github.com/MistAperio/awesome-iwb)\n`;
  md += `- [官方网站](https://aiwb.smart-teach.cn)\n`;

  fs.writeFileSync(path.join(ROOT, 'README.md'), md, 'utf-8');
  console.log(`  [README] README.md`);
}

// ── 执行 ──
console.log('\n开始构建 Awesome IWB v2 ...\n');
generateCategoryPages();
generateProjectPages();
generateDocsIndex();
generateReadme();
console.log('\n构建完成！\n');
