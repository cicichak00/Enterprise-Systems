const LOCAL_PREVIEW_KEY = "enterprise_local_ui_preview";
export const LOCAL_PREVIEW_BUSINESS_PATH = "/pages/tabbar/business/index";

function isLocalPreviewHost(): boolean {
	// #ifdef H5
	if (typeof window != "undefined") {
		const host = `${window.location.hostname}`.toLowerCase();
		return host == "127.0.0.1" || host == "localhost" || host == "::1";
	}
	// #endif
	return false;
}

function syncLocalPreviewSwitch() {
	if (!isLocalPreviewHost()) {
		return;
	}
	// #ifdef H5
	if (typeof window != "undefined") {
		const href = `${window.location.href}`;
		if (href.indexOf("ui_preview=0") >= 0) {
			uni.removeStorageSync(LOCAL_PREVIEW_KEY);
			return;
		}
		if (href.indexOf("ui_preview=1") >= 0) {
			uni.setStorageSync(LOCAL_PREVIEW_KEY, "1");
		}
	}
	// #endif
}

/**
 * 仅用于本机 H5 界面验收：
 * - 必须运行在 localhost / 127.0.0.1；
 * - 必须由 ui_preview=1 显式开启；
 * - 不创建账号、不伪造 token、不影响线上环境。
 */
export function isLocalUiPreview(): boolean {
	syncLocalPreviewSwitch();
	if (!isLocalPreviewHost()) {
		return false;
	}
	return `${uni.getStorageSync(LOCAL_PREVIEW_KEY) ?? ""}` == "1";
}

export function isLocalPreviewBusinessPath(path: string | null = null): boolean {
	if (!isLocalUiPreview()) {
		return false;
	}
	const raw = `${path ?? ""}`;
	return raw.split("?")[0] == LOCAL_PREVIEW_BUSINESS_PATH;
}
