import { request, requestJson } from "../service/core";
import type { JoinApplyAuditParams, JoinApplyListParams } from "../types/join";

/** 加入状态 GET /api/v1.enterprise.Join/status */
export function getJoinStatus(code: string) {
	return request({
		url: `/api/v1.enterprise.Join/status?code=${encodeURIComponent(code)}`,
		method: "GET"
	});
}

/** 申请列表（审核） GET /api/v1.enterprise.Join/applyList */
export function getEnterpriseJoinApplyList(params: JoinApplyListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.status != null) {
		query.push(`status=${params.status}`);
	}
	return request({
		url: `/api/v1.enterprise.Join/applyList?${query.join("&")}`,
		method: "GET"
	});
}

/** 申请详情 GET /api/v1.enterprise.Join/detail */
export function getEnterpriseJoinApplyDetail(id: number | string) {
	return request({
		url: `/api/v1.enterprise.Join/detail?id=${id}`,
		method: "GET"
	});
}

/** 审核申请 POST /api/v1.enterprise.Join/audit */
export function auditEnterpriseJoinApply(params: JoinApplyAuditParams) {
	return request({
		url: "/api/v1.enterprise.Join/audit",
		method: "POST",
		data: {
			apply_id: `${params.apply_id}`,
			action: params.action,
			reject_reason: params.reject_reason ?? ""
		},
		header: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
}

/** 提交加入申请 POST /api/v1.enterprise.Join/apply */
export function applyJoinEnterprise(code: string, agreeTerms: boolean) {
	return requestJson({
		url: "/api/v1.enterprise.Join/apply",
		method: "POST",
		data: {
			code: code,
			agree_terms: agreeTerms ? 1 : 0
		}
	});
}
