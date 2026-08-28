import { request } from "../service/core";

/** 我的页汇总 GET /api/v1.enterprise.Mine/index */
export function getMine() {
	return request({
		url: "/api/v1.enterprise.Mine/index",
		method: "GET"
	});
}

export type GetDepartureRecoveryListParams = {
	page?: number;
	limit?: number;
};

/** 企业主离职员工回收明细，仅返回企业主侧正向平账流水。 */
export function getDepartureRecoveryList(params: GetDepartureRecoveryListParams = {}) {
	return request({
		url: `/api/v1.enterprise.Mine/departureRecoveryList?page=${params.page ?? 1}&limit=${params.limit ?? 20}`,
		method: "GET"
	});
}
