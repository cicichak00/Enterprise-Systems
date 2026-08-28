import { getAppSystem } from "../api/app";
import { router, TABBAR_HOME_PATH } from "../router";
import { applyAppSystemResponse, pushToMenuPath } from "../store/tabbar";
import { user } from "../store/user";
import { getApiMessage, isApiSuccess } from "../utils/comm";
import type { Response } from "../service/core";

/** bind_status=2 且 status=2（已离职）时在工作室页展示 */
export const RESIGNED_STATUS_NOTICE = "您当前状态已离职，如有疑问请联系前企业主";

export type AppSystemRouteState = {
	bindStatus: number;
	status: number;
	enterpriseCode: string;
	statusText: string;
};

export type AppSystemRedirectPlan = {
	path: string;
};

function toInt(val: any, fallback: number = 0): number {
	if (val == null) {
		return fallback;
	}
	const n = parseInt(`${val}`);
	return isNaN(n) ? fallback : n;
}

function pickInt(obj: UTSJSONObject | null, keys: string[]): number | null {
	if (obj == null) {
		return null;
	}
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const val = obj[key];
		if (val != null && `${val}`.trim() != "") {
			return toInt(val, 0);
		}
	}
	return null;
}

function pickString(obj: UTSJSONObject | null, keys: string[]): string {
	if (obj == null) {
		return "";
	}
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const val = obj[key];
		if (val != null) {
			const text = `${val}`.trim();
			if (text != "") {
				return text;
			}
		}
	}
	return "";
}

export function parseAppSystemData(res: any | null): UTSJSONObject | null {
	if (res == null) {
		return null;
	}
	const envelope = res as UTSJSONObject;
	const code = envelope["code"];
	if (code != null && !isApiSuccess(code)) {
		return null;
	}
	const data = (envelope["data"] ?? envelope) as UTSJSONObject | null;
	return data;
}

export function parseAppSystemRouteState(res: any | null): AppSystemRouteState {
	const data = parseAppSystemData(res);
	if (data == null) {
		return {
			bindStatus: 0,
			status: 0,
			enterpriseCode: "",
			statusText: ""
		};
	}
	const enterprise = data["enterprise"] as UTSJSONObject | null;
	const cert = data["cert"] as UTSJSONObject | null;

	const bindStatus = pickInt(data, ["bind_status", "bindStatus"]) ?? pickInt(enterprise, ["bind_status", "bindStatus"]) ?? 0;
	const status = pickInt(data, ["status"]) ?? pickInt(enterprise, ["status"]) ?? pickInt(cert, ["status"]) ?? 0;
	const enterpriseCode = pickString(data, ["enterprise_code", "enterpriseCode"]) != "" ? pickString(data, ["enterprise_code", "enterpriseCode"]) : pickString(enterprise, ["enterprise_code", "enterpriseCode"]);
	const statusText = pickString(data, ["status_text", "statusText", "tip", "msg"]) != "" ? pickString(data, ["status_text", "statusText", "tip", "msg"]) : pickString(enterprise, ["status_text", "statusText", "tip", "msg"]);

	return { bindStatus, status, enterpriseCode, statusText };
}

export function isResignedEmployeeState(state: AppSystemRouteState): boolean {
	return state.bindStatus == 2 && state.status == 2;
}

/** bind_status=2 为员工，不应进入企业负责人总览页 */
export function shouldBlockHomeOverview(state: AppSystemRouteState): boolean {
	return state.bindStatus == 2;
}

export function getAllowedEntryPath(state: AppSystemRouteState, loginMobile: string = ""): string {
	return resolveAppSystemRedirect(state, loginMobile).path;
}

export function resolveAppSystemRedirect(state: AppSystemRouteState, loginMobile: string): AppSystemRedirectPlan {

	const mobile = loginMobile.trim();
	const { bindStatus, status, enterpriseCode } = state;

	if (bindStatus == 0) {
		return {
			path: `/pages/join/enterprise-apply?mobile=${mobile}`
		};
	}
	if (bindStatus == 1 && status == 0) {
		return {
			path: `/pages/join/enterprise-apply?mobile=${mobile}` 
		};
	}
	if (bindStatus == 1 && status == 1) {
		return {
			path: "/pages/tabbar/home/index"
		};
	}
	if (bindStatus == 2 && status == 0) {
		return {
			path: `/pages/join/invite?code=${enterpriseCode}`
		};
	}
	if (bindStatus == 2 && status == 1) {
		return {
			path: '/pages/tabbar/studio/index'
		};
	}
	if (bindStatus == 2 && status == 2) {
		return {
			path: '/pages/tabbar/studio/index'
		};
	}

	return {
		path: TABBAR_HOME_PATH
	};
}

export function navigateAfterAppSystem(loginMobile: string = "", force: boolean = false): Promise<void> {
	if (!user.isLoggedIn() || (!force && router.shouldSkipAppSystem())) {
		return Promise.resolve();
	}
	return getAppSystem().then((res) => {
			const envelope = res as Response | null;
			if (envelope != null && envelope.code != null && !isApiSuccess(envelope.code)) {
				uni.showToast({ title: getApiMessage(envelope, "加载失败"), icon: "none" });
				pushToMenuPath(TABBAR_HOME_PATH);
				return;
			}
			applyAppSystemResponse(res);
			const state = parseAppSystemRouteState(res);
			const plan = resolveAppSystemRedirect(state, loginMobile);
			pushToMenuPath(plan.path);
		})
		.catch((err) => {
			uni.showToast({ title: getApiMessage(err, "加载失败"), icon: "none" });
		});
}
