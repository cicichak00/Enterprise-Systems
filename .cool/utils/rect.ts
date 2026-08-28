import { config } from "@/config";
import { router } from "../router";
import { isH5, isHarmony } from "./device";
import { ctx } from "../ctx";
import { getNum } from "./unit";

/**
 * 是否需要计算 tabBar 高度
 * @returns boolean
 */
export function hasCustomTabBar() {
	if (router.isTabPage()) {
		if (isHarmony()) {
			return false;
		}

		return config.isCustomTabBar || isH5();
	}

	return false;
}

/**
 * 是否存在自定义 topbar
 * @returns boolean
 */
export function hasCustomTopbar() {
	return router.route()?.isCustomNavbar ?? false;
}

/**
 * 获取安全区域高度
 * @param type 类型
 * @returns 安全区域高度
 */
function resolveMpStatusBarHeight(statusBarHeight: number, safeTop: number): number {
	let h = safeTop;
	if (statusBarHeight > h) {
		h = statusBarHeight;
	}
	if (h <= 0) {
		h = 25;
	}
	return h;
}

type MpMenuButtonRect = {
	width: number;
	height: number;
	top: number;
	bottom: number;
	left: number;
};

function isMpMenuButtonValid(menuButton: MpMenuButtonRect): boolean {
	return menuButton.width > 0 && menuButton.height > 0 && menuButton.top > 0;
}

function getMpCapsuleNavFallback(gap: number): CapsuleNavStyle {
	return {
		paddingTop: "6px",
		height: "32px",
		paddingRight: `${97 + gap}px`
	};
}

export function getSafeAreaHeight(type: "top" | "bottom") {
	const windowInfo = uni.getWindowInfo();
	const { safeAreaInsets, statusBarHeight } = windowInfo;

	let h: number;

	if (type == "top") {
		h = safeAreaInsets.top;
		// #ifdef MP-WEIXIN
		h = resolveMpStatusBarHeight(statusBarHeight, h);
		// #endif
	} else {
		h = safeAreaInsets.bottom;

		// #ifdef APP-ANDROID
		if (h == 0) {
			h = 16;
		}
		// #endif
	}

	return h;
}

/**
 * 自定义导航栏避让胶囊按钮的样式（需配合 cl-safe-area type="top" 使用）
 */
export type CapsuleNavStyle = {
	paddingTop: string;
	height: string;
	paddingRight: string;
};

export function getCapsuleNavStyle(gap: number = 8): CapsuleNavStyle {
	// #ifdef MP-WEIXIN
	const menuButton = uni.getMenuButtonBoundingClientRect();
	const { windowWidth, statusBarHeight, safeAreaInsets } = uni.getWindowInfo();
	const topInset = resolveMpStatusBarHeight(statusBarHeight, safeAreaInsets.top);

	if (!isMpMenuButtonValid(menuButton)) {
		return getMpCapsuleNavFallback(gap);
	}

	return {
		paddingTop: `${Math.max(0, menuButton.top - topInset)}px`,
		height: `${menuButton.height}px`,
		paddingRight: `${windowWidth - menuButton.left + gap}px`
	};
	// #endif

	return {
		paddingTop: "6px",
		height: "44px",
		paddingRight: "0px"
	};
}

/**
 * 自定义导航栏内容区顶部间距（含状态栏 + 胶囊区域，需单独占位时使用）
 */
export function getCapsuleSafeTopHeight(gap: number = 8): string {
	// #ifdef MP-WEIXIN
	const menuButton = uni.getMenuButtonBoundingClientRect();
	if (isMpMenuButtonValid(menuButton)) {
		return `${menuButton.bottom + gap}px`;
	}
	const { statusBarHeight, safeAreaInsets } = uni.getWindowInfo();
	const topInset = resolveMpStatusBarHeight(statusBarHeight, safeAreaInsets.top);
	return `${topInset + 32 + gap}px`;
	// #endif

	return `${getSafeAreaHeight("top") + 44 + gap}px`;
}

/**
 * 获取 tabBar 高度
 * @returns tabBar 高度
 */
export function getTabBarHeight() {
	let h = ctx.tabBar.height == null ? 50 : getNum(ctx.tabBar.height!);

	if (hasCustomTabBar()) {
		h += getSafeAreaHeight("bottom");
	}

	return h;
}
