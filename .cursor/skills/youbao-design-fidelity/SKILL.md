---
name: youbao-design-fidelity
description: >-
    按 375px 宽设计稿/截图高保真还原 web-mini 页面（uni-appx uvue）。
    含 scoped SCSS 父子嵌套与 & 修饰符写法。
    用于设计稿还原、UI 对稿、截图复刻、蓝湖/即时设计/Figma、写 pages 样式。
    与 youbao-uniapp-frontend、youbao-multiplatform 配合使用。
---

# 设计稿高保真还原（375px）

与 **[youbao-uniapp-frontend](../youbao-uniapp-frontend/SKILL.md)**、**[youbao-multiplatform](../youbao-multiplatform/SKILL.md)** 一起使用。改 UI 时**必须说明影响端**（MP / App / H5）及未测端。

## 设计稿基准

| 项       | 约定                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 画布宽度 | **375px**（iPhone 逻辑宽）                                                                       |
| 代码单位 | 样式 **优先 `rpx`**                                                                              |
| 换算     | **`rpx = 设计稿 px × 2`**（因 750rpx = 屏宽）                                                    |
| 例外     | 稿面明确 **1px 细线** → `border-width: 1rpx`；稿以 **750px 宽** 导出时数值已是 2×，**禁止再 ×2** |

```
设计 16px 间距  →  32rpx
设计 14px 字号  →  28rpx
设计 8px 圆角   →  16rpx
```

项目色板/字号阶梯见 **[tokens.md](tokens.md)**（有则必须用，无则按稿面 hex/px）。

## 工作流程

### 1. 开工前

1. 读 **youbao-uniapp-frontend**、**youbao-multiplatform**。
2. 确认稿宽：**375px** 或 **750px**（二选一，写入对稿说明）。
3. 找同模块已有页面（Tab、登录、列表）作**结构与样式**参考；样式结构优先看已嵌套写的页（如 `pages/creator/leaderboard.uvue`），勿照搬历史扁平平铺页。

### 2. 标注表（先表后码）

从设计工具或截图列出主区块，**再写模板/样式**：

| 元素/区块      | 设计 px | 代码 rpx | 色值    | 字号/字重        | 备注 |
| -------------- | ------- | -------- | ------- | ---------------- | ---- |
| 例：页左右边距 | 15      | 30       | —       | —                |      |
| 例：标题       | —       | 32       | #333333 | 16px→32rpx / 500 |      |

- **有标注** → 严格按标注。
- **无标注** → 不得臆造；沿用同页/同模块已有数值，或向用户确认。
- **仅截图** → 可按 375 宽比例估算，须在回复标明「估算，待设计确认」。

### 3. 还原优先级

1. 布局：flex 方向、对齐、固定顶/底、z-index
2. 尺寸：宽高、padding、margin、gap（全部按换算表 → rpx）
3. 字体：字号、行高、字重、颜色（注意 MP 上 `cl-text` 块级，见 frontend skill）
4. 视觉：圆角、描边、阴影、背景/渐变、图标尺寸
5. 交互态：默认/按下/禁用（**稿上有才做**）
6. **样式结构**：按下文「SCSS 写法」嵌套书写（与视觉同等必做）

### 4. 实现约定

- 页面根：`<cl-page :pt="{ className: 'page-fade' }">`（与同模块一致）
- 头部：使用自定义组件 `custom-navbar`
- 组件：优先 `cl-*`、`custom-navbar`、已有区块；外观用 `pt` / `className` / scoped 样式按稿调，不为省事改布局
- 样式：`<style lang="scss" scoped>`，大文件用 `// --- 区块名 ---` 分段；**写法见「SCSS 写法（硬约束）」**
- 生命周期：页面内直接用 `onShow` / `onLoad`，**禁止** `import { onShow } from "vue"`
- 小程序胶囊/安全区：在 375 主体之外按 **youbao-multiplatform** 增量，不把安全区算进稿面主体宽
- **模板 / 脚本**：务必极致简洁，见「代码简洁（硬约束）」；**语义简洁 ≠ 样式扁平平铺**

## 代码简洁（硬约束）

**编写代码务必极致简洁，剔除冗余代码，精简行数，优先最简实现。**

| 范围 | 要求 |
| ---- | ---- |
| 模板 | 能合并的区块不拆多个 `view`；重复列表用 `v-for` + 数据驱动；避免无意义的包裹层 |
| 脚本 | 复用已有 `router` / `request` / store / 组件；不写一次性 wrapper；状态能 `computed` 不单开重复 `ref` |
| 样式 | 在遵守「SCSS 嵌套」前提下删重复声明；同类卡片共用父级样式，修饰符只写差异 |
| 禁止 | 为「看起来更短」而牺牲可读性、破坏嵌套结构、或违反稿面尺寸/色值 |

与 SCSS 嵌套**不冲突**：嵌套是为了结构清晰；简洁是为了少写无效代码，**不是**把嵌套改成顶层平铺。

## SCSS 写法（硬约束）

凡在本 skill 范围内新增/改动 **scoped 样式**，必须遵守：

| 规则 | 说明 |
| ---- | ---- |
| 父子嵌套 | 模板中的父子 DOM，在 SCSS 中**嵌套书写**（如 `.card` 内写 `.card-title`） |
| 修饰符 / 伪类 | 用 `&--on`、`&--hover`、`&:last-child` 等，**禁止**再写一层顶层 `.card--on` |
| 嵌套深度 | 控制在 **≤ 3 层**；过深则拆 `// --- 区块 ---` |
| `&` 使用 | 仅用于修饰符、伪类、伪元素；子元素类名**直接嵌套**，少写 `.card { .card { } }` 式重复前缀 |
| 组件内部 | 改 `cl-*` 内部用 `:deep(...)`，可保留在对应父块内或文件末尾集中写 |
| 禁止 | 同一 UI 块拆成大量**顶层平铺**兄弟选择器（见下方 ❌） |

