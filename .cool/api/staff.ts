import { request, requestJson } from "../service/core";
import type { StaffAdvancedRole } from "../types/staff";

export type GetStaffListParams = {
	page?: number;
	limit?: number;
	/** 0 离职/禁用，1 正常 */
	status?: number;
	keyword?: string;
	/** 收益排序 desc 从高到低 / asc 从低到高 */
	order?: string;
	/** normal 普通员工 / leader 小组长 / member 组员 */
	role?: string;
};

/** 员工列表 GET /api/v1.enterprise.Staff/list（无 Query，仅 token） */
export function getStaff() {
	return request({
		url: "/api/v1.enterprise.Staff/list",
		method: "GET"
	});
}

/** 员工列表 GET /api/v1.enterprise.Staff/list */
export function getStaffList(params: GetStaffListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.status != null) {
		query.push(`status=${params.status}`);
	}
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	if (params.order != null && params.order.trim() != "") {
		query.push(`order=${encodeURIComponent(params.order.trim())}`);
	}
	if (params.role != null && params.role.trim() != "") {
		query.push(`role=${encodeURIComponent(params.role.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Staff/list?${query.join("&")}`,
		method: "GET"
	});
}

/** 员工详情 GET /api/v1.enterprise.Staff/detail */
export function getStaffDetail(id: number) {
	return request({
		url: `/api/v1.enterprise.Staff/detail?id=${id}`,
		method: "GET"
	});
}

/** 员工多身份进阶配置详情 */
export function getStaffAdvancedDetail(id: number) {
	return request({
		url: `/api/v1.enterprise.Staff/advancedDetail?id=${id}`,
		method: "GET"
	});
}

export type GetStaffAdvancedCandidatesParams = {
	staff_id: number;
	/** member：可关联的普通员工；leader：可选择的小组长 */
	type: "member" | "leader";
	keyword?: string;
};

/** 只返回符合在职、身份与归属约束的候选项 */
export function getStaffAdvancedCandidates(params: GetStaffAdvancedCandidatesParams) {
	const query: string[] = [
		`staff_id=${params.staff_id}`,
		`type=${params.type}`
	];
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Staff/advancedCandidates?${query.join("&")}`,
		method: "GET"
	});
}

export type SaveStaffAdvancedConfigParams = {
	id: number;
	advanced_enabled: boolean;
	role: StaffAdvancedRole;
	leader_staff_id: number;
	personal_commission_rate: number;
	team_commission_rate: number;
	can_view_subordinate_data: boolean;
	/** role=leader 时为提交后完整有效组员集合 */
	member_ids: number[];
};

/** 保存后立即生效；服务端必须同时写入配置版本供新订单快照使用 */
export function saveStaffAdvancedConfig(params: SaveStaffAdvancedConfigParams) {
	return requestJson({
		url: "/api/v1.enterprise.Staff/advancedConfig",
		method: "POST",
		data: {
			id: params.id,
			advanced_enabled: params.advanced_enabled ? 1 : 0,
			role: params.role,
			leader_staff_id: params.leader_staff_id,
			personal_commission_rate: params.personal_commission_rate,
			team_commission_rate: params.team_commission_rate,
			can_view_subordinate_data: params.can_view_subordinate_data ? 1 : 0,
			member_ids: params.member_ids
		}
	});
}

export type SaveStaffConfigParams = {
	id: number;
	/** 员工状态 / 管理权限：0 离职，1 在职 */
	status: number;
	can_view_revenue: boolean;
	/** 分佣比例，如 20 */
	commission_rate: number;
	/** 员工姓名旁的自定义角色标签；不改变真实角色 */
	role_label_name?: string;
	/** 员工侧字节任务台入口；不传时保持原配置 */
	can_byte_task?: number;
};

export type GetStaffProjectListParams = {
	id: number;
	category_id?: string | number;
	type?: string | number;
	keyword?: string;
	page?: number;
	limit?: number;
};

/** 员工项目列表 GET /api/v1.enterprise.Staff/projectList */
export function getStaffProjectList(params: GetStaffProjectListParams) {
	const page = params.page ?? 1;
	const limit = params.limit ?? 15;
	const query: string[] = [`id=${params.id}`, `page=${page}`, `limit=${limit}`];
	if (params.category_id != null && `${params.category_id}` != "") {
		query.push(`category_id=${params.category_id}`);
	}
	if (params.type != null && `${params.type}` != "") {
		query.push(`type=${params.type}`);
	}
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.Staff/projectList?${query.join("&")}`,
		method: "GET"
	});
}

export type SaveStaffProjectConfigParams = {
	id: number;
	/** 已关闭（禁用）的项目 ID 列表 */
	disabled_project_ids: number[];
};

/** 员工项目权限配置 POST /api/v1.enterprise.Staff/projectConfig */
export function saveStaffProjectConfig(params: SaveStaffProjectConfigParams) {
	return requestJson({
		url: "/api/v1.enterprise.Staff/projectConfig",
		method: "POST",
		data: {
			id: params.id,
			disabled_project_ids: params.disabled_project_ids
		}
	});
}

/**
 * 员工配置 POST /api/v1.enterprise.Staff/config
 *
 * status 从 1 变为 0 时，服务端需在同一事务内完成：
 * 1. 不因员工存在待提现金额拒绝离职；
 * 2. 员工钱包写入负数“离职回收”流水并清零待提现金额；
 * 3. 企业主钱包写入等额正数流水并累计离职员工回收金额。
 */
