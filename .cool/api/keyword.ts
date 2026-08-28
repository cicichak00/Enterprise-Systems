import { request, requestJson } from "../service/core";
import type {
	AssignKeywordParams,
	GetAssignableKeywordParams,
	GetVirtualKeywordListParams,
	KeywordInitSelectParams,
	KeywordListParams,
	KeywordPublishListParams,
	KeywordPublishSubmitParams,
	KeywordRemoveParams,
	KeywordSubmitParams,
	KeywordEditRejectedParams,
	KeywordUserRequiredFieldsParams,
	ParseVideoUrlParams
} from "../types/keyword";

/** 关键词列表 GET /api/v1.enterprise.Keyword/list */
export function getKeywordList(params: KeywordListParams) {
	const query: string[] = [];
	query.push(`project_id=${params.project_id}`);
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.status != null && `${params.status}`.trim() != "") {
		query.push(`status=${encodeURIComponent(`${params.status}`.trim())}`);
	}
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Keyword/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 虚拟订单关键词列表 GET /api/v1.enterprise.Virtual/keywordList */
export function getVirtualKeywordList(params: GetVirtualKeywordListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 500;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Virtual/keywordList?${query.join("&")}`,
		method: "GET"
	});
}

/** 企业主查看企业下全部员工推广内容（不传 project_id） */
export function getEnterprisePromotionKeywordList(params: GetAssignableKeywordParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	query.push(`scope=${encodeURIComponent(params.scope ?? "enterprise_all")}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	if (params.period != null && params.period.trim() != "") {
		query.push(`period=${encodeURIComponent(params.period.trim())}`);
	}
	if (params.start_date != null && params.start_date.trim() != "") {
		query.push(`start_date=${encodeURIComponent(params.start_date.trim())}`);
	}
	if (params.end_date != null && params.end_date.trim() != "") {
		query.push(`end_date=${encodeURIComponent(params.end_date.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Keyword/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 可切换项目列表 GET /api/v1.enterprise.Keyword/switchableProjects（无参数） */
export function getSwitchableProjects() {
	return request({
		url: "/api/v1.enterprise.Keyword/switchableProjects",
		method: "GET"
	});
}

/** 删除关键词 POST /api/v1.enterprise.Keyword/remove */
export function removeKeyword(params: KeywordRemoveParams) {
	return request({
		url: "/api/v1.enterprise.Keyword/remove",
		method: "POST",
		data: {
			keyword_id: `${params.keyword_id}`
		},
		header: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
}

/** 分配关键词 POST /api/v1.enterprise.Keyword/assignKeyword */
export function assignKeyword(params: AssignKeywordParams) {
	return requestJson({
		url: "/api/v1.enterprise.Keyword/assignKeyword",
		method: "POST",
		data: {
			project_id: params.project_id,
			keyword_id: params.keyword_id,
			user_id: params.user_id
		}
	});
}

export type KeywordTransferPoolParams = {
	page?: number;
	limit?: number;
	keyword?: string;
	source_staff_id?: number;
};

export type KeywordTransferRecordParams = {
	page?: number;
	limit?: number;
	keyword?: string;
};

export type TransferRetiredKeywordParams = {
	keyword_ids: number[];
	target_user_id: number;
	remark?: string;
};

/** 离职员工关键词公池：仅返回待转赠关键词 */
export function getKeywordTransferPool(params: KeywordTransferPoolParams = {}) {
	const query: string[] = [
		`page=${params.page ?? 1}`,
		`limit=${params.limit ?? 20}`
	];
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	if (params.source_staff_id != null && params.source_staff_id > 0) {
		query.push(`source_staff_id=${params.source_staff_id}`);
	}
	return request({
		url: `/api/v1.enterprise.Keyword/transferPool?${query.join("&")}`,
		method: "GET"
	});
}

/** 企业主转赠行为记录 */
export function getKeywordTransferRecords(params: KeywordTransferRecordParams = {}) {
	const query: string[] = [
		`page=${params.page ?? 1}`,
		`limit=${params.limit ?? 20}`
	];
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Keyword/transferRecords?${query.join("&")}`,
		method: "GET"
	});
}

