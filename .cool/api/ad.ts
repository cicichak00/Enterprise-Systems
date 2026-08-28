import { request } from "../service/core";
import type { AdQuery } from "../types/ad";

/** 广告列表 GET /api/v1.enterprise.Ad/list */
export function getAdList(query: AdQuery) {
	const data: UTSJSONObject = {
		page_key: query.page_key,
		position: query.position ?? "top",
		limit: query.limit ?? 10
	};
	return request({
		url: "/api/v1.enterprise.Ad/list",
		method: "GET",
		data: data
	});
}
