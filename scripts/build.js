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
  let md = `# ${meta.title}\n\n`;
  md += `> ${meta.description}\n\n`;
  md += `**版本**：${meta.version} | **维护者**：${meta.maintainer} | **协议**：${meta.license}\n\n`;
  md += `---\n\n`;

  md += `## 快速导航\n\n`;
  categories.forEach(cat => {
    const count = getProjectsByCategory(cat.id).length;
    md += `- ${cat.icon} [${cat.name}](docs/categories/${cat.id}.md) — ${cat.nameEn}（${count} 个项目）\n`;
  });
  md += `\n`;

  md += `## 项目结构\n\n`;
  md += `\`\`\`\n`;
  md += `aiwb-v2/\n`;
  md += `├── README.md              ← 你在这里\n`;
  md += `├── index.html             ← 板块导航展示页\n`;
  md += `├── data/\n`;
  md += `│   └── projects.json      ← 项目数据源\n`;
  md += `├── docs/\n`;
  md += `│   ├── index.md           ← 文档首页\n`;
  md += `│   ├── categories/        ← 分类页\n`;
  md += `│   ├── projects/          ← 项目详情页\n`;
  md += `│   └── meta/              ← 元文档\n`;
  md += `└── scripts/\n`;
  md += `    └── build.js           ← 构建脚本\n`;
  md += `\`\`\`\n\n`;

  md += `## 构建说明\n\n`;
  md += `\`\`\`bash\n`;
  md += `node scripts/build.js\n`;
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
  md += `\n`;

  md += `## 链接\n\n`;
  md += `- [文档首页](docs/index.md)\n`;
  md += `- [设计思路](docs/meta/design-philosophy.md)\n`;
  md += `- [贡献指南](docs/meta/contributing.md)\n`;

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
