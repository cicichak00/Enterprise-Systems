import { request } from "../service/core";

const FORM_URLENCODED = "application/x-www-form-urlencoded";

export type OAuthAuthorizeParams = {
	client_id: string;
	client_user_id?: string;
	sign?: string;
	state?: string;
	mobile?: string;
};

/** OAuth 授权预检 GET /api/v1.enterprise.Oauth/authorize */
export function getOAuthAuthorize(params: OAuthAuthorizeParams) {
	return request({
		url: "/api/v1.enterprise.Oauth/authorize",
		method: "GET",
		data: {
			client_id: params.client_id,
			client_user_id: params.client_user_id ?? "",
			sign: params.sign ?? "",
			state: params.state ?? "",
			mobile: params.mobile ?? ""
		}
	});
}

export type OAuthConfirmParams = {
	client_id: string;
	code: string;
	state?: string;
	mobile?: string;
};

/** 授权登录并生成工作台 POST /api/v1.enterprise.Oauth/confirmAuth */
export function confirmOAuthAuthorize(params: OAuthConfirmParams) {
	return request({
		url: "/api/v1.enterprise.Oauth/confirmAuth",
		method: "POST",
		data: {
			client_id: params.client_id,
			code: params.code,
			state: params.state ?? "",
			mobile: params.mobile ?? ""
		},
		header: {
			"Content-Type": FORM_URLENCODED
		}
	});
}
