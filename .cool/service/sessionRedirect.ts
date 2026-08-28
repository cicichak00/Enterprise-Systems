import { router } from "../router";
import { clearSession } from "./authSession";
import { isInLoginGrace } from "./loginGrace";

const LOGIN_REDIRECT_DELAY_MS = 2500;

let loginRedirectScheduled = false;
let loginRedirectTimer: number | null = null;

function resolveLoginTip(tip: string | null): string {
	if (tip != null && `${tip}`.trim() != "") {
		return `${tip}`.trim();
	}
	return "请先登录";
}

export function redirectToLoginIfNeeded(
	tip: string | null = null,
	redirectPath: string | null = null
) {
	if (isInLoginGrace()) {
		return;
	}
	if (router.isLoginPage(router.path())) {
		return;
	}
	if (loginRedirectScheduled) {
		return;
	}
	loginRedirectScheduled = true;
	const path =
		redirectPath != null && redirectPath != ""
			? redirectPath
			: router.captureLoginRedirect();
	clearSession();
	const message = resolveLoginTip(tip);
	uni.showToast({
		title: message,
		icon: "none",
		duration: LOGIN_REDIRECT_DELAY_MS
	});
	if (loginRedirectTimer != null) {
		clearTimeout(loginRedirectTimer);
	}
	loginRedirectTimer = setTimeout(() => {
		loginRedirectScheduled = false;
		loginRedirectTimer = null;
		if (isInLoginGrace() || router.isLoginPage(router.path())) {
			return;
		}
		router.login(path);
	}, LOGIN_REDIRECT_DELAY_MS) as unknown as number;
}
