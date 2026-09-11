/** GET /api/mine → data.profile */
export type MineProfile = {
	enterprise_id?: number;
	name?: string;
	logo?: string;
	enterprise_code?: string;
	[key: string]: any;
};

/** GET /api/mine → data.revenue_card */
export type MineRevenueCard = {
	title?: string;
	/** 企业累计收益总值，已包含离职员工余额回收金额。 */
	revenue?: string;
	pending_settlement?: string;
	online_revenue?: string | number;
	offline_revenue?: string | number;
	online_income?: string | number;
	offline_income?: string | number;
	staff_normal?: number;
	staff_count?: number;
	keyword_count?: number;
	/** 已离职员工待提现收益的累计回收金额 */
	resigned_staff_recovery_amount?: string | number;
	former_staff_recovery_amount?: string | number;
	departure_recovery_amount?: string | number;
	[key: string]: any;
};

/** GET /api/mine → data.shortcuts[] */
export type MineShortcut = {
	key?: string;
	icon?: string;
	title?: string;
	subtitle?: string;
	path?: string;
	[key: string]: any;
};

/** GET /api/mine 响应 data */
export type MinePageData = {
	profile?: MineProfile;
	revenue_card?: MineRevenueCard;
	shortcuts?: MineShortcut[];
	[key: string]: any;
};

/** 企业主侧离职员工余额回收正向流水。 */
export type DepartureRecoveryRecordItem = {
	id?: string | number;
	staff_id?: number;
	user_id?: number;
	staff_name?: string;
	employee_name?: string;
	nickname?: string;
	avatar?: string;
	recovery_amount?: string | number;
	amount?: string | number;
	flow_no?: string;
	recovery_pair_no?: string;
	recovered_at?: string;
	create_time?: string;
	departure_time?: string;
	status_text?: string;
	[key: string]: any;
};
