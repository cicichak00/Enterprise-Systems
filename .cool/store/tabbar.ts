import { ref } from "vue";
import { getAppSystem } from "../api/app";
import { router, TABBAR_HOME_PATH } from "../router";
import { isApiSuccess } from "../utils/comm";

export type TabbarMenuItem = {
	id: number;
	key: string;
	path: string;
	text: string;
	icon: string;
	iconUrl: string;
	iconActiveUrl: string;
	badge: string;
	sort: number;
};

const KEY_ICON_FALLBACK: UTSJSONObject = {
	overview: "home-line",
	operations: "layout-2-line",
	operation: "layout-2-line",
	business: "layout-2-line",
	studio: "store-2-line",
	income: "money-cny-circle-line",
	revenue: "money-cny-circle-line",
	profit: "money-cny-circle-line",
	ranking: "trophy-line",
	rank: "trophy-line",
	my: "user-line",
	profile: "user-line",
	me: "user-line"
};

export const DEFAULT_TABBAR_MENUS: TabbarMenuItem[] = [

];

/** 模块级 ref，避免 class 实例属性在 uvue 中响应式丢失 */
export const tabbarMenus = ref<TabbarMenuItem[]>(DEFAULT_TABBAR_MENUS.slice());
export const tabbarLoaded = ref(false);
export const tabbarLoading = ref(false);

export function normalizeTabPath(raw: string): string {
	let text = `${raw}`.trim();
	if (text == "") {
		return "";
	}
	const hashIdx = text.indexOf("#");
	if (hashIdx >= 0) {
		text = text.substring(hashIdx + 1);
	}
	const queryIdx = text.indexOf("?");
	if (queryIdx >= 0) {
		text = text.substring(0, queryIdx);
	}
	return text.startsWith("/") ? text : `/${text}`;
}

/** 读取当前 tab 页路由（兼容 H5 hash） */
export function readTabbarRoutePath(): string {
	let raw = "";
	// #ifdef H5
	if (typeof window != "undefined") {
		const hash = `${window.location.hash}`;
		const idx = hash.indexOf("/pages/");
		if (idx >= 0) {
			raw = hash.substring(idx);
		}
	}
	// #endif
	if (raw == "") {
		const pages = getCurrentPages();
		if (pages.length > 0) {
			const last = pages[pages.length - 1];
			const route = last.route;
			raw = route != null ? `${route}` : "";
		}
	}
	return normalizeTabPath(raw);
}

export function isTabPathActive(menuPath: string, currentPath: string): boolean {
	const menu = normalizeTabPath(menuPath);
	const current = normalizeTabPath(currentPath);
	if (menu == "" || current == "") {
		return false;
	}
	if (menu == current) {
		return true;
	}
	return current.startsWith(`${menu}/`);
}

/** 根据当前路由解析应高亮的 tab path */
export function resolveActiveTabPath(currentPath: string, menus: TabbarMenuItem[]): string {
	const current = normalizeTabPath(currentPath);
	if (current == "" || menus.length == 0) {
		return "";
	}
	for (let i = 0; i < menus.length; i++) {
		if (isTabPathActive(menus[i].path, current)) {
			return menus[i].path;
		}
	}
	for (let i = 0; i < menus.length; i++) {
		const key = menus[i].key;
		if (key == "") {
			continue;
		}
		const marker = `/tabbar/${key}/`;
		if (current.indexOf(marker) >= 0) {
			// 员工「我的」在 studio/my 下，勿把 studio 菜单误高亮
			if (
				key == "studio" &&
				(current == "/pages/tabbar/studio/my" || current.indexOf("/tabbar/studio/my/") >= 0)
			) {
				continue;
			}
			return menus[i].path;
		}
		if (
			(key == "my" || key == "me" || key == "profile") &&
			(
				current == "/pages/tabbar/my/index" ||
				current == "/pages/tabbar/studio/my")
		) {
			return menus[i].path;
		}
		if ((key == "operations" || key == "operation" || key == "business") && current.indexOf("/tabbar/business/") >= 0) {
			return menus[i].path;
		}
		if (key == "overview" && current.indexOf("/tabbar/home/") >= 0) {
			return menus[i].path;
		}
		if (
			(key == "income" || key == "revenue" || key == "profit") &&
			current.indexOf("/tabbar/income/") >= 0
		) {
			return menus[i].path;
		}
		if ((key == "ranking" || key == "rank") && current.indexOf("/tabbar/ranking/") >= 0) return menus[i].path;
	}
	return "";
}

