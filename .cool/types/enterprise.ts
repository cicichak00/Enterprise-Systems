/** 企业认证申请参数（与 /api/enterprise/cert/apply 一致） */
export type EnterpriseCertApplyParams = {
	type: number;
	entity_name: string;
	credit_code: string;
	entity_phone: string;
	address: string;
	business_license_image: string;
	id_card_portrait: string;
	id_card_emblem: string;
	legal_rep_name: string;
	legal_rep_id_number: string;
	legal_rep_contact_address: string;
	legal_rep_phone: string;
	face_auth_image: string;
};

export type EnterpriseCertStatus = {
	status?: number;
	status_text?: string;
	msg?: string;
	reject_reason?: string;
	type?: number;
	entity_name?: string;
	credit_code?: string;
	entity_phone?: string;
	address?: string;
	business_license_image?: string;
	id_card_portrait?: string;
	id_card_emblem?: string;
	legal_rep_name?: string;
	legal_rep_id_number?: string;
	legal_rep_contact_address?: string;
	legal_rep_phone?: string;
	face_auth_image?: string;
	apply?: EnterpriseCertStatus;
	detail?: EnterpriseCertStatus;
	[key: string]: any;
};

export type EnterpriseApiEnvelope = {
	code?: number;
	msg?: string;
	data?: EnterpriseCertStatus;
};

/** 企业协议项 */
export type EnterpriseProtocolItem = {
	id?: number;
	protocol_id?: number;
	key?: string;
	protocol_key?: string;
	title?: string;
	protocol_title?: string;
	protocol_version?: string;
	/** 副标题 / 摘要（接口可能返回其一） */
	summary?: string;
	desc?: string;
	subtitle?: string;
	description?: string;
	[key: string]: any;
};

export type EnterpriseProtocols = {
	total?: number;
	signed_count?: number;
	all_signed?: boolean;
	list?: EnterpriseProtocolItem[];
	[key: string]: any;
};

/** 企业资质（/api/enterprise/info → cert） */
export type EnterpriseCertInfo = {
	has_cert?: boolean;
	is_certified?: boolean;
	status?: number;
	status_text?: string;
	entity_name?: string;
	credit_code?: string;
	legal_rep_name?: string;
	contact_phone?: string;
	enterprise_code?: string;
	[key: string]: any;
};

/** 按企业编码查询 GET /api/enterprise?code= */
export type EnterpriseByCodeInfo = {
	id?: number;
	enterprise_code?: string;
	name?: string;
	logo?: string;
	intro?: string;
	contact_phone?: string;
	contact_name?: string;
	contact_address?: string;
	protocols?: EnterpriseProtocolItem[] | EnterpriseProtocols;
	[key: string]: any;
};

/** 企业具体信息 GET /api/enterprise/info */
export type EnterpriseInfo = {
	id?: number;
	name?: string;
	logo?: string;
	intro?: string;
	/** 企业邀请码，用于生成员工加入链接 */
	enterprise_code?: string;
	/** 员工加入链接（优先用于二维码） */
	join_url?: string;
	/** 二维码内容（优先用于二维码） */
	qr_content?: string;
	/** 员工权限预设：是否可查看收益数据，0 关 1 开 */
	preset_can_view_revenue?: number | boolean;
	preset_disabled_project_ids?: number[];
	/** 后台开白开关：控制企业主侧是否展示字节任务台管理入口 */
	byte_task_enabled?: number | boolean;
	byte_whitelist_enabled?: number | boolean;
	can_manage_byte_task?: number | boolean;
	cert?: EnterpriseCertInfo;
	protocols?: EnterpriseProtocols;
	[key: string]: any;
};

export type SaveEnterpriseSettingsParams = {
	name: string;
	logo: string;
	intro: string;
};

/** 保存企业邀请设置 POST /api/enterprise/invite/config（邀请设置 Tab） */
export type SaveEnterpriseInviteConfigParams = {
	name: string;
	preset_can_view_revenue: string;
	preset_commission_rate: number;
};

/** 同步项目预设 POST /api/enterprise/invite/config（仅传禁用项目 ID） */
export type SyncEnterpriseInvitePresetParams = {
	preset_disabled_project_ids: number[];
};

/** 企业项目项 GET /api/enterprise/project → list[] */
export type EnterpriseProjectItem = {
	id?: number;
	project_id?: number;
	title?: string;
	logo?: string;
	status?: number;
	category_name?: string;
	category_title?: string;
	[key: string]: any;
};

/** 企业项目列表 GET /api/enterprise/project */
export type GetEnterpriseProjectListParams = {
	category_id?: string | number;
	type?: string | number;
	keyword?: string;
	page?: number;
	limit?: number;
	format?: string;
};
