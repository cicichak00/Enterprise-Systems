import { request, requestJson } from "../service/core";
import type {
	PublishListParams,
	PublishSubmitParams,
	TaskFormFieldsParams,
	TaskFormParams,
	TaskListParams,
	TaskParticipationListParams
} from "../types/task";

/** 任务列表 GET /api/v1.enterprise.Task/list */
export function getTaskList(params: TaskListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 20;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	if (params.category_id != null && params.category_id > 0) {
		query.push(`category_id=${params.category_id}`);
	}
	return request({
		url: `/api/v1.enterprise.Task/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 任务详情 GET /api/v1.enterprise.Task/detail（不传 type） */
export function getTaskDetail(id: number, page: number = 1, limit: number = 20, keyword?: string) {
	const query: string[] = [];
	query.push(`id=${id}`);
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (keyword != null && keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Task/detail?${query.join("&")}`,
		method: "GET"
	});
}

/** 故事/短剧任务详情 GET /api/v1.enterprise.Task/storyDetail */
export function getStoryDetail(id: number, projectId: number) {
	const query: string[] = [];
	query.push(`id=${id}`);
	query.push(`project_id=${projectId}`);
	return request({
		url: `/api/v1.enterprise.Task/storyDetail?${query.join("&")}`,
		method: "GET"
	});
}

/** 申请故事口令 POST /api/v1.enterprise.Task/storyApplyCode */
export function applyStoryCode(id: number, projectId: number) {
	return requestJson({
		url: "/api/v1.enterprise.Task/storyApplyCode",
		method: "POST",
		data: {
			id: id,
			project_id: projectId
		}
	});
}

/** 参与记录列表 GET /api/v1.enterprise.Task/participation */
export function getTaskParticipationList(params: TaskParticipationListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 20;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.task_id != null && params.task_id > 0) {
		query.push(`task_id=${params.task_id}`);
	}
	if (params.project_id != null && params.project_id > 0) {
		query.push(`project_id=${params.project_id}`);
	}
	if (params.status != null && `${params.status}`.trim() != "") {
		query.push(`status=${encodeURIComponent(`${params.status}`.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Task/participation?${query.join("&")}`,
		method: "GET"
	});
}

/** 任务表单字段 GET /api/v1.enterprise.Task/getFormFields（type 固定 keyword） */
export function getTaskFormFields(params: TaskFormFieldsParams) {
	const formType = params.type != null && `${params.type}`.trim() != "" ? `${params.type}`.trim() : "keyword";
	return request({
		url: `/api/v1.enterprise.Task/getFormFields?id=${params.id}&type=${encodeURIComponent(formType)}`,
		method: "GET"
	});
}

/** 回填是否显示视频/图片 GET /api/v1.enterprise.Publish/getPublishField */
export function getPublishField(project_id: number) {
	return request({
		url: `/api/v1.enterprise.Publish/getPublishField?project_id=${project_id}`,
		method: "GET"
	});
}

/** 回填字段列表 GET /api/v1.enterprise.Publish/getFieldList */
export function getPublishFieldList(project_id: number) {
	return request({
		url: `/api/v1.enterprise.Publish/getFieldList?project_id=${project_id}`,
		method: "GET"
	});
}

/** 回填列表 GET /api/v1.enterprise.Publish/list */
export function getPublishList(params: PublishListParams) {
	const query: string[] = [];
	query.push(`project_id=${params.project_id}`);
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.keyword_id != null && params.keyword_id > 0) {
		query.push(`keyword_id=${params.keyword_id}`);
	}
	return request({
		url: `/api/v1.enterprise.Publish/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 提交回填 POST /api/v1.enterprise.Publish/submit（JSON） */
export function submitPublish(params: PublishSubmitParams) {
	return requestJson({
		url: "/api/v1.enterprise.Publish/submit",
		method: "POST",
		data: {
			project_id: params.project_id,
			keyword_id: params.keyword_id,
			form_info: params.form_info
		}
	});
}

/** 任务参与动态表单 GET /api/v1.enterprise.Task/form */
export function getTaskForm(params: TaskFormParams = {}) {
	const query: string[] = [];
	if (params.task_id != null && params.task_id > 0) {
		query.push(`task_id=${params.task_id}`);
	}
	if (params.project_id != null && params.project_id > 0) {
		query.push(`project_id=${params.project_id}`);
	}
	const qs = query.length > 0 ? `?${query.join("&")}` : "";
	return request({
		url: `/api/v1.enterprise.Task/form${qs}`,
		method: "GET"
	});
}
