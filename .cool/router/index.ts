import { PAGES, TABS } from "../ctx";
import type { BackOptions, PageInstance, PushOptions } from "../types";
import {
	storage,
	last,
	isNull,
	isEmpty,
	get,
	isFunction,
	toArray,
	map,
	debounce,
	nth
} from "../utils";

// 路由信息类型
type RouteInfo = {
	path: string;
	query: UTSJSONObject;
	meta: UTSJSONObject;
	isAuth?: boolean;
};

// 跳转前钩子类型
type BeforeEach = (to: RouteInfo, from: PageInstance, next: () => void) => void;
// 登录后回调类型
type AfterLogin = () => void;

// 路由事件集合
type Events = {
	beforeEach?: BeforeEach;
	afterLogin?: AfterLogin;
};

const LOGIN_REDIRECT_KEY = "loginRedirect";

/** 总览 Tab 首页（业务首页，非启动页） */
export const TABBAR_HOME_PATH = "/pages/tabbar/home/index";

// 路由核心类
export class Router {
	private eventsMap = {} as Events; // 事件存储

	// 获取传递的 params 参数
	params() {
		return (storage.get("router-params") ?? {}) as UTSJSONObject;
	}

	// 获取传递的 query 参数
	query() {
		return this.route()?.query ?? {};
	}

	// 获取默认路径，支持 home 和 login
	defaultPath(name: "home" | "login") {
		const paths = {
			home: "/pages/launch/index",
			login: "/pages/login/mobile"
		};

		return get(paths, name) as string;
	}

	// 获取当前页面栈的所有页面实例
	getPages(): PageInstance[] {
		return map(getCurrentPages(), (e) => {
			let path = e.route!;

			// 根路径自动转为首页
			if (path == "/") {
				path = this.defaultPath("home");
			}

			// 补全路径前缀
			if (!path.startsWith("/")) {
				path = "/" + path;
			}

			// 获取页面样式
			const page = PAGES.find((e) => e.path == path);
			const style = page?.style;
			const meta = page?.meta;

			// 获取页面暴露的方法
			// @ts-ignore
			const vm = e.vm as any;

			let exposed = vm;

			// #ifdef H5
			exposed = get(e, "vm.$.exposed");
			// #endif

			// 获取页面 query 参数
			// @ts-ignore
			const query = e.options;

			return {
				path,
				vm,
				exposed,
				style,
				meta,
				query,
				isCustomNavbar: style?.navigationStyle == "custom"
			} as PageInstance;
		});
	}

	// 获取指定路径的页面实例
	getPage(path: string) {
		return this.getPages().find((e) => e.path == path);
	}

	// 获取当前路由页面实例
	route() {
		return last(this.getPages());
	}

	// 获取当前页面路径
	path() {
		return this.route()?.path ?? "";
	}

	/** 解析当前路由（页面栈 → H5 hash → 启动 path），用于 onLaunch 等栈未就绪场景 */
	resolveRoutePathHint(): string {
		const fromStack = this.path();
		if (fromStack != "") {
			return fromStack.split("?")[0];
		}
		// #ifdef H5
		if (typeof window != "undefined") {
			const hash = `${window.location.hash}`;
			const idx = hash.indexOf("/pages/");
			if (idx >= 0) {
				let raw = hash.substring(idx);
				const q = raw.indexOf("?");
				if (q >= 0) {
					raw = raw.substring(0, q);
				}
				return raw.startsWith("/") ? raw : `/${raw}`;
			}
		}
		// #endif
		try {
			const opts = uni.getLaunchOptionsSync();
			const lp = opts.path;
			if (lp != null && `${lp}`.trim() != "") {
				let raw = `${lp}`.trim();
				if (!raw.startsWith("/")) {
					raw = "/" + raw;
				}
				return raw.split("?")[0];
			}
		} catch (_e) {}
		return "";
	}

	// 简单跳转页面（默认 navigateTo）
	to(path: string) {
		this.push({
			path
		});
	}

