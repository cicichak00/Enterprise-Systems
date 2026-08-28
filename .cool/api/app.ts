import { request } from "../service/core";

/** 应用系统配置（含底部菜单） GET /api/v1.enterprise.AppConfig/system */
export function getAppSystem() {
	return request({
		url: "/api/v1.enterprise.AppConfig/system",
		method: "GET"
	});
}
