import { navigateAfterAppSystem } from "./appSystemNavigation";
import { navigateToFirstMenu, pushToMenuPath, tabbar } from "../store/tabbar";
import { router, TABBAR_HOME_PATH } from "../router";
import { user } from "../store/user";

const MIN_SPLASH_MS = 800;

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

function pickLoginMobile(): string {
	const loginM = uni.getStorageSync("loginM") as string | null;
	if (loginM != null && `${loginM}`.trim() != "") {
		return `${loginM}`.trim();
	}
	return "";
}

/** 启动页完成初始化后跳转至业务首页 */
export function runAppLaunchBootstrap(): Promise<void> {
	user.hydrateLocalProfile();
	const minWait = delay(MIN_SPLASH_MS);

	let flow: Promise<void>;
	if (user.isInLoginGrace()) {
		const redirect = router.getLoginRedirect();
		if (redirect != null && redirect != "") {
			flow = Promise.resolve().then(() => {
				const path = redirect.startsWith("/") ? redirect : `/${redirect}`;
				router.push({ path: path, mode: "reLaunch" });
			});
		} else {
			flow = Promise.resolve().then(() => {
				pushToMenuPath(TABBAR_HOME_PATH);
			});
		}
	} else if (user.isLoggedIn()) {
		if (router.shouldSkipAppSystem()) {
			flow = Promise.resolve().then(() => {
				pushToMenuPath(TABBAR_HOME_PATH);
			});
		} else {
			flow = tabbar.load().then(() => navigateAfterAppSystem(pickLoginMobile()));
		}
	} else {
		flow = navigateToFirstMenu();
	}

	return Promise.all([minWait, flow]).then(() => {});
}
