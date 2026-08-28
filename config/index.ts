import { type Config } from "@/.cool";

// 判断当前是否为开发环境
export const isDev = process.env.NODE_ENV == "development";

export const proxy = {
	// 开发环境
	dev: {
		baseUrl: "https://testapi.youbao.cn", // 测试地址（新版右豹 API）
		// baseUrl: "https://api.youbao.cn"  // 正式地址
	},

	// 生产环境
	prod: {
		baseUrl: "https://testapi.youbao.cn", // 测试地址（新版右豹 API）
		// baseUrl: "https://api.youbao.cn"  // 正式地址
	}
};

function toApiBaseUrl(host: string): string {
	const trimmed = host.replace(/\/+$/, "");
	if (trimmed.endsWith("/api")) {
		return trimmed;
	}
	return `${trimmed}/api`;
}

const apiEnv = isDev ? proxy.dev : proxy.prod;

// 根据环境导出最终配置
export const config = {
	name: "企业号",
	locale: "zh-tw",
	website: "",
	showDarkButton: false,
	isCustomTabBar: true,
	backTop: true,
	wx: {
		debug: false
	},
	baseUrl: toApiBaseUrl(apiEnv.baseUrl)
} as Config;
