/** 员工统计（GET /api/staff/list → list[].stats） */
export type StaffStats = {
	promo_account_count?: number;
	total_backfill_count?: number;
	promo_revenue?: string;
	staff_revenue?: string;
	enterprise_revenue?: string;
	commission_rate?: string;
	promo_account_count_today?: number;
	total_backfill_count_today?: number;
	promo_revenue_today?: string;
	staff_revenue_today?: string;
	enterprise_revenue_today?: string;
	total_revenue?: string;
	pending_settlement?: string;
	/** 员工钱包中尚未提现的金额；离职时由服务端原子回收 */
	pending_withdrawal_amount?: string | number;
	settled_revenue?: string;
	settled_settlement?: string;
	today_revenue?: string;
	revenue_today?: string;
	/** 累计做单量 */
	order_count?: number | string;
	complete_count?: number | string;
	/** 累计个人收益 */
	personal_revenue?: string | number;
	[key: string]: any;
};

/** 员工列表项 */
export type StaffListItem = {
	id?: number;
	user_id?: number;
	sn?: string;
	nickname?: string;
	mobile?: string;
	avatar?: string;
	role?: string;
	role_text?: string;
	staff_role?: string | number;
	staff_role_text?: string;
	staff_type?: string | number;
	staff_type_text?: string;
	/** 企业主自定义的员工姓名旁角色标签，仅用于展示 */
	role_label_name?: string;
	custom_role_label?: string;
	role_display_name?: string;
	status?: number;
	status_text?: string;
	can_manage?: number;
	can_view_revenue?: number;
	/** 是否可查看组员详情（企业主授权） */
	can_view_detail?: number;
	/** 是否展示员工侧「字节任务台」入口 */
	can_byte_task?: number;
	byte_task_enabled?: number;
	/** 是否已有可见字节项目，用于开启快捷提词前置校验 */
	byte_project_enabled?: number | boolean;
	has_byte_project?: number | boolean;
	/** 是否展示员工侧快捷提词入口，默认关闭 */
	can_quick_prompt?: number | boolean;
	quick_prompt_enabled?: number | boolean;
	commission_rate?: string | number;
	stats?: StaffStats;
	join_time?: string;
	create_time?: string;
	update_time?: string;
	/** 小组长当前关联的组员；接口可返回其中任一字段 */
	members?: StaffGroupMemberItem[];
	member_list?: StaffGroupMemberItem[];
	group_members?: StaffGroupMemberItem[];
	/** 当前员工所属小组信息 */
	group_name?: string;
	group_nickname?: string;
	team_name?: string;
	/** 组员所关联的小组长名称 */
	leader_name?: string;
	leader_nickname?: string;
	group_leader_name?: string;
	/** 企业是否开启“关联组员订单” */
	related_team_order_enabled?: number | boolean;
	show_related_team_orders?: number | boolean;
	team_order_enabled?: number | boolean;
	can_view_team_performance?: number | boolean;
	[key: string]: any;
};

export type StaffGroupMemberItem = {
	id?: number;
	staff_id?: number;
	user_id?: number;
	nickname?: string;
	mobile?: string;
	sn?: string;
	status?: number;
	status_text?: string;
	/** 当前待提现金额，员工转离职前用于二次确认展示 */
	pending_withdrawal_amount?: string | number;
	pending_withdraw_amount?: string | number;
	wallet_withdrawable?: string | number;
	withdrawable_amount?: string | number;
	withdrawable?: string | number;
	wait_withdraw_amount?: string | number;
	[key: string]: any;
};

export type StaffAdvancedRole = "normal" | "leader" | "member";

/** 企业主侧员工多身份进阶配置详情 */
export type StaffAdvancedDetail = {
	id?: number;
	user_id?: number;
	nickname?: string;
	avatar?: string;
	sn?: string;
	status?: number;
	status_text?: string;
	advanced_enabled?: number | boolean;
	role?: StaffAdvancedRole | string;
	role_text?: string;
	personal_commission_rate?: number | string;
	team_commission_rate?: number | string;
	can_view_subordinate_data?: number | boolean;
	leader_staff_id?: number;
	leader_nickname?: string;
	leader_personal_commission_rate?: number | string;
	group_members?: StaffGroupMemberItem[];
	member_list?: StaffGroupMemberItem[];
	members?: StaffGroupMemberItem[];
	[key: string]: any;
};