function resolveMenuIcon(key: string, iconFromApi: string, path: string = "", title: string = ""): string {
	const menuTitle = title.trim();
	if (menuTitle == "首页") {
		return "home-2-line";
	}
	if (menuTitle == "收益台" || menuTitle == "收益") {
		return "layout-2-line";
	}
	const keyFallback = KEY_ICON_FALLBACK[key];
	if (keyFallback != null && `${keyFallback}`.trim() != "") {
		return `${keyFallback}`;
	}
	const apiIcon = iconFromApi.trim();
	if (apiIcon != "" && apiIcon.indexOf("http") != 0 && apiIcon.indexOf("/") != 0) {
		return apiIcon;
	}
	return "apps-line";
}

function toMenuInt(raw: any | null, fallback: number = 0): number {
	if (raw == null) {
		return fallback;
	}
	const n = parseInt(`${raw}`);
	return isNaN(n) ? fallback : n;
}

function isMenuArray(raw: any | null): boolean {
	if (raw == null) {
		return false;
	}
	if (raw instanceof Array) {
		return true;
	}
	return Array.isArray(raw);
}

function mapSystemMenuItem(raw: any): TabbarMenuItem | null {
	const row = raw as UTSJSONObject;
	let path = normalizeTabPath(`${row["path"] ?? ""}`);
	if (path == "") {
		return null;
	}
	const key = `${row["key"] ?? ""}`.trim();
	const title = `${row["title"] ?? ""}`.trim();
	const iconRaw = `${row["icon"] ?? ""}`.trim();
	const iconActiveRaw = `${row["icon_active"] ?? row["iconActive"] ?? ""}`.trim();
	const displayTitle = title != "" ? title : key;
	return {
		id: toMenuInt(row["id"], 0),
		key: key,
		path: path,
		text: displayTitle,
		icon: resolveMenuIcon(key, iconRaw, path, displayTitle),
		iconUrl: iconRaw,
		iconActiveUrl: iconActiveRaw,
		badge: `${row["badge"] ?? ""}`.trim(),
		sort: toMenuInt(row["sort"], 0)
	};
}

export function parseMenusFromResponse(res: any | null): TabbarMenuItem[] {
	if (res == null) {
		return [];
	}
	const envelope = res as UTSJSONObject;
	const code = envelope["code"];
	if (code != null && !isApiSuccess(code)) {
		return [];
	}
	const data = (envelope["data"] ?? envelope) as UTSJSONObject | null;
	if (data == null) {
		return [];
	}
	const rawMenus = data["menus"];
	if (!isMenuArray(rawMenus)) {
		return [];
	}
	const list = rawMenus as any[];
	const mapped: TabbarMenuItem[] = [];
	for (let i = 0; i < list.length; i++) {
		const item = mapSystemMenuItem(list[i]);
		if (item != null) {
			mapped.push(item);
		}
	}
	if (mapped.length == 0) {
		return [];
	}
	mapped.sort((a, b) => b.sort - a.sort);
	return mapped;
}

