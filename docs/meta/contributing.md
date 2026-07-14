# 贡献指南

感谢你对 Awesome IWB 项目的关注！本文档说明如何参与贡献。

---

## 添加新项目

1. **Fork 仓库**，创建独立分支
2. 编辑 `data/projects.json`，在 `projects` 数组中添加新条目：

```json
{
  "id": "your-project-id",
  "name": "项目名称",
  "description": "简要描述（一句话）",
  "category": ["分类ID"],
  "author": "作者名",
  "organization": "组织名（可选）",
  "contributors": ["贡献者1", "贡献者2"],
  "tags": ["标签1", "标签2"],
  "repo": "https://github.com/...",
  "homepage": "https://...",
  "license": "MIT"
}
```

3. 运行构建脚本：

```bash
node scripts/build.js
```

4. 确认生成的 Markdown 文件内容正确
5. 提交 PR

---

## 添加新分类

1. 在 `data/projects.json` 的 `categories` 数组中添加：

```json
{
  "id": "new-category-id",
  "name": "分类中文名",
  "nameEn": "English Category Name",
  "icon": "📁",
  "color": "#HEX"
}
```

2. 更新相关项目的 `category` 字段，添加新分类 ID
3. 运行 `node scripts/build.js` 重新生成

---

## 数据规范

| 字段 | 必填 | 说明 |
|------|------|------|
| `id` | 是 | kebab-case 格式，唯一标识 |
| `name` | 是 | 项目显示名称 |
| `description` | 是 | 一句话描述 |
| `category` | 是 | 至少一个分类 ID |
| `author` | 是 | 作者名称 |
| `organization` | 否 | 所属组织 |
| `contributors` | 否 | 贡献者列表 |
| `tags` | 否 | 标签数组 |
| `repo` | 否 | GitHub 仓库地址 |
| `homepage` | 否 | 官网地址 |
| `license` | 否 | 开源协议 |

---

## 注意事项

- **不要手动编辑** `docs/` 目录下的 `.md` 文件，它们由构建脚本自动生成
- **不要硬编码**标签或分类名到模板中
- 确保 `id` 全局唯一，不与已有项目冲突
- `category` 中的 ID 必须在 `categories` 数组中已定义
- 项目总数须保持 ≥ 36

---

## 协作方式

- 每位贡献者 Fork 仓库后在独立分支开发
- 完成后提交 Pull Request
- 合并方式由项目维护者决定
- 可借助 AI 编程工具辅助开发，但需保证代码可读性