	// 路由跳转，支持多种模式和参数
	push(options: PushOptions) {
		let {
			query = {},
			params = {},
			mode = "navigateTo",
			path,
			success,
			fail,
			complete,
			animationType,
			animationDuration,
			events,
			isAuth
		} = options;

		// 拼接 query 参数到 url
		if (!isEmpty(query)) {
			const arr = toArray(query, (v, k) => {
				return `${k}=${v}`;
			});
			path += "?" + arr.join("&");
		}

		// params 通过 storage 临时存储
		if (!isEmpty(params)) {
			storage.set("router-params", params, 0);
		}

		const pathOnly = path.split("?")[0];
		if (this.isTabPage(pathOnly)) {
			mode = "switchTab";
			path = pathOnly;
		}

		// 跳转执行函数
		const next = () => {
			switch (mode) {
				case "navigateTo":
					uni.navigateTo({
						url: path,
						success,
						events,
						fail,
						complete,
						animationType,
						animationDuration
					});
					break;
				case "redirectTo":
					uni.redirectTo({
						url: path,
						success,
						fail,
						complete
					});
					break;
				case "reLaunch":
					uni.reLaunch({
						url: path,
						success,
						fail,
						complete
					});
					break;
				case "switchTab":
					uni.switchTab({
						url: path,
						success,
						fail,
						complete
					});
					break;
			}
		};

		// 跳转前钩子处理
		if (this.eventsMap.beforeEach != null) {
			// 当前页
			const from = last(this.getPages());

			// 跳转页
			const to = { path, meta: this.getMeta(path), query, isAuth } as RouteInfo;

			// 调用跳转前钩子
			this.eventsMap.beforeEach(to, from!, next);
		} else {
			next();
		}
	}

	// 回到总览 Tab 首页
	home() {
		this.push({
			path: TABBAR_HOME_PATH,
			mode: "switchTab"
		});
	}

	// 返回上一页
	back(options: BackOptions | null = null) {
		if (this.isFirstPage()) {
			this.home();
		} else {
			const delta = options?.delta ?? 1;

			// 执行跳转函数
			const next = () => {
				uni.navigateBack({ ...(options ?? {}) });
			};

			// 跳转前钩子处理
			if (this.eventsMap.beforeEach != null) {
				// 当前页
				const from = last(this.getPages());

				// 上一页
				const to = nth(this.getPages(), -delta - 1);

				if (to != null) {
					// 调用跳转前钩子
					this.eventsMap.beforeEach(
						{
							path: to.path,
							query: to.query,
							meta: to.meta ?? ({} as UTSJSONObject)
						},
						from!,
						next
					);
				} else {
					console.error("[router] found to page is null");
				}
			} else {
				next();
			}
		}
	}

	// 获取页面元数据
	getMeta(path: string) {
		if (path == null || path == "") {
			return {} as UTSJSONObject;
		}
		return PAGES.find((e) => path.indexOf(e.path) >= 0)?.meta ?? ({} as UTSJSONObject);
	}

	// 执行当前页面暴露的方法
	callMethod(name: string, data?: any): any | null {
		const fn = get(this.route()!, `$vm.$.exposed.${name}`) as (d?: any) => any | null;
		if (isFunction(fn)) {
			return fn(data);
		}
		return null;
	}

	// 判断页面栈是否只有一个页面
	isFirstPage() {
		return getCurrentPages().length == 1;
	}

	// 判断是否为首页
	isHomePage() {
		return this.path() == this.defaultPath("home");
	}

	// 判断是否为自定义导航栏页面
	isCustomNavbarPage() {
		return this.route()?.isCustomNavbar ?? false;
	}

	// 判断是否为当前页面
	isCurrentPage(path: string) {
		return this.path() == path;
	}

	// 判断是否为 tab 页面
	isTabPage(path: string | null = null) {
		if (path == null) {
			path = this.path();
		}

		if (path == "/") {
			path = this.defaultPath("home");
		}
		return !isNull(TABS.find((e) => path == e.pagePath));
	}

	// 判断是否为登录页
	isLoginPage(path: string) {
		return path == "/pages/login/mobile" || path == "/pages/login/account";
	}

	// 企业号申请页（未登录/接口异常时不自动跳登录）
	isEnterpriseApplyPage(path: string | null = null) {
		const p = path ?? this.path();
		return p.indexOf("enterprise-apply") >= 0;
	}

	// 员工加入邀请页（未登录需先登录）
	isJoinInvitePage(path: string | null = null) {
		const p = path != null && `${path}`.trim() != "" ? path! : this.resolveRoutePathHint();
		return p.indexOf("join/invite") >= 0;
	}

	/** 当前在邀请页，或登录后将回到邀请页（用于跳过 /api/app/system） */
	isJoinInviteFlowActive(): boolean {
		if (this.isJoinInvitePage()) {
			return true;
		}
		const redirect = this.getLoginRedirect();
		return redirect != null && redirect.indexOf("join/invite") >= 0;
	}