function applyMenus(parsed: TabbarMenuItem[]) {
	if (parsed.length > 0) {
		const menus = parsed.slice();
		let hasRanking = false;
		let enterpriseMenu = false;
		for (let i = 0; i < menus.length; i++) {
			if (menus[i].key == "ranking" || menus[i].path == "/pages/tabbar/ranking/index") hasRanking = true;
			if (menus[i].key == "overview" || menus[i].key == "operations" || menus[i].key == "business") enterpriseMenu = true;
		}
		if (enterpriseMenu && !hasRanking) {
			let insertIndex = menus.length;
			for (let i = 0; i < menus.length; i++) {
				if (menus[i].key == "my" || menus[i].key == "profile" || menus[i].key == "me") { insertIndex = i; break; }
			}
			menus.splice(insertIndex, 0, { id: -100, key: "ranking", path: "/pages/tabbar/ranking/index", text: "排行榜", icon: "trophy-line", iconUrl: "", iconActiveUrl: "", badge: "", sort: 0 });
		}
		tabbarMenus.value = menus;
	}
}

export function applyAppSystemResponse(res: any | null) {
	applyMenus(parseMenusFromResponse(res));
	tabbarLoaded.value = true;
}

/** 邀请加入页是否在前台（由 pages/join/invite 维护） */
export const joinInvitePageActive = ref(false);

/** 当前 tab 路由，供 custom-tabbar 高亮（由各 tab 页 onShow 刷新） */
export const tabbarRoutePath = ref<string>("");

export function syncTabbarRoutePath() {
	tabbarRoutePath.value = readTabbarRoutePath();
}

export class Tabbar {
	menus = tabbarMenus;
	loaded = tabbarLoaded;
	loading = tabbarLoading;
	private loadTask: Promise<void> | null = null;

	load(force: boolean = false): Promise<void> {
		// 邀请加入 / 企业号申请页无需底部菜单配置，不请求 /api/app/system
		if (joinInvitePageActive.value || router.shouldSkipAppSystem()) {
			return Promise.resolve();
		}
		if (this.loadTask != null) {
			return this.loadTask;
		}
		if (this.loaded.value && !force && this.menus.value.length > 0) {
			return Promise.resolve();
		}
		this.loading.value = true;
		this.loadTask = getAppSystem()
			.then((res) => {
				applyMenus(parseMenusFromResponse(res));
				this.loaded.value = true;
			})
			.catch((_err) => {
				if (this.menus.value.length == 0) {
					this.menus.value = DEFAULT_TABBAR_MENUS.slice();
				}
			})
			.finally(() => {
				this.loading.value = false;
				this.loadTask = null;
			});
		return this.loadTask!;
	}

	reset() {
		this.menus.value = DEFAULT_TABBAR_MENUS.slice();
		this.loaded.value = false;
	}
}

export const tabbar = new Tabbar();

let navigatingToFirstMenu = false;

/** 按菜单 path 跳转（tab 用 switchTab，其余 reLaunch） */
export function pushToMenuPath(path: string) {
	const normalized = path.trim();
	if (normalized == "") {
		router.push({
			path: TABBAR_HOME_PATH,
			mode: "switchTab"
		});
		return;
	}
	const pathOnly = normalized.split("?")[0];
	if (router.isTabPage(pathOnly)) {
		router.push({
			path: pathOnly,
			mode: "switchTab"
		});
		return;
	}
	router.push({
		path: normalized.startsWith("/") ? normalized : `/${normalized}`,
		mode: "reLaunch"
	});
}

/** 未登录或非邀请场景：拉取 /api/app/system，进入 menus 第一项 */
export function navigateToFirstMenu(): Promise<void> {
	if (router.shouldSkipAppSystem()) {
		return Promise.resolve();
	}
	if (navigatingToFirstMenu) {
		return Promise.resolve();
	}
	navigatingToFirstMenu = true;
	return tabbar
		.load(true)
		.then(() => {
			const menus = tabbar.menus.value;
			if (menus.length > 0) {
				pushToMenuPath(menus[0].path);
				return;
			}
			pushToMenuPath(TABBAR_HOME_PATH);
		})
		.catch((_err) => {
			pushToMenuPath(TABBAR_HOME_PATH);
		})
		.finally(() => {
			navigatingToFirstMenu = false;
		});
}
