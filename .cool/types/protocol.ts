/** 协议内容扩展 */
export type ProtocolContentExtra = {
	summary?: string;
	html?: string;
	content?: string;
};

/** 协议详情（/api/app/protocol/detail） */
export type AppProtocolDetail = {
	id?: number;
	protocol_id?: number;
	key?: string;
	title?: string;
	icon?: string;
	version?: string;
	protocol_version?: string;
	summary?: string;
	content?: string;
	content_extra?: ProtocolContentExtra;
	effective_time?: string;
	[key: string]: any;
};

/** page_key: login 登录 | join 加入企业 | enterprise 企业入驻 */
export type AppProtocolPageKey = "login" | "join" | "enterprise";

export type GetAppProtocolDetailParams = {
	id?: string | number;
	key?: string;
	page_key?: AppProtocolPageKey | string;
};

export type GetAppProtocolListParams = {
	page_key: AppProtocolPageKey | string;
	limit?: number;
};