	/** 企业号申请页、邀请页等无需拉取 /api/app/system */
	shouldSkipAppSystem(): boolean {
		if (this.isJoinInviteFlowActive()) {
			return true;
		}
		return this.isEnterpriseApplyPage();
	}

	isLaunchPage(path: string | null = null) {
		const raw = path ?? this.path();
		const pathOnly = raw.split("?")[0];
		return pathOnly == "/pages/launch/index";
	}

	isPublicPage(path: string | null = null) {
		const raw = path ?? this.path();
		const pathOnly = raw.split("?")[0];
		if (pathOnly == "") {
			return false;
		}
		if (this.isLaunchPage(pathOnly)) {
			return true;
		}
		if (this.isLoginPage(pathOnly)) {
			return true;
		}
		if (pathOnly.indexOf("/pages/protocol/") == 0) {
			return true;
		}
		const publicUserPaths = [
			"/pages/user/user-agreement",
			"/pages/user/advisor-agreement",
			"/pages/user/risk-penalty",
			"/pages/user/tax-invoice",
			"/pages/user/help"
		];
		for (let i = 0; i < publicUserPaths.length; i++) {
			if (pathOnly == publicUserPaths[i]) {
				return true;
			}
		}
		return false;
	}

	buildRedirectPath(path: string, query: UTSJSONObject = {} as UTSJSONObject) {
		let url = path;
		if (!isEmpty(query)) {
			const arr = toArray(query, (v, k) => {
				return `${k}=${v}`;
			});
			url += "?" + arr.join("&");
		}
		return url;
	}

	captureLoginRedirect(): string {
		const route = this.route();
		if (route == null) {
			return "";
		}
		return this.buildRedirectPath(route.path, route.query ?? ({} as UTSJSONObject));
	}

	setLoginRedirect(path: string) {
		if (path == "") {
			return;
		}
		const pathOnly = path.split("?")[0];
		if (this.isLoginPage(pathOnly)) {
			return;
		}
		uni.setStorageSync(LOGIN_REDIRECT_KEY, path);
	}

	getLoginRedirect(): string | null {
		const redirect = uni.getStorageSync(LOGIN_REDIRECT_KEY) as string | null;
		if (redirect == null || redirect == "") {
			return null;
		}
		return redirect;
	}

	clearLoginRedirect() {
		uni.removeStorageSync(LOGIN_REDIRECT_KEY);
	}

	preserveLoginRedirect() {
		const saved = this.getLoginRedirect();
		if (saved != null && saved != "") {
			this.setLoginRedirect(saved);
		}
	}

	login(redirectPath?: string | null) {
		let redirect = redirectPath ?? "";
		if (redirect == "") {
			const saved = this.getLoginRedirect();
			if (saved != null && saved != "") {
				redirect = saved;
			} else {
				redirect = this.captureLoginRedirect();
			}
		}
		if (redirect != "") {
			this.setLoginRedirect(redirect);
		}
		if (this.isLoginPage(this.path())) {
			return;
		}
		this._goLoginDebounced();
	}

	private _goLoginDebounced = debounce(() => {
		if (!this.isLoginPage(this.path())) {
			this.push({
				path: "/pages/login/mobile",
				mode: "redirectTo"
			});
		}
	}, 300);

	nextLogin(redirectOverride?: string | null) {
		let redirect = redirectOverride ?? this.getLoginRedirect();
		this.clearLoginRedirect();

		let path = this.defaultPath("home");
		if (redirect != null && redirect != "") {
			const redirectPathOnly = redirect.split("?")[0];
			if (!this.isLoginPage(redirectPathOnly)) {
				path = redirect;
			}
		}

		const pathOnly = path.split("?")[0];
		const url = path.startsWith("/") ? path : `/${path}`;
		if (this.isTabPage(pathOnly)) {
			uni.switchTab({ url: pathOnly });
		} else {
			uni.reLaunch({ url: url });
		}

		this.triggerAfterLogin();
	}

	triggerAfterLogin() {
		if (this.eventsMap.afterLogin != null) {
			this.eventsMap.afterLogin!();
		}
		uni.$emit("afterLogin");
	}

	// 注册跳转前钩子
	beforeEach(cb: BeforeEach) {
		this.eventsMap.beforeEach = cb;
	}

	// 注册登录后回调
	afterLogin(cb: AfterLogin) {
		this.eventsMap.afterLogin = cb;
	}
}

// 单例导出
export const router = new Router();
