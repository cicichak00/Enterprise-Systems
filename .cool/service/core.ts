import { isDev, config } from "@/config";
import { locale, t } from "../locale";
import { isH5 } from "../utils/device";
import { readStoredToken } from "../utils/auth";
import { getClientOs, getClientType, getClientVersion, getYbPlatform } from "../utils/terminal";
import {
	extractResponseMessage,
	isUnauthorizedResponse
} from "./authMessage";
import { isInLoginGrace } from "./loginGrace";
import { redirectToLoginIfNeeded } from "./sessionRedirect";

export type RequestOptions = {
	url: string;
	method?: RequestMethod;
	data?: any;
	params?: any;
	header?: any;
	timeout?: number;
	withCredentials?: boolean;
	firstIpv4?: boolean;
	enableChunked?: boolean;
};

export type Response = {
	code?: number;
	msg?: string;
	message?: string;
	data?: any;
};

const JSON_CONTENT_TYPE = "application/json";

function needsJsonBody(method: string): boolean {
	const m = method.toUpperCase();
	return m == "POST" || m == "PUT" || m == "PATCH";
}

export { extractResponseMessage, isLoginRequiredMessage, isUnauthorizedResponse } from "./authMessage";
export { redirectToLoginIfNeeded } from "./sessionRedirect";

export function resolveRequestUrl(path: string): string {
	if (path.startsWith("http")) {
		return path;
	}
	const base = config.baseUrl.replace(/\/+$/, "");
	const p = path.startsWith("/") ? path : `/${path}`;
	if (p.startsWith("/api/") && base.endsWith("/api")) {
		return `${base.slice(0, -4)}${p}`;
	}
	return `${base}${p}`;
}

export function buildCommonHeaders(token: string | null, extra: UTSJSONObject | null = null): UTSJSONObject {
	const headers = {
		...(extra ?? {})
	} as UTSJSONObject;
	headers["token"] = token ?? "";
	if (token != null && token != "") {
		headers["Authorization"] = token.indexOf("Bearer ") == 0 ? token : `Bearer ${token}`;
	} else {
		headers["Authorization"] = "";
	}
	if (!isH5()) {
		headers["language"] = locale.value;
	}
	headers["yb-client-os"] = getClientOs();
	headers["yb-client-type"] = getClientType();
	headers["yb-client-version"] = getClientVersion();
	headers["yb-platform"] = getYbPlatform();
	return headers;
}

function shouldClearSessionOnAuthError(requestToken: string | null): boolean {
	if (isInLoginGrace()) {
		return false;
	}
	const currentToken = readStoredToken();
	const req = requestToken ?? "";
	const cur = currentToken ?? "";
	if (req != cur) {
		return false;
	}
	return true;
}

function handleAuthFailure(tip: string | null, requestToken: string | null) {
	if (shouldClearSessionOnAuthError(requestToken)) {
		redirectToLoginIfNeeded(tip);
	}
}

export function handleApiAuthResponse(
	body: any | null,
	requestToken: string | null = null
): boolean {
	if (!isUnauthorizedResponse(body)) {
		return false;
	}
	const msg = extractResponseMessage(body);
	handleAuthFailure(msg != "" ? msg : "请先登录", requestToken ?? readStoredToken());
	return true;
}

export function request(options: RequestOptions): Promise<any | null> {
	let { url, method = "GET", data = {}, timeout = 60000 } = options;
	const customHeader = (options.header ?? {}) as UTSJSONObject;

	// GET 查询参数：兼容 options.params，合并进 data 供 uni.request 序列化到 URL
	if (options.params != null && method.toUpperCase() == "GET") {
		const base = (data ?? {}) as UTSJSONObject;
		const extra = options.params as UTSJSONObject;
		data = {
			...base,
			...extra
		};
	}

	url = resolveRequestUrl(url);

	const token: string | null = readStoredToken();
	const requestToken = token;

	if (isDev) {
		console.log(`[${method}] ${url}`);
	}

	const headers = buildCommonHeaders(token, customHeader);
	// POST/PUT/PATCH 默认 JSON；若调用方已指定 Content-Type（如 form-urlencoded）则保留
	if (needsJsonBody(method)) {
		const contentType = headers["Content-Type"] as string | null;
		if (contentType == null || `${contentType}`.trim() == "") {
			headers["Content-Type"] = JSON_CONTENT_TYPE;
		}
	}

	return new Promise((resolve, reject) => {
		const requestMethod = method.toUpperCase();
		const maxRetries = requestMethod == "GET" ? 2 : 0;
		const runRequest = (attempt: number): void => {
			uni.request({
			url,
			method,
			data,
			header: headers,
			timeout,
			success(res) {
				if (res.statusCode == 401 || res.statusCode == 403) {
					handleAuthFailure("请先登录", requestToken);
					reject({
						code: res.statusCode,
						message: "请先登录",
						msg: "请先登录"
					} as Response);
					return;
				}
				if (res.statusCode == 502) {
					reject({ message: t("服务异常") } as Response);
					return;
				}
				if (res.statusCode == 404) {
					reject({ message: `[404] ${url}` } as Response);
					return;
				}
				if (res.statusCode == 200) {
					const body = res.data ?? null;
					if (isUnauthorizedResponse(body)) {
						const envelope = body as UTSJSONObject;
						const tip = extractResponseMessage(body);
						const msg = tip != "" ? tip : "请先登录";
						handleAuthFailure(msg, requestToken);
						reject({ code: envelope["code"], message: msg, msg: msg } as Response);
						return;
					}
					resolve(body);
					return;
				}
				reject({ message: t("服务异常") } as Response);
			},
			fail(err) {
				if (attempt < maxRetries) {
					setTimeout(() => runRequest(attempt + 1), 350 * (attempt + 1));
					return;
				}
				const raw = `${err.errMsg ?? ""}`.trim();
				const message = raw.indexOf("timeout") >= 0 ? "请求超时，请点击重试" : "网络连接不稳定，请点击重试";
				reject({ message, msg: message } as Response);
			}
			});
		};
		runRequest(0);
	});
}

/** @deprecated 请使用 requestJson；POST 已统一走 JSON */
export function requestForm(options: RequestOptions): Promise<any | null> {
	return requestJson(options);
}

export function requestJson(options: RequestOptions): Promise<any | null> {
	const customHeader = (options.header ?? {}) as UTSJSONObject;
	return request({
		...options,
		header: {
			"Content-Type": JSON_CONTENT_TYPE,
			...customHeader
		}
	});
}
