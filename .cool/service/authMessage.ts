const AUTH_ERROR_MARKERS = [
	"未登录",
	"请先登录",
	"请登录",
	"重新登录",
	"登录失败",
	"登录异常",
	"登录问题",
	"登录过期",
	"登录已过期",
	"登录失效",
	"登录状态失效",
	"登录状态过期",
	"会话过期",
	"会话已过期",
	"会话失效",
	"token无效",
	"token失效",
	"token过期",
	"Token无效",
	"Token失效",
	"Token过期",
	"凭证过期",
	"凭证失效",
	"身份失效",
	"身份过期",
	"授权失效",
	"授权过期"
];

const AUTH_ERROR_CODES = [401, 403];

function isAuthErrorCode(code: number | string | null | undefined): boolean {
	if (code == null) {
		return false;
	}
	const codeStr = `${code}`;
	for (let i = 0; i < AUTH_ERROR_CODES.length; i++) {
		const c = AUTH_ERROR_CODES[i];
		if (code == c || codeStr == `${c}`) {
			return true;
		}
	}
	return false;
}

export function extractResponseMessage(body: any | null): string {
	if (body == null) {
		return "";
	}
	const envelope = body as UTSJSONObject;
	let msg = `${envelope["msg"] ?? envelope["message"] ?? ""}`;
	if (msg != "") {
		return msg;
	}
	const data = envelope["data"] as UTSJSONObject | null;
	if (data != null) {
		msg = `${data["msg"] ?? data["message"] ?? ""}`;
	}
	return msg;
}

export function isLoginRequiredMessage(msg: string): boolean {
	if (msg == "") {
		return false;
	}
	for (let i = 0; i < AUTH_ERROR_MARKERS.length; i++) {
		if (msg.indexOf(AUTH_ERROR_MARKERS[i]) >= 0) {
			return true;
		}
	}
	return false;
}

export function isUnauthorizedResponse(body: any | null): boolean {
	if (body == null) {
		return false;
	}
	const envelope = body as UTSJSONObject;
	if (isAuthErrorCode(envelope["code"])) {
		return true;
	}
	return isLoginRequiredMessage(extractResponseMessage(body));
}