### 常见违反嵌套的原因（Agent 必读）

| 原因 | 说明 | 正确做法 |
| ---- | ---- | -------- |
| 赶 UI 平铺 BEM | 按类名前缀批量写顶层 `.xxx-yyy { }` | 按**模板 DOM 父子**嵌套，一块一个 `// --- 区块 ---` |
| `cl-text` + `pt.className` | 字重/行高类挂在组件上，模板里看不出层级 | 仍嵌套在**外层 view 块**下（如 `.bf-sec-card { .bf-sec-title {} }`） |
| 第二/第三 `style` 块 | popup / 底栏 / cl-page 根布局另起块后全平铺 | 非 scoped 块也要以**根容器**嵌套（如 `.bf-suc-pop { .bf-suc-head {} }`） |
| 与「代码简洁」混淆 | 误以为少缩进 = 简洁 | 简洁指模板/脚本；**样式必须嵌套**，禁止为少行数平铺 |
| 无 lint | 项目无 stylelint 强制 nesting | 交付前运行 `npm run check:scss-nesting`；或 grep 顶层 `^\.[a-z]+-` |

**自检命令**：同文件 scoped 里若出现 10+ 个同前缀（如 `.bf-`）顶层选择器且未包在 `.bf-body` / `.bf-section` 等父块下，即违反本 skill。

### ✅ 正确（嵌套 + `&`）

```scss
// --- 选项卡 ---
.guide-opt {
	display: flex;
	padding: 32rpx 28rpx;
	border: 2rpx solid #eeeeee;
	margin-bottom: 24rpx;

	&:last-child {
		margin-bottom: 0;
	}

	&--on {
		background-color: #fff8f3;
		border-color: #e67e45;
	}

	&--hover {
		opacity: 0.96;
	}

	.guide-opt-main {
		flex: 1;
	}
}
```

### ❌ 错误（扁平平铺）

```scss
.guide-opt { padding: 32rpx; }
.guide-opt:last-child { margin-bottom: 0; }
.guide-opt--on { border-color: #e67e45; }
.guide-opt-main { flex: 1; }
```

## 硬约束（违反 = 未高保真）

- 间距/字号/圆角/宽高：按 **`×2` → rpx**，禁止 `30rpx` 代替稿面 `16px`（应为 `32rpx`）。
- 颜色：稿面 **#RRGGBB / rgba** 原样使用；禁止「差不多」的近似色。
- **scoped 样式**：必须按「SCSS 写法」嵌套；禁止仅为少缩进而全文件顶层平铺。
- **模板 / 脚本**：极致简洁、剔除冗余、优先最简实现（见「代码简洁」）；禁止堆叠与稿无关的抽象层。
- 禁止为凑视觉整体改 padding、随意 `scale`、用未标注的 Tailwind 间距类（`p-4`、`gap-2`）代替 rpx 标注。
- 禁止用设计系统色名覆盖稿面色值（除非 **tokens.md** 已写明与稿一致映射）。
- 接口层仍遵守 `request` 成功只 resolve `data`（见 `.cursor/rules/uniapp-request.mdc`）。

## 禁止项

- 「大概」「类似」「差不多」替代数值
- 未在稿出现的装饰性样式（额外阴影、渐变）
- 用运行时平台 `if` 替代整段 UI 结构（条件编译见 multiplatform skill）
- 依赖子组件 `emit` 传递登录成功等关键流程（见 frontend skill）
- **同一 BEM 块**的基类、修饰符、子元素全部写成互不嵌套的顶层选择器

## 截图 / 蓝湖 / Figma

| 来源                    | 做法                                                           |
| ----------------------- | -------------------------------------------------------------- |
| 蓝湖 / 即时设计 / Figma | 以标注 px 为准；导出倍图不影响 **标注数字**                    |
| 纯截图                  | 上→下、外→内分区测量；关键区块（顶栏、卡片、主按钮）必列标注表 |
| 750 宽稿                | 标注数字通常已是 rpx 等价，**不 ×2**；开工前在回复中写明       |

## 输出前自检

```markdown
- [ ] 已建标注表，主区块尺寸/间距与稿误差 ≤ 2rpx（1px）
- [ ] 主色、字色与稿 hex 一致（或符合 tokens.md）
- [ ] scoped 样式：父子嵌套 + `&--` / `&:伪类`，无整块扁平平铺
- [ ] 模板/脚本已精简：无冗余包裹、重复逻辑、多余状态
- [ ] 顶栏/长页滚动与同模块 `#ifdef APP` 结构一致
- [ ] MP 同行混排未用多个横排 cl-text
- [ ] 回复中写明：影响 MP / App / H5；哪些端未测
```

## 示例（标注 → 嵌套 SCSS）

稿：卡片左右边距 15px、内边距 12px、标题 16px #333、圆角 12px；选中描边主色。

```scss
// --- 卡片 ---
.path-card {
	margin-left: 30rpx;
	margin-right: 30rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background-color: #ffffff;
	border: 2rpx solid #eeeeee;

	&--on {
		border-color: #e67e45;
	}

	.path-card-title {
		font-size: 32rpx;
		color: #333333;
	}
}
```

## 附加资源

- 项目色板与字号阶梯模板：[tokens.md](tokens.md)
- 嵌套结构参考：`pages/creator/leaderboard.uvue`（`.filter-section` 等）
