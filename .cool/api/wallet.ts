import { request, requestJson } from "../service/core";
import type {
	StaffBankAddParams,
	StaffBankDeleteParams,
	StaffBankListParams,
	StaffBankOptionParams,
	StaffWithdrawApplyParams,
	StaffWithdrawRecordsParams,
	StaffWithdrawTaxParams,
	WalletBankCardAddParams,
	WalletTransactionListParams,
	WalletWithdrawalApplyParams,
	WalletWithdrawalListParams,
	WalletWithdrawalPasswordParams
} from "../types/wallet";

/** 钱包概览 GET /api/v1.enterprise.Wallet/overview */
export function getWallet() {
	return request({
		url: "/api/v1.enterprise.Wallet/overview",
		method: "GET"
	});
}

/** 员工提现钱包概览 GET /api/v1.enterprise.staffWithdraw/wallet */
export function getStaffWithdrawWallet() {
	return request({
		url: "/api/v1.enterprise.staffWithdraw/wallet",
		method: "GET"
	});
}

/** 交易记录 GET /api/v1.enterprise.Wallet/transactionList */
export function getWalletTransactionList(params: WalletTransactionListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 10;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.direction != null && `${params.direction}` != "") {
		query.push(`direction=${params.direction}`);
	}
	if (params.status != null && `${params.status}` != "") {
		query.push(`status=${params.status}`);
	}
	if (params.start_date != null && params.start_date != "") {
		query.push(`start_date=${params.start_date}`);
	}
	if (params.end_date != null && params.end_date != "") {
		query.push(`end_date=${params.end_date}`);
	}
	return request({
		url: `/api/v1.enterprise.Wallet/transactionList?${query.join("&")}`,
		method: "GET"
	});
}

/** 交易详情 GET /api/v1.enterprise.Wallet/transactionDetail */
export function getWalletTransactionDetail(id: string | number) {
	return request({
		url: `/api/v1.enterprise.Wallet/transactionDetail?id=${id}`,
		method: "GET"
	});
}

/** 银行卡列表 GET /api/v1.enterprise.Wallet/bankCardList */
export function getWalletBankCardList() {
	return request({
		url: "/api/v1.enterprise.Wallet/bankCardList",
		method: "GET"
	});
}

/** 员工银行卡列表 GET /api/v1.enterprise.staffBank/lists */
export function getStaffBankLists(params: StaffBankListParams = {}) {
	const pageNo = params.page_no ?? 1;
	const pageSize = params.page_size ?? 15;
	return request({
		url: `/api/v1.enterprise.staffBank/lists?page_no=${pageNo}&page_size=${pageSize}`,
		method: "GET"
	});
}

/** 绑定银行卡 POST /api/v1.enterprise.staffBank/add */
export function addStaffBank(params: StaffBankAddParams) {
	const data = {
		type: params.type,
		bank_no: params.bank_no,
		mobile: params.mobile
	} as UTSJSONObject;
	if (params.bank_name != null && params.bank_name != "") {
		data["bank_name"] = params.bank_name;
	}
	if (params.certify_id != null && params.certify_id > 0) {
		data["certify_id"] = params.certify_id;
	}
	return requestJson({
		url: "/api/v1.enterprise.staffBank/add",
		method: "POST",
		data
	});
}

/** 删除银行卡 POST /api/v1.enterprise.staffBank/delete */
export function deleteStaffBank(params: StaffBankDeleteParams) {
	return requestJson({
		url: "/api/v1.enterprise.staffBank/delete",
		method: "POST",
		data: {
			id: params.id
		}
	});
}

/** 开户银行列表 GET /api/v1.enterprise.staffBank/bankList */
export function getStaffBankOptionList(params: StaffBankOptionParams = {}) {
	const platformId = params.platform_id ?? 0;
	return request({
		url: `/api/v1.enterprise.staffBank/bankList?platform_id=${platformId}`,
		method: "GET"
	});
}

