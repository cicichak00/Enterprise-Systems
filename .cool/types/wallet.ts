export type WalletInfo = {
	balance: string;
	/** 可提现金额（有则优先于 balance） */
	withdrawable?: string;
	pending_settlement: string;
	total_income: string;
	total_withdrawal: string;
	has_withdrawal_password: boolean;
	has_withdraw_password?: boolean | number;
};

export type WalletBankCard = {
	id?: number;
	bank_name?: string;
	bank_code?: string;
	account_name?: string;
	card_no_mask?: string;
	branch_name?: string;
	is_default?: number | boolean;
	status?: number;
	create_time?: string;
};

export type WalletTransaction = {
	id: number;
	transaction_no: string;
	direction: number;
	direction_text: string;
	biz_type: string;
	biz_type_text: string;
	title: string;
	amount: string;
	amount_signed: string;
	remark: string;
	status: number;
	status_text: string;
	create_time: string;
	finish_time?: string;
	/** 离职回收关联的员工记录，企业主为正向、员工为负向流水 */
	related_staff_id?: number;
	recovery_pair_no?: string;
};

export type WalletData = {
	notice: string;
	wallet: WalletInfo;
	default_bank_card: WalletBankCard | null;
	month_transaction_count: number;
	transactions: WalletTransaction[];
};

export type WalletTransactionListParams = {
	direction?: string;
	status?: string;
	start_date?: string;
	end_date?: string;
	page?: number;
	limit?: number;
};

export type WalletRelatedUser = {
	id?: number;
	nickname?: string;
	sn?: string;
};

export type WalletBankCardAddParams = {
	bank_name: string;
	account_name: string;
	card_no: string;
	branch_name: string;
};

/** 员工银行卡列表 GET /api/v1.enterprise.staffBank/lists */
export type StaffBankListParams = {
	page_no?: number;
	page_size?: number;
};

/** 绑定银行卡 POST /api/v1.enterprise.staffBank/add */
export type StaffBankAddParams = {
	/** 0支付宝 1银行卡 */
	type: number;
	bank_no: string;
	bank_name?: string;
	mobile: string;
	certify_id?: number;
};

/** 删除银行卡 POST /api/v1.enterprise.staffBank/delete */
export type StaffBankDeleteParams = {
	/** 收款账户 id 数组，最多 10 个 */
	id: number[];
};

/** 开户银行列表 GET /api/v1.enterprise.staffBank/bankList */
export type StaffBankOptionParams = {
	platform_id?: number;
};

/** bankList 项（按接口原字段使用） */
export type StaffBankOptionItem = {
	id?: number | string;
	title?: string;
	icon?: string;
	subtitle?: string;
	category?: string;
	platform_id?: number | string;
	[key: string]: any;
};

/** staffBank/lists 列表项（按接口原字段使用，不做别名映射） */
export type StaffBankListItem = {
	id?: number | string;
	bank?: string;
	bank_ico?: string;
	bank_no?: string;
	name?: string;
	/** 0=不可选/异常 */
	status?: number | string;
	status_txt?: string;
	is_invalid?: number | string;
	remarks?: string;
	status_tip?: string;
	remark?: string;
	[key: string]: any;
};

export type WalletWithdrawalApplyParams = {
	amount: string;
	bank_card_id: string;
	withdrawal_password: string;
	remark?: string;
};

/** 员工提现申请 POST /api/v1.enterprise.staffWithdraw/withdrawApply */
export type StaffWithdrawApplyParams = {
	amount: number;
	bank_id: number | string;
	password: string;
};

/** 扣税预算 POST /api/v1.enterprise.staffWithdraw/calculateTax */
export type StaffWithdrawTaxParams = {
	money: string;
	bank_id: number | string;
};

export type StaffWithdrawTaxDetail = {
	user_personal_tax?: number | string;
	user_value_added_tax?: number | string;
	user_additional_tax?: number | string;
	user_recover_tax_amount?: number | string;
	[key: string]: any;
};

export type StaffWithdrawTaxData = {
	/** 到账金额 */
	actual_amount?: number | string;
	/** 预估扣税 */
	tax_amount?: number | string;
	tax_result_json?: string;
	pay?: number | string;
	after_tax_amount?: number | string;
	tax?: number | string;
	tax_detail?: StaffWithdrawTaxDetail | null;
	[key: string]: any;
};

export type WalletWithdrawalPasswordParams = {
	password: string;
	old_password?: string;
};

export type WalletWithdrawalListParams = {
	status?: string;
	page?: number;
	limit?: number;
};

/** 员工提现记录 GET /api/v1.enterprise.staffWithdraw/withdrawRecords */
export type StaffWithdrawRecordsParams = {
	page?: number;
	limit?: number;
	/** 可选：1打款中 2已打款 3打款失败 */
	status?: number | string;
};

export type StaffWithdrawRecordItem = {
	id?: number | string;
	bank?: string;
	bank_name?: string;
	bank_no?: string;
	bank_no_masked?: string;
	bank_ico?: string;
	amount?: number | string;
	actual_amount?: number | string;
	tax_amount?: number | string;
	withdraw_no?: string;
	create_time?: string;
	pay_time?: string;
	reject_time?: string;
	fail_reason?: string;
	status?: number | string;
	status_label?: string;
	status_txt?: string;
	[key: string]: any;
};

export type WalletTransactionDetail = WalletTransaction & {
	related_user_id?: number;
	related_user?: WalletRelatedUser | null;
	bank_card_id?: number;
	bank_name?: string;
	card_no_mask?: string;
	related_member_id?: number;
	update_time?: string;
};
