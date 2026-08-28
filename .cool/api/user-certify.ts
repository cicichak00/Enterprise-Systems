import { requestJson } from "../service/core";
import type {
	UserCertifyQueryVerifyParams,
	UserCertifySubmitParams,
	UserCertifyTypeInfoParams
} from "../types/user-certify";

/** 认证类型状态 POST /api/v1.enterprise.userCertify/getTypeInfo */
export function getUserCertifyTypeInfo(params: UserCertifyTypeInfoParams = {}) {
	const data = {
		type: params.type ?? -1,
		bind_scope: params.bind_scope ?? 1
	} as UTSJSONObject;
	if (params.certify_id != null && params.certify_id > 0) {
		data["certify_id"] = params.certify_id;
	}
	if (params.for_edit != null) {
		data["for_edit"] = params.for_edit;
	}
	return requestJson({
		url: "/api/v1.enterprise.userCertify/getTypeInfo",
		method: "POST",
		data
	});
}

/** 查询/同步实名状态 POST /api/v1.enterprise.userCertify/queryVerify */
export function queryUserCertifyVerify(params: UserCertifyQueryVerifyParams = {}) {
	const data = {
		bind_scope: params.bind_scope ?? 1,
		force_sync: params.force_sync ?? 0
	} as UTSJSONObject;
	if (params.certify_id != null && params.certify_id > 0) {
		data["certify_id"] = params.certify_id;
	}
	return requestJson({
		url: "/api/v1.enterprise.userCertify/queryVerify",
		method: "POST",
		data
	});
}

/** 提交个人实名 POST /api/v1.enterprise.userCertify/submit */
export function submitUserCertify(params: UserCertifySubmitParams) {
	return requestJson({
		url: "/api/v1.enterprise.userCertify/submit",
		method: "POST",
		data: {
			certify_type: params.certify_type,
			name: params.name,
			contact_mobile: params.contact_mobile,
			idNo: params.idNo,
			address: params.address,
			facePhoto: params.facePhoto,
			idCardFront: params.idCardFront,
			idCardBack: params.idCardBack,
			bind_scope: params.bind_scope ?? 1,
			certify_id: params.certify_id ?? 0
		}
	});
}