export function saveStaffConfig(params: SaveStaffConfigParams) {
	const data: UTSJSONObject = {
		id: params.id,
		status: params.status,
		can_view_revenue: params.can_view_revenue ? 1 : 0,
		commission_rate: params.commission_rate,
		role_label_name: params.role_label_name ?? ""
	};
	if (params.can_byte_task != null) {
		data["can_byte_task"] = params.can_byte_task;
	}
	return requestJson({
		url: "/api/v1.enterprise.Staff/config",
		method: "POST",
		data
	});
}

export type UnbindStaffGroupMembersParams = {
	/** 小组长对应的员工记录 ID */
	leader_staff_id: number;
	/** 要解除关联的组员员工记录 ID，支持单条或多条 */
	member_ids: number[];
};

/** 小组长解除组员关联 POST /api/v1.enterprise.Staff/unbindGroupMembers */
export function unbindStaffGroupMembers(params: UnbindStaffGroupMembersParams) {
	return requestJson({
		url: "/api/v1.enterprise.Staff/unbindGroupMembers",
		method: "POST",
		data: {
			leader_staff_id: params.leader_staff_id,
			member_ids: params.member_ids
		}
	});
}

/** 提现权限分组 Tab（未分组 + 组长）GET /api/v1.enterprise.staff/withdrawPermissionGroups */
export function getStaffWithdrawPermissionGroups() {
	return request({
		url: "/api/v1.enterprise.staff/withdrawPermissionGroups",
		method: "GET"
	});
}

export type GetStaffWithdrawPermissionListParams = {
	/** 0=未分组; >0=某组长 */
	leader_user_id?: number;
	/** 可选，昵称/手机/编号 */
	keyword?: string;
	page?: number;
	limit?: number;
};

/** 提现权限员工列表（按分组查）GET /api/v1.enterprise.staff/withdrawPermissionList */
export function getStaffWithdrawPermissionList(params: GetStaffWithdrawPermissionListParams = {}) {
	const query: string[] = [];
	const leaderUserId = params.leader_user_id ?? 0;
	const page = params.page ?? 1;
	const limit = params.limit ?? 20;
	query.push(`leader_user_id=${leaderUserId}`);
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.staff/withdrawPermissionList?${query.join("&")}`,
		method: "GET"
	});
}

export type SaveStaffWithdrawPermissionParams = {
	/** 成员表 id 列表（单个开关传 1 个，一键传当前组全部） */
	ids: number[];
	/** 0 关闭提现，1 开启提现 */
	can_withdraw: number;
};

/** 批量开关提现权限 POST /api/v1.enterprise.staff/withdrawPermissionSave */
export function saveStaffWithdrawPermission(params: SaveStaffWithdrawPermissionParams) {
	return requestJson({
		url: "/api/v1.enterprise.staff/withdrawPermissionSave",
		method: "POST",
		data: {
			ids: params.ids,
			can_withdraw: params.can_withdraw
		}
	});
}

export type SaveStaffByteTaskPermissionParams = {
	/** 企业员工关系 ID 列表 */
	ids: number[];
	/** 是否展示员工侧「字节任务台」入口：0 关闭，1 开启 */
	can_byte_task: number;
};

/** 批量设置员工字节任务台入口 */
export function saveStaffByteTaskPermission(params: SaveStaffByteTaskPermissionParams) {
	return requestJson({
		url: "/api/v1.enterprise.staff/byteTaskPermissionSave",
		method: "POST",
		data: { ids: params.ids, can_byte_task: params.can_byte_task }
	});
}

export type SaveStaffQuickPromptPermissionParams = {
	/** 企业员工关系 ID 列表 */
	ids: number[];
	/** 是否展示员工侧「快捷提词」入口：0 关闭，1 开启 */
	can_quick_prompt: number;
	/** 开启快捷提词时，是否同时为缺少字节项目权限的员工开放字节项目 */
	enable_byte_projects?: number;
};

/**
 * 批量设置员工快捷提词入口。
 * 开启时服务端需校验员工是否已有可见字节项目；enable_byte_projects=1 时原子补开字节项目权限。
 */
export function saveStaffQuickPromptPermission(params: SaveStaffQuickPromptPermissionParams) {
	return requestJson({
		url: "/api/v1.enterprise.staff/quickPromptPermissionSave",
		method: "POST",
		data: {
			ids: params.ids,
			can_quick_prompt: params.can_quick_prompt,
			enable_byte_projects: params.enable_byte_projects ?? 0
		}
	});
}

export type GetStaffByteBindingListParams = {
	page?: number;
	limit?: number;
	bind_status?: number;
	keyword?: string;
};

/** 企业主查看员工字节绑定状态 */
export function getStaffByteBindingList(params: GetStaffByteBindingListParams = {}) {
	const query: string[] = [];
	query.push(`page=${params.page ?? 1}`);
	query.push(`limit=${params.limit ?? 10}`);
	if (params.bind_status != null) query.push(`bind_status=${params.bind_status}`);
	if (params.keyword != null && params.keyword.trim() != "") {
		query.push(`keyword=${encodeURIComponent(params.keyword.trim())}`);
	}
	return request({
		url: `/api/v1.enterprise.staff/byteBindingList?${query.join("&")}`,
		method: "GET"
	});
}

/** 员工侧字节任务台信息 */
export function getStaffByteTaskInfo() {
	return request({ url: "/api/v1.enterprise.staff/byteTaskInfo", method: "GET" });
}

export type SubmitStaffByteBindingParams = {
	byte_uid: string;
	mobile: string;
	screenshot_1: string;
	screenshot_2: string;
};

/** 员工提交字节 UID 绑定申请 */
export function submitStaffByteBinding(params: SubmitStaffByteBindingParams) {
	return requestJson({
		url: "/api/v1.enterprise.staff/byteBindingApply",
		method: "POST",
		data: params
	});
}
