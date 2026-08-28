---
name: youbao-multiplatform
description:  web-mini 微信小程序、App、H5 多端差异与条件编译规范。在新增页面、滚动布局、导航栏、登录、存储、样式、API 能力时使用；与 youbao-uniapp-frontend 配合。
---

# 多端开发（MP / App / H5）

与 [youbao-uniapp-frontend](../youbao-uniapp-frontend/SKILL.md) 一起使用。改 UI 或能力时**必须说明影响端**。

## 条件编译标识（本项目常用）

| 宏 | 端 |
|----|-----|
| `MP` / `MP-WEIXIN` | 微信小程序 |
| `APP` | App（含 Android/iOS，细分为 `APP-ANDROID` 时见 .cool / cool-ui） |
| `H5` | 浏览器 |
| `ifndef MP` | 非小程序（App + H5 等） |

**模板**：`<!-- #ifdef APP -->` … `<!-- #endif -->`  
**脚本/样式**：`// #ifdef MP-WEIXIN`、`/* #ifdef MP-WEIXIN */`

同一能力三端写法不一致时，**不要**用运行时 `if` 代替应用层条件编译（减少包体与运行时分支）。

## 页面滚动（长列表页）

本项目惯例（见 `pages/tabbar/home.uvue`、`user.uvue`）：

```html
<!-- #ifdef APP -->
<scroll-view class="page-scroll" scroll-y="true" show-scrollbar="false" @scroll="onPageScroll">
<!-- #endif -->
<view class="page-body">...</view>
<!-- #ifdef APP -->
</scroll-view>
<!-- #endif -->
```

- **App**：外层 `scroll-view`，监听 `@scroll` 做吸顶/阴影
- **小程序 / H5**：通常页面级滚动，不包 `scroll-view`（除非确有嵌套滚动需求）

新增长页先对照同模块已有页面的 `#ifdef APP` 结构，三端保持一致。

## 导航栏与安全区

| 端 | 要点 |
|----|------|
| **MP-WEIXIN** | `uni.getMenuButtonBoundingClientRect()` + `getWindowInfo()` 算右侧留白；自定义顶栏需 `onMounted` 里 `#ifdef MP-WEIXIN` |
| **App / H5** | 常用 `custom-navbar` 或 `cl-topbar`；底部 `cl-safe-area type="bottom"` |

顶栏高度用 `createSelectorQuery` 测 `#xxx-sticky-header`，`setTimeout` 后再量（与 home 一致）。

## 登录与授权

| 端 | 入口 |
|----|------|
| 手机号 | `pages/login/components/login/phone.uvue`（全端） |
| 微信 | `pages/login/components/login/wx.uvue`，`#ifdef MP-WEIXIN` 相关逻辑 |

登录成功：**子组件内** `applyLoginResponse` + `hydrateLocalProfile`，再 `reLaunch` 首页；勿依赖子组件 `emit` 到父页（小程序不可靠）。

## 存储

- 统一 `uni.setStorageSync` / `getStorageSync`
- 对象：`JSON.stringify` 写入，`parseObject` 读出（见 `.cool/store/user.ts`）
- 登录键：`token`、`userInfo`、`loginPayload`

## UI 组件（Cool UI）多端差异

| 问题 | 处理 |
|------|------|
| `cl-text` 在 MP 为块级 | 同行链接用原生 `<text>` 嵌套 |
| 验证码 base64 图 | `<image :src="...">`，不用 `cl-svg` |
| 改 `cl-button` 内部色 | 用 `view` + `cl-text` 或 `pt.className`，勿指望 `:deep()` |
| `cl-progress-circle` 等 | cool-ui 内已有 `#ifdef MP`，勿重复造轮子 |

## 配置与请求

- `config/prod.ts`：`#ifdef H5` 与 `#ifndef H5` 的 baseUrl 等
- 请求头已带 `platform_id`、`terminal`；H5 注意跨域与 cookie（按现网配置）

## 样式

- 主单位 **rpx**；`parseClass` + `isDark` 适配暗色
- 小程序专用样式块：`/* #ifdef MP-WEIXIN */` 写在 scoped 末尾
- 避免仅 H5 有效的 CSS（如部分 `position: sticky` 组合）未加条件编译

## 新增/修改页面检查清单

```
多端检查：
- [ ] 是否需 #ifdef APP 的 scroll-view 包裹
- [ ] MP 顶栏是否算胶囊留白
- [ ] cl-text 混排是否改为原生 text（MP）
- [ ] 是否标注：MP / App / H5 影响说明
- [ ] pages.json 已注册路径
- [ ] 真机或模拟器至少测 MP + 一端（App 或 H5）
```

## 对话模板（给 Agent）

> 实现 XXX，兼容 **MP-WEIXIN、APP、H5**。列出条件编译块位置与未覆盖端的风险。
