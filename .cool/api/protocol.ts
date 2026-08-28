import { request } from "../service/core";
import type { GetAppProtocolDetailParams, GetAppProtocolListParams } from "../types/protocol";

/** 协议详情 GET /api/v1.enterprise.AppConfig/protocolDetail */
export function getAppProtocolDetail(params: GetAppProtocolDetailParams) {
	const query: string[] = [];
	const id = `${params.id ?? ""}`.trim();
	if (id != "") {
		query.push(`id=${encodeURIComponent(id)}`);
	}
	const key = `${params.key ?? ""}`.trim();
	if (key != "") {
		query.push(`key=${encodeURIComponent(key)}`);
	}
	const pageKey = `${params.page_key ?? ""}`.trim();
	if (pageKey != "") {
		query.push(`page_key=${encodeURIComponent(pageKey)}`);
	}
	return request({
		url: `/api/v1.enterprise.AppConfig/protocolDetail?${query.join("&")}`,
		method: "GET"
	});
}

/** 协议列表 GET /api/v1.enterprise.AppConfig/protocolList */
export function getAppProtocolList(params: GetAppProtocolListParams) {
	const pageKey = params.page_key ?? "";
	const limit = params.limit ?? 20;
	return request({
		url: `/api/v1.enterprise.AppConfig/protocolList?page_key=${encodeURIComponent(pageKey)}&limit=${limit}`,
		method: "GET"
	});
}