/** 进阶管理可绑定候选员工/小组长 */
export type StaffAdvancedCandidate = {
	id?: number;
	user_id?: number;
	nickname?: string;
	avatar?: string;
	sn?: string;
	status?: number;
	role?: StaffAdvancedRole | string;
	personal_commission_rate?: number | string;
	leader_staff_id?: number;
	[key: string]: any;
};

/** GET /api/staff → data.revenue_card（收益页顶部汇总） */
export type StaffRevenueCard = {
	title?: string;
	revenue?: string;
	pending_settlement?: string;
	staff_normal?: number;
	staff_count?: number;
	keyword_count?: number;
	[key: string]: any;
};

export type StaffListData = {
	list?: StaffListItem[];
	count?: number;
	page?: number;
	limit?: number;
	revenue_card?: StaffRevenueCard;
	summary?: StaffStats;
	is_virtual?: number;
	/** 组员总数 */
	member_count?: number;
	staff_count?: number;
	/** 本月团队完成量 */
	month_complete_count?: number | string;
	month_team_complete?: number | string;
	/** 累计团队贡献收益 */
	team_contribution_revenue?: string | number;
	team_revenue?: string | number;
	/** 当前员工角色与团队订单开关 */
	staff_role?: string | number;
	staff_role_text?: string;
	related_team_order_enabled?: number | boolean;
	show_related_team_orders?: number | boolean;
	team_order_enabled?: number | boolean;
	can_view_team_performance?: number | boolean;
	/** 组长收益页团队业绩统计 */
	related_member_count?: number | string;
	group_member_count?: number | string;
	team_order_revenue?: string | number;
	group_order_revenue?: string | number;
	team_commission_revenue?: string | number;
	group_commission_revenue?: string | number;
	[key: string]: any;
};

export type StaffListEnvelope = {
	code?: number;
	msg?: string;
	data?: StaffListData | StaffListItem[];
};

/** 员工项目列表项 GET /api/staff/project/list */
export type StaffProjectItem = {
	id?: number;
	title?: string;
	logo?: string;
	status?: number;
	[key: string]: any;
};

export type StaffProjectListData = {
	list?: StaffProjectItem[];
	count?: number;
	page?: number;
	limit?: number;
	[key: string]: any;
};

/**
 * 提现权限分组 Tab 项
 * GET /api/v1.enterprise.staff/withdrawPermissionGroups → data.groups[]
 * 直接使用接口字段：name / leader_user_id / count
 */
export type StaffWithdrawPermissionGroupItem = {
	name?: string;
	leader_user_id?: number;
	count?: number;
	[key: string]: any;
};

export type StaffWithdrawPermissionGroupsData = {
	groups?: StaffWithdrawPermissionGroupItem[];
	[key: string]: any;
};

/**
 * 提现权限员工列表项
 * GET /api/v1.enterprise.staff/withdrawPermissionList → data.list[]
 * 直接使用接口返回字段展示
 */
export type StaffWithdrawPermissionItem = {
	id?: number;
	staff_id?: number;
	user_id?: number;
	nickname?: string;
	relation?: string;
	/** 是否可提现：0 关闭，1 开启 */
	can_withdraw?: number;
	[key: string]: any;
};

export type StaffWithdrawPermissionListData = {
	list?: StaffWithdrawPermissionItem[];
	count?: number;
	page?: number;
	limit?: number;
	[key: string]: any;
};

/** 企业主侧员工字节绑定记录 */
export type StaffByteBindingItem = {
	id?: number;
	staff_id?: number;
	user_id?: number;
	sn?: string;
	nickname?: string;
	mobile?: string;
	avatar?: string;
	is_bound?: number | boolean;
	bind_status?: number | boolean;
	byte_uid?: string;
	audit_status?: number;
	audit_status_text?: string;
	reject_reason?: string;
	fail_reason?: string;
	submit_time?: string;
	create_time?: string;
	[key: string]: any;
};

export type StaffByteBindingListData = {
	list?: StaffByteBindingItem[];
	count?: number;
	page?: number;
	limit?: number;
	bound_count?: number;
	unbound_count?: number;
	[key: string]: any;
};

/** 员工侧字节任务台详情 */
export type StaffByteTaskInfo = {
	can_byte_task?: number | boolean;
	byte_task_enabled?: number | boolean;
	exclusive_link?: string;
	organization_link?: string;
	byte_uid?: string;
	mobile?: string;
	screenshot_1?: string;
	screenshot_2?: string;
	audit_status?: number;
	audit_status_text?: string;
	reject_reason?: string;
	fail_reason?: string;
	[key: string]: any;
};
