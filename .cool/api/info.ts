import { request } from "../service/core";

export type AppInfoAction = "login" | "enterprise";

/** 应用启动信息 GET /api/v1.enterprise.AppConfig/info?action= */
export function getAppInfo(action: AppInfoAction = "enterprise") {
	return request({
		url: `/api/v1.enterprise.AppConfig/info?action=${action}`,
		method: "GET"
	});
}
