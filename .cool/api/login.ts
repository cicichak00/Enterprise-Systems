import { request, requestJson } from "../service/core";
import { getDeviceId, getDeviceName, getLoginTerminal } from "../utils/terminal";

const FORM_URLENCODED = "application/x-www-form-urlencoded";

export type SmsScene = "login" | "set_password" | "change_mobile";

/** 发送短信验证码 POST /api/v1.enterprise.Sms/send（mobile、scene） */
export function sendSmsCode(mobile: string, scene: SmsScene) {
	return request({
		url: "/api/v1.enterprise.Sms/send",
		method: "POST",
		data: {
			mobile: mobile,
			scene: scene
		},
		header: {
			"Content-Type": FORM_URLENCODED
		}
	});
}

/** 登录页发送验证码 */
export function sendLoginSmsCode(mobile: string) {
	return sendSmsCode(mobile, "login");
}

/** 手机号验证码登录 POST /api/v1.enterprise.Login/sms */
export function loginByMobile(mobile: string, code: string) {
	return requestJson({
		url: "/api/v1.enterprise.Login/sms",
		method: "POST",
		data: {
			mobile: mobile,
			code: code,
			device_id: getDeviceId(),
			device_name: getDeviceName(),
			terminal: getLoginTerminal()
		}
	});
}

/** 手机号密码登录 POST /api/v1.enterprise.Login/password */
export function loginByAccount(mobile: string, password: string) {
	return requestJson({
		url: "/api/v1.enterprise.Login/password",
		method: "POST",
		data: {
			mobile: mobile,
			password: password,
			device_id: getDeviceId(),
			device_name: getDeviceName(),
			terminal: getLoginTerminal()
		}
	});
}

export function logoutLogin() {
	return requestJson({
		url: "/api/v1.enterprise.Login/logout",
		method: "POST",
		data: {}
	});
}

export function getUserInfo() {
	return request({
		url: "/api/v1.enterprise.User/profile",
		method: "GET"
	});
}

/** 获取个人信息 */
export function getUserProfile() {
	return request({
		url: "/api/v1.enterprise.User/profile",
		method: "GET"
	});
}

/** 修改个人信息 POST /api/v1.enterprise.User/updateProfile（nickname、avatar） */
export function updateUserProfile(nickname: string, avatar: string) {
	return requestJson({
		url: "/api/v1.enterprise.User/updateProfile",
		method: "POST",
		data: {
			nickname: nickname,
			avatar: avatar
		}
	});
}

/** 修改登录密码：发送短信验证码 POST /api/v1.enterprise.Sms/send（scene set_password） */
export function sendPasswordResetSmsCode(mobile: string) {
	return sendSmsCode(mobile, "set_password");
}

/** 修改手机号：发送短信验证码 POST /api/v1.enterprise.Sms/send（scene change_mobile） */
export function sendChangeMobileSmsCode(mobile: string) {
	return sendSmsCode(mobile, "change_mobile");
}

/** 修改绑定手机号 POST /api/v1.enterprise.User/updateMobile */
export function changeUserMobile(mobile: string, code: string) {
	return request({
		url: "/api/v1.enterprise.User/updateMobile",
		method: "POST",
		data: {
			mobile: mobile,
			code: code,
			scene: "change_mobile"
		},
		header: {
			"Content-Type": FORM_URLENCODED
		}
	});
}

/** 修改/设置登录密码 POST /api/v1.enterprise.Login/setPassword */
export function setLoginPassword(code: string, password: string) {
	return request({
		url: "/api/v1.enterprise.Login/setPassword",
		method: "POST",
		data: {
			password: password,
			scene: "set_password",
			code: code
		},
		header: {
			"Content-Type": FORM_URLENCODED
		}
	});
}
