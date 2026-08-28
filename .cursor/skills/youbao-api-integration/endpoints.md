# 已登记接口（web-mini）

| 状态 | 方法 | 路径 | 说明 | 封装 / 调用方 |
| --- | --- | --- | --- | --- |
| 已接 | POST | `/login/mobile` | 验证码登录 | `.cool/api/login.ts` → `pages/login/mobile.uvue` |
| 已接 | POST | `/login/account` | 账号密码登录 | `.cool/api/login.ts` → `pages/login/account.uvue` |
| 已接 | POST | `/sms/send` | 短信验证码（scene: login / set_password） | `.cool/api/login.ts` → `pages/login/mobile.uvue`、`pages/user/login-password.uvue` |
| 已接 | GET | `/login/logout` | 退出登录 | `.cool/api/login.ts` |
| 已接 | POST | `/v1.my/getUserInfo` | 登录后用户信息 | `.cool/api/login.ts` → `.cool/store/user.ts` |
| 已接 | GET | `/app/user/info/person` | 个人资料 | `.cool/store/user.ts` → `user.get()` |
| 已接 | GET | `/common/policy?type=` | 协议文案 | `.cool/api/common.ts` → `pages/set/agreement.uvue` |
| 已接 | GET | `/common/config` | 全局配置（domain 切换 API 根地址） | `.cool/api/common.ts` → `App.uvue` `initAppConfig()` |
| 已接 | GET | `/v1.company/status?user_id=` | 企业号申请状态 | `.cool/api/company.ts` → `pages/join/enterprise-apply/index.uvue` |
| 已接 | POST | `/v1.company/submit` | 提交企业号申请（urlencoded） | `.cool/api/company.ts` → `pages/join/enterprise-apply/index.uvue` |
| 已接 | POST | `/upload/image` | 图片上传（youbao_mini 同款） | `.cool/api/upload.ts` → `pages/join/enterprise-apply/index.uvue` |
| 已接 | GET | `/api/oauth/authorize` | OAuth 授权预检 | `.cool/api/oauth.ts` → `pages/join/enterprise-apply.uvue` |
| 已接 | POST | `/api/oauth/authorize/confirmAuth` | 授权登录并生成工作台（urlencoded） | `.cool/api/oauth.ts` → `pages/join/enterprise-apply.uvue` |
| 已接 | GET | `/api/user/profile` | 获取个人信息 | `.cool/api/login.ts` → `pages/user/account.uvue` |
| 已接 | POST | `/api/user/profile` | 修改个人信息（nickname、avatar，JSON） | `.cool/api/login.ts` → `pages/user/account.uvue` |
| 已接 | GET | `/api/task/storyDetail?id=&project_id=` | 故事详情 | `.cool/api/task.ts` → `pages/task/story-detail.uvue` |
| 已接 | POST | `/api/task/storyApplyCode` | 申领故事口令 | `.cool/api/task.ts` → `pages/task/story-detail.uvue` |
| 已接 | GET | `/api/v1.enterprise.compose/myListLog` | 组合提词记录列表 | `.cool/api/compose.ts` → `pages/task/prompt-record.uvue` |
| 已接 | POST | `/api/v1.enterprise.compose/del` | 组合提词删除 | `.cool/api/compose.ts` → `pages/task/prompt-record.uvue` |
| 已接 | POST | `/api/v1.enterprise.compose/publish` | 组合回填发布 | `.cool/api/compose.ts` → `pages/task/combo-backfill.uvue` |
| 已接 | POST | `/api/v1.enterprise.compose/projectLists` | 组合下可选项目 | `.cool/api/compose.ts` → `pages/task/combo-prompt.uvue` |
| 已接 | POST | `/api/v1.enterprise.compose/initPage` | 组合提词页初始化（project_id） | `.cool/api/compose.ts` → `pages/task/combo-prompt.uvue` |
| 已接 | GET | `/api/v1.enterprise.keyword/userRequiredFields` | 编辑提词字段回填 | `.cool/api/keyword.ts` → `pages/task/form.uvue` |
| 已接 | POST | `/api/v1.enterprise.keyword/editRejected` | 驳回后编辑提交 | `.cool/api/keyword.ts` → `pages/task/form.uvue` |
| 已接 | GET | `/api/v1.enterprise.Staff/list` | 员工/组员列表（数据页汇总+列表） | `.cool/api/staff.ts` → `pages/tabbar/studio/data.uvue` |
| 已接 | GET | `/api/v1.enterprise.Staff/detail` | 组员详情 | `.cool/api/staff.ts` → `pages/tabbar/studio/member-detail.uvue` |
| 已接 | GET | `/api/v1.enterprise.staff/withdrawPermissionGroups` | 提现权限分组 Tab（未分组 + 组长） | `.cool/api/staff.ts` → `components/business/batch-wallet-popup.uvue` |
| 已接 | GET | `/api/v1.enterprise.staff/withdrawPermissionList` | 提现权限员工列表（按分组查） | `.cool/api/staff.ts` → `components/business/batch-wallet-popup.uvue` |
| 已接 | POST | `/api/v1.enterprise.staff/withdrawPermissionSave` | 批量开关提现权限 | `.cool/api/staff.ts` → `components/business/batch-wallet-popup.uvue` |
| 已接 | GET | `/api/v1.enterprise.Order/list` | 订单列表（支持 user_id） | `.cool/api/order.ts` → `pages/tabbar/studio/member-detail.uvue` |
| 已接 | POST | `/api/v1.enterprise.userCertify/submit` | 提交个人实名认证 | `.cool/api/user-certify.ts` → `pages/user/real-name.uvue` |
| 已接 | POST | `/api/v1.enterprise.userCertify/getTypeInfo` | 实名认证类型状态 | `.cool/api/user-certify.ts` → `pages/wallet/index.uvue` |
| 已接 | POST | `/api/v1.enterprise.userCertify/queryVerify` | 查询/同步实名状态 | `.cool/api/user-certify.ts` → `pages/user/real-name.uvue` |
| 已接 | GET | `/api/v1.enterprise.staffBank/lists` | 员工银行卡列表 | `.cool/api/wallet.ts` → `pages/wallet/bank-cards.uvue` |
| 已接 | POST | `/api/v1.enterprise.staffBank/add` | 绑定银行卡 | `.cool/api/wallet.ts` → `pages/wallet/bank-card-add.uvue` |
| 已接 | POST | `/api/v1.enterprise.staffBank/delete` | 删除银行卡 | `.cool/api/wallet.ts` → `pages/wallet/bank-cards.uvue` |
| 已接 | GET | `/api/v1.enterprise.staffBank/bankList` | 开户银行列表 | `.cool/api/wallet.ts` → `pages/wallet/bank-card-add.uvue` |
| 已接 | POST | `/api/v1.enterprise.staffWithdraw/setWithdrawPassword` | 设置/修改提现密码 | `.cool/api/wallet.ts` → `pages/wallet/withdrawal-password.uvue` |
| 已接 | GET | `/api/v1.enterprise.staffWithdraw/wallet` | 员工提现钱包概览（可提现金额） | `.cool/api/wallet.ts` → `pages/wallet/withdraw-apply.uvue` |
| 已接 | POST | `/api/v1.enterprise.staffWithdraw/withdrawApply` | 员工提现申请 | `.cool/api/wallet.ts` → `pages/wallet/withdraw-apply.uvue` |
| 已接 | GET | `/api/v1.enterprise.staffWithdraw/withdrawRecords` | 员工提现记录 | `.cool/api/wallet.ts` → `pages/wallet/withdrawals.uvue` |
| 已接 | POST | `/api/v1.enterprise.staffWithdraw/calculateTax` | 提现扣税预算 | `.cool/api/wallet.ts` → `pages/wallet/withdraw-apply.uvue` |
| 已接 | POST | `/api/v1.enterprise.Publish/parseVideoUrl` | 作品回填批量解析（智能识别） | `.cool/api/keyword.ts` → `components/task/batch-backfill-popup.uvue` |
| 已接 | POST | `/api/v1.enterprise.Publish/submit` | 作品回填提交（含批量识别成功提交） | `.cool/api/task.ts` → `pages/task/publish.uvue` / `components/task/batch-backfill-popup.uvue` |

`type` 枚举见 [common.md](./common.md)「获取各种协议」。
