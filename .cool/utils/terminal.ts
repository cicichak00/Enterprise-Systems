import { uuid } from "./comm";

const LOGIN_DEVICE_ID_KEY = "enterprise_login_device_id";

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

/**
 * 登录设备唯一标识。
 * 首次调用生成 UUID 并写入本地，后续登录复用；不能使用 terminal/channel 代替。
 */
export function getDeviceId(): string {
	const stored = `${uni.getStorageSync(LOGIN_DEVICE_ID_KEY) ?? ""}`.trim();
	if (stored != "" && stored.length <= 64) {
		return stored;
	}
	const deviceId = uuid();
	uni.setStorageSync(LOGIN_DEVICE_ID_KEY, deviceId);
	return deviceId;
}

/** 用于后端排查的可读设备名称，最长 64 字符。 */
export function getDeviceName(): string {
	const info = uni.getSystemInfoSync();
	const deviceModel = `${info.model ?? ""}`.trim();
	const osName = `${info.platform ?? ""}`.trim();
	const parts: string[] = [];
	if (deviceModel != "") parts.push(deviceModel);
	if (osName != "" && parts.indexOf(osName) < 0) parts.push(osName);
	const name = parts.length > 0 ? parts.join(" ") : getLoginTerminal().toUpperCase();
	return name.substring(0, 64);
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
