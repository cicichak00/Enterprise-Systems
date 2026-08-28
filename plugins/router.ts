import { type PluginConfig } from "@/.cool";
import { router, useStore } from "@/.cool";
import { redirectToLoginIfNeeded } from "@/.cool/service/sessionRedirect";
import { navigateToFirstMenu } from "@/.cool/store/tabbar";

export default {
	install(app) {
		router.beforeEach((to, from, next) => {
			const { user } = useStore();
			user.hydrateLocalProfile();
			if (user.isInLoginGrace()) {
				next();
				return;
			}
			const pathOnly = to.path.split("?")[0];
			if (router.isPublicPage(pathOnly)) {
				next();
				return;
			}
			if (user.isLoggedIn()) {
				next();
				return;
			}
			if (router.isEnterpriseApplyPage(pathOnly)) {
				next();
				return;
			}
			if (router.isJoinInvitePage(pathOnly)) {
				const redirectPath = router.buildRedirectPath(
					to.path,
					to.query ?? ({} as UTSJSONObject)
				);
				redirectToLoginIfNeeded("请先登录", redirectPath);
				return;
			}
			navigateToFirstMenu();
		});
	}
} as PluginConfig;
