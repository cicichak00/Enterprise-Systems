---
name: youbao-uniapp-frontend
description:  web-mini 项目 uni-appx + Vue3 + uvue 前端开发规范。在编写或修改 pages/、components/、.cool/、登录态、请求封装、小程序兼容、Cool UI 组件时使用。多端条件编译见 youbao-multiplatform skill。
---

#  uni-app 前端（web-mini）

## 技术栈

- **框架**：uni-appx，页面/组件后缀 `.uvue`，`<script setup lang="uts">` 或 `lang="ts"`
- **UI**：`uni_modules/cool-ui`（`cl-*` 组件）
- **基础设施**：`@/.cool`（`request`、`router`、`useStore`、`user` / `userInfo`、`storage`）
- **配置**：`@/config`（`config.name`、`ignoreTokens`）
- **单位**：样式优先 `rpx`；Tailwind 类名通过 `parseClass` 等与 dark 模式配合

## 目录约定

| 路径 | 用途 |
|------|------|
| `pages/**` | 业务页面，按模块分子目录 |
| `pages/tabbar/components/home-*` | 首页区块组件 |
| `.cool/service/index.ts` | 全局 `request` |
| `.cool/store/user.ts` | 登录态、本地用户信息与 token |
| `components/` | 跨页公共组件（如 `custom-navbar`） |

新页面需在 `pages.json` 注册；Tab 页在 `pages/tabbar/`。

## 网络请求

```typescript
import { request, type Response } from "@/.cool";

request({ url: "/xxx", method: "POST", data: {} })
  .then((res) => { /* res 已是业务 data，不是 { code, msg, data } */ })
  .catch((err) => { /* err 含 msg / message */ });
```

- 业务 **`code === 1`** 时，`request` **只 resolve `data`**，不要写 `res.code == 1` 或 `res.data.xxx`
- 默认请求头：`platform_id: "1"`、`terminal: "1"`（已在 service 层统一）
- 登录相关路径若需免 token，加到 `config/index.ts` 的 `ignoreTokens`

## 登录与用户态

```typescript
import { user, userInfo } from "@/.cool";

// 登录成功
user.applyLoginResponse(res); // 写 token + userInfo + loginPayload

// 页面 onShow
user.hydrateLocalProfile();
if (user.token != null && user.isNull()) {
  user.get();
}
```

**本地存储（必须用 `uni.setStorageSync`）**

| Key | 说明 |
|-----|------|
| `token` | 访问令牌字符串 |
| `userInfo` | `JSON.stringify(UserInfo)` |
| `loginPayload` | 登录接口原始 JSON |

**注意**

- `setAccessToken` 会清除 `token_deadtime`；勿让旧 `_deadtime` 触发 `request` 里误判过期 → `logout()` 清空本地
- 无 `refreshToken` 时不要走刷新失败登出逻辑
- 页面绑定用 **`userInfo`**（`computed`）或 `user.info`，不要只读 `loginPayload`
- 手机号登录成功逻辑在 `pages/login/components/login/phone.uvue` 内完成；小程序子组件 **`emit` 父页可能收不到**，勿依赖 `@success` 传参

**字段映射（登录 data → UserInfo）**

- `nickname` → `nickName`
- `avatar` → `avatarUrl`
- `mobile` → `phone`
- `sn` → `id`

## 页面生命周期

- **`onShow` / `onLoad` / `onMounted`**：页面内直接使用全局 API，**不要** `import { onShow } from "vue"`（会导致编译/运行错误）
- Tab 页 `onShow` 中调用 `user.hydrateLocalProfile()` 再拉接口

## 多端

微信 / App / H5 差异与 `#ifdef` 写法见 **[youbao-multiplatform](../youbao-multiplatform/SKILL.md)**。`.cursor/rules/` 下三条 Rules 会自动生效。

## 微信小程序坑

1. **`cl-text` 在 MP 为块级**：同行链接/混排用原生 `<text>` 嵌套，勿多个 `cl-text` 横排
2. **子组件事件**：重要流程（如登录成功）放在子组件内处理，或解析 `e.detail.__args__`
3. **`:deep()` 改不了 `cl-button` 内部**：用原生 `view` + `cl-text`，或 `pt.className` 作用在组件根节点
4. **图形验证码**：`data:image/png;base64,...` 用 `<image :src="...">`，不用 `cl-svg`

## UI 与样式

- **设计稿/截图高保真还原**（画布 **375px**，`rpx = 设计 px × 2`；**scoped SCSS 父子嵌套 + `&` 修饰符**）见 **[youbao-design-fidelity](../youbao-design-fidelity/SKILL.md)**「SCSS 写法」
- 页面根节点常用 `<cl-page :pt="{ className: 'page-fade' }">`
- 导航栏：`custom-navbar` 或 `cl-topbar`
- 列表：`cl-list-item`；弹层：`cl-popup`
- 未读角标参考 `pages/tabbar/user.uvue`、`pages/set/index.uvue` 的 `unread-badge` 结构
- Scoped 样式；大文件用 `// --- 区块名 ---` 分段注释即可

## 注释规范（本项目）

- 文件顶部：`<!-- 页面说明 path · 要点 -->`（uvue 模板上方或 script 前）
- script 首行：`/** 一句话说明 */`
- 避免冗长逐行注释；不写用户未要求的文档文件

## 改动原则

- **最小 diff**：只改与需求相关的文件
- **复用**：优先 `user`、`request`、`router`、已有组件，不重复造轮子
- **不主动** `git commit`、不扩 scope 到无关页面

## 常用跳转

```typescript
import { router } from "@/.cool";

router.push({ path: "/pages/tabbar/home", mode: "reLaunch" });
router.login();
router.back();
```

## 自检清单（改完登录/个人中心相关时）

- [ ] 登录后 Storage 仍有 `token`、`userInfo`、`loginPayload`
- [ ] 首页/我的/设置能显示 `userInfo` 昵称与头像
- [ ] 接口成功处未再判断 `res.code`
- [ ] 未因 `user.get()` 或 token 过期逻辑触发误 `logout`
