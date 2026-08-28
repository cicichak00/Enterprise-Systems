import { request, requestJson } from "../service/core";
import type {
	ComposeAddParams,
	ComposeDelParams,
	ComposeInitPageParams,
	ComposeMyListLogParams,
	ComposeProjectListsParams,
	ComposePublishParams
} from "../types/compose";

/** 组合提词记录列表 GET /api/v1.enterprise.compose/myListLog */
export function getComposeMyListLog(params: ComposeMyListLogParams) {
	const query: string[] = [];
	query.push(`id=${params.id}`);
	const pageNo = params.page_no ?? 1;
	const pageSize = params.page_size ?? 15;
	query.push(`page_no=${pageNo}`);
	query.push(`page_size=${pageSize}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.compose/myListLog?${query.join("&")}`,
		method: "GET"
	});
}

/** 组合提词页初始化 POST /api/v1.enterprise.compose/initPage */
export function initComposePage(params: ComposeInitPageParams) {
	return request({
		url: "/api/v1.enterprise.compose/initPage",
		method: "POST",
		data: {
			project_id: params.project_id
		},
		header: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
}

/** 组合下可选项目 POST /api/v1.enterprise.compose/projectLists */
export function getComposeProjectLists(params: ComposeProjectListsParams) {
	return request({
		url: "/api/v1.enterprise.compose/projectLists",
		method: "POST",
		data: {
			id: params.id
		},
		header: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
}

/** 组合提词提交 POST /api/v1.enterprise.compose/add */
export function submitComposeAdd(params: ComposeAddParams) {
	return requestJson({
		url: "/api/v1.enterprise.compose/add",
		method: "POST",
		data: {
			id: params.id,
			projectLists: params.projectLists,
			expand: params.expand
		}
	});
}

/** 组合提词删除 POST /api/v1.enterprise.compose/del */
export function deleteComposeKeywords(params: ComposeDelParams) {
	return requestJson({
		url: "/api/v1.enterprise.compose/del",
		method: "POST",
		data: {
			id: params.id,
			arrKeyword: params.arrKeyword
		}
	});
}

/** 组合回填发布 POST /api/v1.enterprise.compose/publish */
export function submitComposePublish(params: ComposePublishParams) {
	return requestJson({
		url: "/api/v1.enterprise.compose/publish",
		method: "POST",
		data: {
			keyword: params.keyword,
			projectLists: params.projectLists,
			form_info: params.form_info
		}
	});
}
