import { request, requestJson } from "../service/core";
import type {
	AccountEditParams,
	AccountListParams,
	AccountSaveParams,
	AccountSortKey,
	AddAccountByUrlParams
} from "../types/account";

/** 平台 Tab 与账号数量 GET /api/v1.home.home/newbieGuide */
export function getAccountPlatformGuide(step: number = 3) {
	return request({
		url: `/api/v1.home.home/newbieGuide?step=${step}`,
		method: "GET"
	});
}

/** 账号列表 GET /api/v1.enterprise.user/findAccountList */
export function getAccountList(params: AccountListParams = {}) {
	const query: string[] = [];
	if (params.platform_name != null && params.platform_name.trim() != "") {
		query.push(`platform_name=${encodeURIComponent(params.platform_name.trim())}`);
	}
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	const sortType = params.sort_type ?? params.sort ?? "default";
	query.push(`sort_type=${encodeURIComponent(sortType)}`);
	const qs = query.length > 0 ? `?${query.join("&")}` : "";
	return request({
		url: `/api/v1.enterprise.user/findAccountList${qs}`,
		method: "GET"
	});
}

/** 新增账号 POST /api/v1.enterprise.user/addAccount */
export function addAccount(params: AccountSaveParams) {
	return requestJson({
		url: "/api/v1.enterprise.user/addAccount",
		method: "POST",
		data: params
	});
}

/** 链接智能识别添加账号 POST /api/v1.enterprise.user/addAccountByUrl */
export function addAccountByUrl(params: AddAccountByUrlParams) {
	return requestJson({
		url: "/api/v1.enterprise.user/addAccountByUrl",
		method: "POST",
		data: params
	});
}

/** 编辑账号 POST /api/v1.enterprise.user/editAccount */
export function editAccount(params: AccountEditParams) {
	return requestJson({
		url: "/api/v1.enterprise.user/editAccount",
		method: "POST",
		data: {
			id: params.id,
			platform_name: params.platform_name,
			account_id: params.account_id,
			account_title: params.account_title,
			account_uid: params.account_uid ?? "",
			account_did: params.account_did ?? "",
			account_home: params.account_home ?? "",
			fans: params.fans
		}
	});
}

/** 删除账号 POST /api/v1.enterprise.user/deleteAccount */
export function deleteAccounts(ids: number[]) {
	return requestJson({
		url: "/api/v1.enterprise.user/deleteAccount",
		method: "POST",
		data: {
			id: ids
		}
	});
}

/** 字典列表 GET /api/Dict/findList */
export function getDictList(typeValue: string) {
	return request({
		url: `/api/Dict/findList?type_value=${encodeURIComponent(typeValue)}`,
		method: "GET"
	});
}

export type { AccountSortKey };