/**
 * 离职关键词转赠。
 * 服务端应在同一事务中仅更新关键词当前归属员工，并新增不可变的转赠行为记录。
 */
export function transferRetiredKeywords(params: TransferRetiredKeywordParams) {
	return requestJson({
		url: "/api/v1.enterprise.Keyword/transfer",
		method: "POST",
		data: {
			keyword_ids: params.keyword_ids,
			target_user_id: params.target_user_id,
			remark: params.remark ?? ""
		}
	});
}

/** 解析 CapCut 主页链接 */
export function getCapcutLinkInfo(url: string) {
	return request({
		url: `/api/v1.enterprise.Publish/capcutLinkInfo?url=${encodeURIComponent(url.trim())}`,
		method: "GET"
	});
}

/** 解析 TikTok 主页链接 */
export function getTiktokLinkInfo(url: string) {
	return request({
		url: `/api/v1.enterprise.Publish/tiktokLinkInfo?url=${encodeURIComponent(url.trim())}`,
		method: "GET"
	});
}

/** 提交关键词 POST /api/v1.enterprise.Keyword/add */
export function submitKeyword(params: KeywordSubmitParams) {
	return requestJson({
		url: "/api/v1.enterprise.Keyword/add",
		method: "POST",
		data: {
			project_id: params.project_id,
			form_info: params.form_info
		}
	});
}

/** 驳回后编辑提交 POST /api/v1.enterprise.keyword/editRejected */
export function editRejectedKeyword(params: KeywordEditRejectedParams) {
	return requestJson({
		url: "/api/v1.enterprise.keyword/editRejected",
		method: "POST",
		data: {
			project_id: params.project_id,
			id: params.id,
			form_info: params.form_info
		}
	});
}

/** 编辑提词字段回填 GET /api/v1.enterprise.keyword/userRequiredFields */
export function getKeywordUserRequiredFields(params: KeywordUserRequiredFieldsParams) {
	return request({
		url: `/api/v1.enterprise.keyword/userRequiredFields?project_id=${params.project_id}&keyword_id=${params.keyword_id}`,
		method: "GET"
	});
}

/** 回填页初始化 POST /api/v1.enterprise.Keyword/initSelectData */
export function getKeywordInitSelectData(params: KeywordInitSelectParams) {
	return requestJson({
		url: "/api/v1.enterprise.Keyword/initSelectData",
		method: "POST",
		data: {
			id: params.id,
			project_id: params.project_id
		}
	});
}

/** 回填动态字段 GET /api/v1.enterprise.Publish/getFieldList */
export function getKeywordPublishFieldList(project_id: number) {
	return request({
		url: `/api/v1.enterprise.Publish/getFieldList?project_id=${project_id}`,
		method: "GET"
	});
}

/** 提交作品回填 POST /api/v1.enterprise.Publish/submit */
export function submitKeywordPublish(params: KeywordPublishSubmitParams) {
	return requestJson({
		url: "/api/v1.enterprise.Publish/submit",
		method: "POST",
		data: {
			keywordInfo: params.keywordInfo,
			is_add: params.is_add,
			formData: params.formData
		}
	});
}

/** 批量回填智能识别 GET /api/v1.enterprise.Publish/batchIdentify */
export function postKeywordIsFill(project_id: number, video_url: string) {
	return request({
		url: `/api/v1.enterprise.Publish/batchIdentify?project_id=${project_id}&video_url=${encodeURIComponent(video_url)}`,
		method: "GET"
	});
}

/** 批量回填提交 POST /api/v1.enterprise.Publish/publishList */
export function postKeywordPublishList(params: KeywordPublishListParams) {
	return requestJson({
		url: "/api/v1.enterprise.Publish/publishList",
		method: "POST",
		data: {
			project_id: params.project_id,
			data: params.data
		}
	});
}

/** 批量解析（智能识别） POST /api/v1.enterprise.Publish/parseVideoUrl */
export function parseVideoUrl(params: ParseVideoUrlParams) {
	return requestJson({
		url: "/api/v1.enterprise.Publish/parseVideoUrl",
		method: "POST",
		data: {
			project_id: params.project_id,
			video_url: params.video_url
		}
	});
}
