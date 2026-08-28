import { request } from "../service/core";

/** 项目业务类型 GET /api/v1.enterprise.Project/types */
export function getProjectTypes() {
	return request({
		url: "/api/v1.enterprise.Project/types",
		method: "GET"
	});
}
