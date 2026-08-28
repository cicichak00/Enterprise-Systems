import { navigateAfterAppSystem } from "./appSystemNavigation";
import { router } from "../router";

/** 登录成功后的统一跳转：邀请页回跳，其余按 /api/app/system 的 bind_status、status 决定 */
export function completeLoginNavigation(pendingRedirect: string | null, loginMobile: string = "") {
	if (pendingRedirect != null && pendingRedirect != "") {
		const redirectPathOnly = pendingRedirect.split("?")[0];
		if (!router.isLoginPage(redirectPathOnly) && router.isJoinInvitePage(redirectPathOnly)) {
			router.nextLogin(pendingRedirect);
			return;
		}
	}
	router.clearLoginRedirect();
	navigateAfterAppSystem(loginMobile).finally(() => {
		router.triggerAfterLogin();
	});
}
