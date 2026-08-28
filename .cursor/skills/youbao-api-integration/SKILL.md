---
name: youbao-api-integration
description: web-mini 对接后端 HTTP 接口。使用 Apifox 导出的 common.md、@/.cool request、类型与 .cool/api 封装；替换 Mock、联调、登录白名单与错误提示。对接接口、看接口文档、接 YApi/Apifox 时使用。与 youbao-uniapp-frontend、uniapp-request 规则配合。
---

# 接口对接（web-mini）

## 文档来源

1. **Apifox 导出**：优先读本目录 [common.md](./common.md)（可从 `Downloads/common.md` 同步更新）。
2. **登记表**：新接口在 [endpoints.md](./endpoints.md) 增一行（路径、方法、状态、封装位置）。
3. **响应信封**：导出里「成功示例」常为空；以 **`.cool/service/index.ts`** 为准：`{ code, msg, data }`，**`code === 1` → `request` 只 resolve `data`**（勿写 `res.code` / `res.data.xxx`，见 `.cursor/rules/uniapp-request.mdc`）。

## Base URL

- 开发：`config/proxy.ts` → `dev.target` = `https://testapi.youbaoyun.cn/api`
- 代码里 **`url` 写相对路径**，如 `/common/policy`，不要重复写 host。

## 对接流程

1. 从 common.md / 单接口文档确认：方法、路径、Query/Body、是否需登录。
2. 在 `.cool/types/` 定义 **`data` 成功体** 类型（不是整包 Response）。
3. 在 `.cool/api/<模块>.ts` 封装函数，内部只调 `request`。
4. 页面 / Store：`loading`、`.catch` 提示、`user.applyLoginResponse`（登录类）。
5. 免 token：路径加入 `config/index.ts` → `ignoreTokens`（支持 `*` 通配）。
6. 更新 [endpoints.md](./endpoints.md)。

## 代码模板

```typescript
import { request, type Response } from "@/.cool";
import { useUi } from "@/uni_modules/cool-ui";

// GET + Query（当前 request 未拼 params 时，写在 url）
export function getPolicy(type: "service" | "distribution" | "privacy") {
  return request({
    url: `/common/policy?type=${type}`,
    method: "GET"
  });
}

// 页面
const ui = useUi();
getPolicy("service")
  .then((data) => { /* data 即业务 data */ })
  .catch((err) => {
    const r = err as Response;
    ui.showToast({ message: r.msg ?? r.message ?? "请求失败" });
  });
```

## common 模块（文档已给）

| 接口 | 方法 | 路径 | Query |
| --- | --- | --- | --- |
| 获取各种协议 | GET | `/common/policy` | `type`: `service` \| `distribution` \| `privacy` |

文档 URL 示例：`https://testapi.youbaoyun.cn/api/common/policy?type=service` → 代码 `baseUrl + "/common/policy?type=service"`。

## 与 Apifox 文档的差异

| 文档写法 | 项目实际 |
| --- | --- |
| 全局「无需认证」 | 多数接口仍带 `Authorization`；协议类若 401 再考虑加入 `ignoreTokens` |
| 响应示例为空 | 按 `code/msg/data` 与 service 解包实现 |
| Content-Type json + GET 无 Body | GET 不写 body，Query 见上 |

## 自检

- [ ] `.then` 参数当 **data** 用，无 `res.data.token`
- [ ] 错误用 `.catch` + `msg` / `message`
- [ ] 新接口已写入 `endpoints.md`
- [ ] 替换 Mock 后有空态 / 失败提示
- [ ] 多端：小程序合法域名、HTTPS（PR 说明未测端）

## 关联

- 页面生命周期、登录字段映射：`youbao-uniapp-frontend` SKILL
- 条件编译：`youbao-multiplatform` SKILL
