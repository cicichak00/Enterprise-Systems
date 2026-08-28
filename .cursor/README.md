# Cursor 项目配置说明

## 提交到 Git 的内容

| 路径 | 说明 |
|------|------|
| `.cursor/skills/**` | **Agent Skills**（流程与示例） |
| `.cursor/rules/**` | **Rules**（每次对话自动生效的短约束） |
| `.cursor/README.md` | 本说明 |

### Skills（按需深入）

| 名称 | 用途 |
|------|------|
| `youbao-uniapp-frontend` | 请求、登录态、Cool UI、目录约定 |
| `youbao-multiplatform` | 微信 / App / H5 条件编译与布局差异 |
| `youbao-design-fidelity` | 375px 设计稿/截图高保真还原（px→rpx） |
| `youbao-api-integration` | Apifox/common.md 对接、`request` 封装与 endpoints 登记 |

### Rules（自动应用）

| 文件 | 用途 |
|------|------|
| `uniapp-lifecycle.mdc` | 禁止从 vue 导入 onShow 等 |
| `uniapp-request.mdc` | request 只用 data |
| `uniapp-platform-impact.mdc` | 改 UI 须考虑三端 |
| `design-fidelity.mdc` | 对稿时读 design-fidelity skill（`pages/**`） |
| `uniapp-scss-nesting.mdc` | scoped SCSS 按 DOM 嵌套（`pages/**`、`components/**`） |

### 样式自检

```bash
npm run check:scss-nesting
```

新页面勿写入 `.scss-nesting-allowlist.json`；legacy 平铺页面临时列入该文件。

## 不提交的内容（已在 `.gitignore` 排除）

| 路径 | 说明 |
|------|------|
| `.cursor/*`（除 `skills/`、`rules/`、`README.md` 外） | 个人本地配置、缓存等 |
| `~/.cursor/skills-cursor/` | Cursor 系统内置 Skill，**勿复制到本仓库** |
| `~/.cursor/skills/` | 个人级 Skill，仅本机生效，不进项目 git |

若在 `.cursor/` 下新增其他目录（如 `mcp.json`），默认**不会**被提交；团队共享请改 `.gitignore` 增加 `!` 例外。

## 新增项目 Skill

```text
.cursor/skills/<skill-name>/SKILL.md
```

要求：YAML 头含 `name`、`description`；`name` 仅小写字母、数字、连字符。

## 使用

- 对话中提及场景（uni-app、登录、请求、设计稿对稿等）时 Agent 可自动匹配
- 或显式说明：`按 youbao-uniapp-frontend skill 处理` / `按 youbao-design-fidelity 高保真还原`
