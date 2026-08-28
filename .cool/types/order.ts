/** GET /api/order Query：period 枚举 */
export type OrderListPeriod =
	| "total"
	| "today"
	| "yesterday"
	| "last_7_days"
	| "last_30_days"
	| "custom";

export type OrderListParams = {
	project_id?: string;
	keyword?: string;
	user_id?: string;
	page?: number;
	limit?: number;
	period?: OrderListPeriod | string;
	/** period=custom 时必填 */
	start_date?: string;
	end_date?: string;
};

/** GET /api/order 返回的 data.summary */
export type OrderSummary = {
	promo_revenue?: string | number;
	staff_revenue?: string | number;
	enterprise_revenue?: string | number;
	staff_count?: string | number;
	keyword_count?: string | number;
	backfill_count?: string | number;
	/** 新版总览按员工类型拆分的明细统计 */
	role_stats?: OrderRoleSummaryItem[];
	staff_role_stats?: OrderRoleSummaryItem[];
	detail_stats?: OrderRoleSummaryItem[];
	/** 员工侧：组长关联组员团队业绩 */
	related_member_count?: string | number;
	group_member_count?: string | number;
	team_order_revenue?: string | number;
	group_order_revenue?: string | number;
	team_commission_revenue?: string | number;
	group_commission_revenue?: string | number;
};

export type OrderRoleSummaryItem = {
	role?: string | number;
	role_key?: string;
	role_name?: string;
	staff_type?: string | number;
	staff_type_text?: string;
	member_count?: string | number;
	staff_count?: string | number;
	staff_revenue?: string | number;
	keyword_count?: string | number;
	backfill_count?: string | number;
	[key: string]: any;
};

/** GET /api/order 返回的 data.list 单项 */
export type OrderListItem = {
	id?: number | string;
	user_nickname?: string;
	user_sn?: string;
	user_id?: string | number;
	project_title?: string;
	enterprise_profit?: string | number;
	share_profit?: string | number;
	user_profit?: string | number;
	user_rate?: string | number;
	keyword?: string;
	remark?: string;
	is_virtual?: number;
	payment_time?: string;
	import_time?: string;
	audit_time?: string;
	payment_status_text?: string;
	status?: number;
	staff_role?: string | number;
	staff_role_text?: string;
	staff_type?: string | number;
	staff_type_text?: string;
	employment_status_text?: string;
	user_status_text?: string;
	/** 拉取订单时查询并固化的员工在职状态：0 离职、1 在职 */
	employment_status?: number;
	employment_status_snapshot?: number;
	group_name?: string;
	group_nickname?: string;
	team_name?: string;
	staff_group_name?: string;
	/** 创建订单时固化的身份、归属和分佣快照 */
	staff_role_snapshot?: string;
	leader_staff_id_snapshot?: number;
	leader_nickname_snapshot?: string;
	personal_commission_rate_snapshot?: string | number;
	team_commission_rate_snapshot?: string | number;
	is_virtual_incentive_snapshot?: number;
	[key: string]: any;
};

/** GET /api/order 返回的 data */
export type OrderListPayload = {
	list?: OrderListItem[];
	summary?: OrderSummary;
	count?: number;
	[key: string]: any;
};