/** 添加银行卡 POST /api/v1.enterprise.Wallet/bankCardAdd */
export function addWalletBankCard(params: WalletBankCardAddParams) {
	return requestJson({
		url: "/api/v1.enterprise.Wallet/bankCardAdd",
		method: "POST",
		data: params
	});
}

/** 删除银行卡 POST /api/v1.enterprise.Wallet/bankCardRemove?id= */
export function removeWalletBankCard(id: string | number, params: WalletBankCardAddParams) {
	return requestJson({
		url: `/api/v1.enterprise.Wallet/bankCardRemove?id=${id}`,
		method: "POST",
		data: params
	});
}

/** 设置/修改提现密码 POST /api/v1.enterprise.staffWithdraw/setWithdrawPassword */
export function setWalletWithdrawalPassword(params: WalletWithdrawalPasswordParams) {
	const data = {
		password: params.password
	} as UTSJSONObject;
	const oldPassword = params.old_password ?? "";
	if (oldPassword != "") {
		data["old_password"] = oldPassword;
	}
	return requestJson({
		url: "/api/v1.enterprise.staffWithdraw/setWithdrawPassword",
		method: "POST",
		data: data
	});
}

/** 扣税预算 POST /api/v1.enterprise.staffWithdraw/calculateTax */
export function calculateStaffWithdrawTax(params: StaffWithdrawTaxParams) {
	return requestJson({
		url: "/api/v1.enterprise.staffWithdraw/calculateTax",
		method: "POST",
		data: {
			money: `${params.money}`,
			bank_id: params.bank_id
		}
	});
}

/** 提现申请 POST /api/v1.enterprise.staffWithdraw/withdrawApply */
export function applyStaffWithdraw(params: StaffWithdrawApplyParams) {
	return requestJson({
		url: "/api/v1.enterprise.staffWithdraw/withdrawApply",
		method: "POST",
		data: {
			amount: params.amount,
			bank_id: params.bank_id,
			password: params.password
		}
	});
}

/** 提现申请（旧） POST /api/v1.enterprise.Wallet/withdrawalApply */
export function applyWalletWithdrawal(params: WalletWithdrawalApplyParams) {
	return requestJson({
		url: "/api/v1.enterprise.Wallet/withdrawalApply",
		method: "POST",
		data: params
	});
}

/** 员工提现记录 GET /api/v1.enterprise.staffWithdraw/withdrawRecords */
export function getStaffWithdrawRecords(params: StaffWithdrawRecordsParams = {}) {
	const page = params.page ?? 1;
	const limit = params.limit ?? 20;
	const query: string[] = [`page=${page}`, `limit=${limit}`];
	if (params.status != null && `${params.status}` != "") {
		query.push(`status=${params.status}`);
	}
	return request({
		url: `/api/v1.enterprise.staffWithdraw/withdrawRecords?${query.join("&")}`,
		method: "GET"
	});
}

/** 提现记录 GET /api/v1.enterprise.Wallet/withdrawalList */
export function getWalletWithdrawalList(params: WalletWithdrawalListParams = {}) {
	const query: string[] = [];
	const page = params.page ?? 1;
	const limit = params.limit ?? 15;
	query.push(`page=${page}`);
	query.push(`limit=${limit}`);
	if (params.status != null && `${params.status}` != "") {
		query.push(`status=${params.status}`);
	}
	return request({
		url: `/api/v1.enterprise.Wallet/withdrawalList?${query.join("&")}`,
		method: "GET"
	});
}

/** 提现详情 GET /api/v1.enterprise.Wallet/withdrawalDetail */
export function getWalletWithdrawalDetail(id: string | number) {
	return request({
		url: `/api/v1.enterprise.Wallet/withdrawalDetail?id=${id}`,
		method: "GET"
	});
}

/** 取消提现 POST /api/v1.enterprise.Wallet/withdrawalCancel?id= */
export function cancelWalletWithdrawal(id: string | number, params: WalletWithdrawalApplyParams) {
	return requestJson({
		url: `/api/v1.enterprise.Wallet/withdrawalCancel?id=${id}`,
		method: "POST",
		data: params
	});
}
