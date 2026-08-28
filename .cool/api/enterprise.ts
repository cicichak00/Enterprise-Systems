import { request, requestJson } from "../service/core";
import type {
	EnterpriseCertApplyParams,
	GetEnterpriseProjectListParams,
	SaveEnterpriseInviteConfigParams,
	SaveEnterpriseSettingsParams,
	SyncEnterpriseInvitePresetParams
} from "../types/enterprise";

/** 企业详情（邀请码页） GET /api/v1.enterprise.Enterprise/detail?code= */
export function getEnterpriseByCode(code: string) {
	const trimmed = `${code}`.trim();
	return request({
		url: `/api/v1.enterprise.Enterprise/detail?code=${encodeURIComponent(trimmed)}`,
		method: "GET"
	});
}

/** 认证状态 GET /api/v1.enterprise.Cert/status */
export function getEnterpriseCertStatus() {
	return request({
		url: "/api/v1.enterprise.Cert/status",
		method: "GET"
	});
}

/** 提交认证 POST /api/v1.enterprise.Cert/apply */
export function applyEnterpriseCert(params: EnterpriseCertApplyParams) {
	return requestJson({
		url: "/api/v1.enterprise.Cert/apply",
		method: "POST",
		data: params
	});
}

/** 当前企业信息 GET /api/v1.enterprise.Enterprise/info */
export function getEnterpriseInfo() {
	return request({
		url: "/api/v1.enterprise.Enterprise/info",
		method: "GET"
	});
}

/** 保存企业设置 POST /api/v1.enterprise.Enterprise/saveSettings */
export function saveEnterpriseSettings(params: SaveEnterpriseSettingsParams) {
	return requestJson({
		url: "/api/v1.enterprise.Enterprise/saveSettings",
		method: "POST",
		data: {
			name: params.name,
			logo: params.logo,
			intro: params.intro
		}
	});
}

/** 企业授权项目列表 GET /api/v1.enterprise.Enterprise/projectList */
export function getEnterpriseProjectList(params: GetEnterpriseProjectListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	const format = params.format ?? "auth";
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	query.push(`format=${format}`);
	const categoryId =
		params.category_id != null && `${params.category_id}` != "" ? `${params.category_id}` : "";
	query.push(`category_id=${categoryId}`);
	const type = params.type != null && `${params.type}` != "" ? `${params.type}` : "";
	query.push(`type=${type}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Enterprise/projectList?${query.join("&")}`,
		method: "GET"
	});
}

/** 保存邀请配置 POST /api/v1.enterprise.Enterprise/saveInviteConfig */
export function saveEnterpriseInviteConfig(params: SaveEnterpriseInviteConfigParams) {
	return requestJson({
		url: "/api/v1.enterprise.Enterprise/saveInviteConfig",
		method: "POST",
		data: {
			name: params.name,
			preset_can_view_revenue: params.preset_can_view_revenue
		}
	});
}

/** 同步项目预设给协作者 POST /api/v1.enterprise.Enterprise/saveInviteConfig（仅 preset_disabled_project_ids） */
export function syncEnterpriseInvitePreset(params: SyncEnterpriseInvitePresetParams) {
	return requestJson({
		url: "/api/v1.enterprise.Enterprise/saveInviteConfig",
		method: "POST",
		data: {
			preset_disabled_project_ids: params.preset_disabled_project_ids
		}
	});
}
