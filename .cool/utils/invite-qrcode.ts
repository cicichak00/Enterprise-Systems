import { config } from "@/config";

const TEST_API_HOST = "https://test.enterprise.api.youboom.cn";
const TEST_INVITE_JOIN_H5_BASE = "https://test.enterprise.youboom.cn/#/pages/join/invite";
const PROD_INVITE_JOIN_H5_BASE = "https://enterprise.youboom.cn/#/pages/join/invite";

function resolveApiHost(baseUrl: string): string {
	const trimmed = baseUrl.replace(/\/+$/, "");
	if (trimmed.endsWith("/api")) {
		return trimmed.slice(0, -4);
	}
	return trimmed;
}

/** 员工加入 H5 落地页（hash 路由），H5 取当前页面域名 */
function resolveInviteJoinH5Base(): string {
	// #ifdef H5
	const origin = `${location.origin}`.replace(/\/+$/, "");
	return `${origin}/#/pages/join/invite`;
	// #endif
	const host = resolveApiHost(config.baseUrl);
	return host == TEST_API_HOST ? TEST_INVITE_JOIN_H5_BASE : PROD_INVITE_JOIN_H5_BASE;
}

export function buildInviteJoinUrl(enterpriseCode: string): string {
	return `${resolveInviteJoinH5Base()}?code=${enterpriseCode}`;
}

function resolveEnterpriseCode(data: UTSJSONObject): string {
	const rootCode = data["enterprise_code"];
	if (rootCode != null && `${rootCode}`.trim() != "") {
		return `${rootCode}`.trim();
	}
	const enterprise = data["enterprise"] as UTSJSONObject | null;
	if (enterprise != null) {
		const nestedCode = enterprise["enterprise_code"];
		if (nestedCode != null && `${nestedCode}`.trim() != "") {
			return `${nestedCode}`.trim();
		}
	}
	return "";
}

/** 从 GET /api/v1.enterprise.Enterprise/info 的 enterprise_code 生成邀请链接 */
export function resolveInviteQrContent(data: UTSJSONObject): string {
	const enterpriseCode = resolveEnterpriseCode(data);
	if (enterpriseCode == "") {
		return "";
	}
	return buildInviteJoinUrl(enterpriseCode);
}
