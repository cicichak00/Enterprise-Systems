/** 企业号登录 terminal（与接口文档一致：app / h5 / mp） */
export function getLoginTerminal(): string {
	// #ifdef MP-WEIXIN
	return "mp";
	// #endif
	// #ifdef MP-TOUTIAO
	return "mp";
	// #endif
	// #ifdef H5
	return "h5";
	// #endif
	// #ifdef APP-ANDROID
	return "app";
	// #endif
	// #ifdef APP-IOS
	return "app";
	// #endif
	return "app";
}

export function getDeviceId() {
	const info = uni.getSystemInfoSync();
	return info.deviceId ?? "";
}

/** 请求头 yb-client-os */
export function getClientOs(): string {
	// #ifdef MP-WEIXIN
	return "mp";
	// #endif
	// #ifdef MP-TOUTIAO
	return "mp";
	// #endif
	// #ifdef H5
	return "h5";
	// #endif
	// #ifdef APP-ANDROID
	return "android";
	// #endif
	// #ifdef APP-IOS
	return "ios";
	// #endif
	return "h5";
}

/** 请求头 yb-client-type（与 getLoginChannel 一致） */
export function getClientType(): string {
	return `${getLoginChannel()}`;
}

/** 请求头 yb-client-version */
export function getClientVersion(): string {
	return "1.0.0";
}

/** 请求头 yb-platform */
export function getYbPlatform(): string {
	return "1";
}

/** 与 App 短信场景 channel 一致 */
export function getLoginChannel(): number {
	// #ifdef MP-WEIXIN
	return 1;
	// #endif
	// #ifdef MP-TOUTIAO
	return 1;
	// #endif
	// #ifdef H5
	return 3;
	// #endif
	// #ifdef APP-ANDROID
	return 6;
	// #endif
	// #ifdef APP-IOS
	return 5;
	// #endif
	return 3;
}
