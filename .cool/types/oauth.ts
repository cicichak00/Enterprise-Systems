/** GET /api/oauth/authorize 返回的 user */
export type OAuthAuthorizeUser = {
	id?: number;
	sn?: string;
	mobile?: string;
	nickname?: string;
	avatar?: string;
	token?: string;
	is_enterprise_owner?: number;
	enterprise_id?: number;
	[key: string]: any;
};

/** GET /api/oauth/authorize 返回的 system_info.system */
export type OAuthAuthorizeSystem = {
	logo?: string;
	intro_content?: string;
	intro_title?: string;
	title?: string;
	version?: string;
	[key: string]: any;
};

/** GET /api/oauth/authorize 返回的 system_info.protocol 项 */
export type OAuthAuthorizeProtocolItem = {
	id?: number;
	key?: string;
	title?: string;
	content?: string;
	summary?: string;
	version?: string;
	[key: string]: any;
};

/** GET /api/oauth/authorize 返回的 system_info */
export type OAuthAuthorizeSystemInfo = {
	system?: OAuthAuthorizeSystem;
	protocol?: OAuthAuthorizeProtocolItem[];
	[key: string]: any;
};

/** GET /api/oauth/authorize 返回的 data */
export type OAuthAuthorizeData = {
	need_confirm: boolean;
	enterprise_id?: number;
	client_id?: string;
	client_name?: string;
	system_info?: OAuthAuthorizeSystemInfo;
	mobile_mask?: string;
	code?: string;
	state?: string;
	code_expires_in?: number;
	token?: string;
	user?: OAuthAuthorizeUser;
};

export type OAuthAuthorizeEnvelope = {
	code?: number | string;
	msg?: string;
	data?: OAuthAuthorizeData;
};

/** POST /api/oauth/authorize/confirmAuth 返回的 data */
export type OAuthConfirmData = {
	code?: string;
	state?: string;
	token?: string;
	expires_in?: number;
	user?: {
		id?: number;
		sn?: string;
		mobile?: string;
		nickname?: string;
		avatar?: string;
		is_enterprise_owner?: number;
		staff_id?: number;
		staff_role?: string;
		enterprise_id?: number;
		enterprise_code?: string;
		enterprise_name?: string;
		enterprise_logo?: string;
		token?: string;
		[key: string]: any;
	};
};

export type OAuthConfirmEnvelope = {
	code?: number | string;
	msg?: string;
	data?: OAuthConfirmData;
};
