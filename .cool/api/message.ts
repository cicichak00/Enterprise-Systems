import { request } from "../service/core";
import type { MessageListParams } from "../types/message";

/** 消息列表 GET /api/v1.enterprise.Message/list */
export function getMessageList(params: MessageListParams = {}) {
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	const query: string[] = [`page=${page}`, `limit=${limit}`];
	if (params.is_read != null && `${params.is_read}` != "") {
		query.push(`is_read=${params.is_read}`);
	}
	if (params.type != null && `${params.type}` != "") {
		query.push(`type=${encodeURIComponent(`${params.type}`)}`);
	}
	return request({
		url: `/api/v1.enterprise.Message/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 消息详情 GET /api/v1.enterprise.Message/detail */
export function getMessageDetail(id: number | string) {
	return request({
		url: `/api/v1.enterprise.Message/detail?id=${id}`,
		method: "GET"
	});
}
