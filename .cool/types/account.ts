export type AccountSortKey = "default" | "fans_desc" | "fans_asc" | "create_desc" | "create_asc";

export type AccountPlatformOption = {
	value: string;
	name: string;
	subtitle?: string;
	icon?: string;
	account_count?: number;
	color?: string;
};

export type AccountListItem = {
	id: number;
	platform_name: string;
	account_id: string;
	account_title: string;
	account_uid?: string;
	account_did?: string;
	account_home?: string;
	account_type?: string;
	fans: number;
	color?: string;
	create_time?: string;
};

export type AccountListParams = {
	/** 媒体平台，必填 */
	platform_name?: string;
	/** 账号名称 / ID / UID 模糊搜索 */
	keyword?: string;
	/** 排序方式 */
	sort_type?: AccountSortKey;
	/** @deprecated 兼容旧参数，请使用 sort_type */
	sort?: AccountSortKey;
};

export type AccountSaveParams = {
	platform_name: string;
	account_id: string;
	account_title: string;
	account_uid?: string;
	account_did?: string;
	account_home?: string;
	fans: number;
};

export type AccountEditParams = AccountSaveParams & {
	id: number;
	is_show?: number;
};

export type AccountDictItem = {
	id?: number;
	name: string;
	value?: string;
	subtitle?: string;
	icon?: string;
	sort?: number;
	account_count?: number;
};

export type AddAccountByUrlParams = {
	channel: string;
	user_id: number;
	platform_id: number;
	origin_resource_url: string;
};
