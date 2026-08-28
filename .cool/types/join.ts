export type JoinEnterpriseInfo = {
	id: number;
	enterprise_code: string;
	name: string;
	logo: string;
	logo_url: string;
	intro: string;
	join_url: string;
	qr_content: string;
};

export type JoinAgreements = {
	employee_notice: string;
	privacy_policy: string;
};

export type JoinInfoData = {
	enterprise: JoinEnterpriseInfo;
	agreements: JoinAgreements;
};

export type JoinInfoEnvelope = {
	code?: number;
	msg?: string;
	data?: JoinInfoData;
};

/** 协议内容扩展（join/status 返回 data.protocols.list[].content_extra） */
export type JoinProtocolContentExtra = {
	/** 富文本或纯文本摘要 */
	summary?: string;
	html?: string;
	content?: string;
};

/** 协议项（join/status 返回 data.protocols.list） */
export type JoinProtocolItem = {
	id?: number;
	key?: string;
	title?: string;
	content?: string;
	content_extra?: JoinProtocolContentExtra;
};

export type JoinProtocols = {
	list?: JoinProtocolItem[];
};

/** 加入企业申请单（join/status 返回 data.apply） */
export type JoinApplyInfo = {
	id?: number;
	apply_no?: string;
	status?: number;
	status_text?: string;
	reject_reason?: string;
	audit_time?: string | null;
	create_time?: string;
	enterprise_name?: string;
	[key: string]: any;
};

/** 加入企业状态 GET /api/enterprise/join/status */
export type JoinApplicationStatus = {
	/** 当前申请单（有待审/已通过等记录时返回） */
	apply?: JoinApplyInfo;
	apply_status?: number;
	apply_status_text?: string;
	can_apply?: boolean;
	is_member?: boolean;
	is_owner?: boolean;
	need_login?: boolean;
	/** 兼容旧字段（与 apply 内字段二选一） */
	status?: number;
	status_text?: string;
	msg?: string;
	apply_no?: string;
	reject_reason?: string;
	enterprise_id?: number;
	enterprise_name?: string;
	enterprise?: JoinEnterpriseInfo;
	protocols?: JoinProtocols;
	[key: string]: any;
};

export type JoinStatusEnvelope = {
	code?: number;
	msg?: string;
	data?: JoinApplicationStatus;
};

/** 加入申请列表项 GET /api/enterprise/join/apply */
export type JoinApplyListItem = JoinApplyInfo & {
	nickname?: string;
	mobile?: string;
	sn?: string;
	user_id?: number;
};

/** 加入申请详情 GET /api/enterprise/join/apply/detail */
export type JoinApplyDetail = JoinApplyListItem & {
	avatar?: string;
};

export type JoinApplyListParams = {
	page?: number;
	limit?: number;
	/** 0未审核 1审核通过 2驳回；不传为全部 */
	status?: number;
};

export type JoinApplyListStatusKey = "all" | "pending" | "approved" | "rejected";

/** 审核员工加入 POST /api/enterprise/join/apply/audit */
export type JoinApplyAuditParams = {
	apply_id: string | number;
	action: "approve" | "reject";
	reject_reason?: string;
};
