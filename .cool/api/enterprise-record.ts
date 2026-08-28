import { request } from "../service/core";

export type EnterpriseRecordListParams = {
	page?: number;
	limit?: number;
	keyword?: string;
};

function buildRecordQuery(params: EnterpriseRecordListParams): string {
	const query: string[] = [];
	query.push(`page=${params.page ?? 1}`);
	query.push(`limit=${params.limit ?? 20}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	query.push("scope=enterprise_all");
	return query.join("&");
}

/** 企业主查看企业下全部员工回填记录 */
export function getEnterpriseBackfillRecordList(params: EnterpriseRecordListParams = {}) {
	return request({
		url: `/api/v1.enterprise.Publish/list?${buildRecordQuery(params)}`,
		method: "GET"
	});
}

/** 企业主查看已审核、已结算订单收益记录 */
export function getEnterpriseRevenueRecordList(params: EnterpriseRecordListParams = {}) {
	return request({
		url: `/api/v1.enterprise.Order/list?${buildRecordQuery(params)}&audit_status=approved&settlement_status=settled`,
		method: "GET"
	});
}

/** 企业主查看企业下员工已完成提现记录 */
export function getEnterpriseWithdrawRecordList(params: EnterpriseRecordListParams = {}) {
	return request({
		url: `/api/v1.enterprise.staffWithdraw/withdrawRecords?${buildRecordQuery(params)}&status=completed`,
		method: "GET"
	});
}
