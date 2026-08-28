import { request, requestJson } from "../service/core";
import type { OrderListParams } from "../types/order";

export type IssueVirtualOrderParams = {
	user_ids: number[];
	staff_revenue_total: number;
	keyword_id: number;
};

/** 生成虚拟订单 POST /api/v1.enterprise.Virtual/generateOrder */
export function issueVirtualOrder(params: IssueVirtualOrderParams) {
	return requestJson({
		url: "/api/v1.enterprise.Virtual/generateOrder",
		method: "POST",
		data: {
			user_ids: params.user_ids,
			staff_revenue_total: params.staff_revenue_total,
			keyword_id: params.keyword_id
		}
	});
}

/** 订单列表 GET /api/v1.enterprise.Order/list */
export function getOrderList(params: OrderListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 15;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.period != null && `${params.period}` != "") {
		query.push(`period=${params.period}`);
	}
	if (params.project_id != null && `${params.project_id}` != "") {
		query.push(`project_id=${params.project_id}`);
	}
	if (params.keyword != null && params.keyword != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword)}`);
	}
	if (params.user_id != null && `${params.user_id}` != "") {
		query.push(`user_id=${params.user_id}`);
	}
	if (params.start_date != null && params.start_date != "") {
		query.push(`start_date=${params.start_date}`);
	}
	if (params.end_date != null && params.end_date != "") {
		query.push(`end_date=${params.end_date}`);
	}
	return request({
		url: `/api/v1.enterprise.Order/list?${query.join("&")}`,
		method: "GET"
	});
}
