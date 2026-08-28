import { computed, ref } from "vue";
import { forInObject, isNull, isObject, parse } from "../utils";
import { readStoredToken } from "../utils/auth";
import { storage } from "../utils/storage";
import { router } from "../router";
import { request } from "../service/core";
import { registerSessionClear } from "../service/authSession";
import { markLoginGrace as setLoginGraceUntil, isInLoginGrace as checkLoginGrace } from "../service/loginGrace";
import { redirectToLoginIfNeeded } from "../service/sessionRedirect";
import { getUserInfo, getUserProfile } from "../api/login";
import { navigateToFirstMenu, tabbar } from "./tabbar";
import type { UserInfo } from "../types";
import type { LoginResponseData } from "../types/login";

export type Token = {
	token: string;
	expire: number;
	refreshToken: string;
	refreshExpire: number;
};

export class User {
	info = ref<UserInfo | null>(null);
	token: string | null = null;
	constructor() {
		this.hydrateLocalProfile();
	}

	markLoginGrace(durationMs: number = 5000) {
		setLoginGraceUntil(durationMs);
	}

	isInLoginGrace(): boolean {
		return checkLoginGrace();
	}

	mapLoginData(data: LoginResponseData) {
		return {
			unionid: data.unionid ?? "",
			id: (data.user_id ?? data.id ?? data.sn ?? 0) as number,
			nickName: data.nickname ?? data.nickName ?? "",
			avatarUrl: data.avatar ?? data.avatarUrl ?? "",
			phone: data.mobile ?? data.phone ?? "",
			gender: data.gender ?? 0,
			status: data.status ?? 1,
			description: data.description ?? "",
			loginType: data.loginType ?? 1,
			province: data.province ?? "",
			city: data.city ?? "",
			district: data.district ?? "",
			birthday: data.birthday ?? "",
			createTime: data.create_time ?? data.createTime ?? "",
			updateTime: data.update_time ?? data.updateTime ?? ""
		} as UserInfo;
	}

	hydrateLocalProfile() {
		const token = readStoredToken();
		this.token = token;
		const userInfo = storage.get("userInfo");
		if (userInfo != null && isObject(userInfo)) {
			this.info.value = this.mapLoginData(userInfo as unknown as LoginResponseData);
		}
	}

	setAccessToken(token: string) {
		this.token = token;
		uni.setStorageSync("token", token);
		uni.removeStorageSync("token_deadtime");
		uni.removeStorageSync("refreshToken");
		uni.removeStorageSync("refreshToken_deadtime");
	}

	pickToken(obj: UTSJSONObject | null): string | null {
		if (obj == null) {
			return null;
		}
		const keys = ["token", "access_token", "accessToken"];
		for (let i = 0; i < keys.length; i++) {
			const val = obj[keys[i]] as string | null;
			if (val != null && `${val}`.trim() != "") {
				return `${val}`.trim();
			}
		}
		const tokenInfo = obj["token_info"] as UTSJSONObject | null;
		if (tokenInfo != null) {
			const nested = this.pickToken(tokenInfo);
			if (nested != null) {
				return nested;
			}
		}
		const user = obj["user"] as UTSJSONObject | null;
		if (user != null) {
			const nested = this.pickToken(user);
			if (nested != null) {
				return nested;
			}
		}
		return null;
	}

	extractToken(res: any): string | null {
		if (res == null) {
			return null;
		}
		const envelope = res as UTSJSONObject;
		const payload = (envelope["data"] ?? envelope["result"] ?? envelope) as UTSJSONObject;
		const fromPayload = this.pickToken(payload);
		if (fromPayload != null) {
			return fromPayload;
		}
		return this.pickToken(envelope);
	}

	applyLoginResponse(res: any): boolean {
		if (res == null) {
			return false;
		}
		const token = this.extractToken(res);
		if (token == null || token == "") {
			return false;
		}
		const envelope = res as UTSJSONObject;
		let dataRaw = (envelope["data"] ?? envelope["result"]) as UTSJSONObject | null;
		if (dataRaw == null) {
			dataRaw = {} as UTSJSONObject;
		}
		let profileRaw: UTSJSONObject;
		const nestedUser = dataRaw["user"] as UTSJSONObject | null;
		if (nestedUser != null) {
			profileRaw = nestedUser;
		} else {
			profileRaw = dataRaw;
		}
		profileRaw["token"] = token;
		dataRaw["token"] = token;
		if (nestedUser != null) {
			dataRaw["user"] = profileRaw;
		}
		envelope["data"] = dataRaw;
		this.setAccessToken(token);
		uni.setStorageSync("loginPayload", JSON.stringify(envelope));
		uni.setStorageSync("userInfo", profileRaw);
		storage.set("userInfo", profileRaw, 0);
		this.info.value = this.mapLoginData(profileRaw as unknown as LoginResponseData);
		this.markLoginGrace();
		return true;
	}

	/** GET /api/oauth/authorize 预检：保存返回的 token 与 user */
	applyOAuthAuthorizeResponse(res: any): boolean {
		if (res == null) {
			return false;
		}
		const envelope = res as UTSJSONObject;
		const data = (envelope["data"] ?? envelope) as UTSJSONObject;
		let saved = false;
		const token = this.extractToken(res);
		if (token != null && token != "") {
			this.setAccessToken(token);
			uni.setStorageSync("loginPayload", JSON.stringify(envelope));
			saved = true;
		}
		const userObj = data["user"] as LoginResponseData | null;
		if (userObj != null) {
			storage.set("userInfo", userObj, 0);
			uni.setStorageSync("userInfo", userObj);
			this.info.value = this.mapLoginData(userObj);
			saved = true;
		}
		if (saved) {
			tabbar.load(true);
		}
		return saved;
	}

	applyProfileResponse(res: any): boolean {
		if (res == null) {
			return false;
		}
		const envelope = res as UTSJSONObject;
		const code = envelope["code"];
		if (code != null && code != 1 && `${code}` != "1") {
			return false;
		}
		const data = (envelope["data"] ?? res) as LoginResponseData;
		const profile = (data["user"] ?? data) as LoginResponseData;
		if (profile == null) {
			return false;
		}
		storage.set("userInfo", profile, 0);
		uni.setStorageSync("userInfo", profile);
		this.info.value = this.mapLoginData(profile);
		return true;
	}

	fetchProfile(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.token == null || this.token == "") {
				reject({ msg: "未登录" } as UTSJSONObject);
				return;
			}
			getUserProfile()
				.then((res) => {
					if (!this.applyProfileResponse(res)) {
						reject({ msg: "获取个人信息失败" } as UTSJSONObject);
						return;
					}
					resolve();
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	async get() {
		if (this.token == null) {
			return;
		}
		await getUserInfo()
			.then((res) => {
				if (res == null) {
					return;
				}
				const envelope = res as UTSJSONObject;
				const data = (envelope["data"] ?? res) as LoginResponseData;
				if (data != null) {
					uni.setStorageSync("userInfo", data);
					this.info.value = this.mapLoginData(data);
				}
			})
			.catch(() => {});
	}

	set(data: any) {
		if (isNull(data)) {
			return;
		}
		this.info.value = parse<UserInfo>(data)!;
		storage.set("userInfo", data, 0);
	}

	async update(data: any) {
		if (isNull(data) || isNull(this.info.value)) {
			return;
		}
		forInObject(data, (value, key) => {
			this.info.value![key] = value;
		});
		await request({
			url: "/app/user/info/updatePerson",
			method: "POST",
			data
		});
	}

	remove() {
		this.info.value = null;
		storage.remove("userInfo");
	}

	isNull() {
		return this.info.value == null;
	}

	isLoggedIn() {
		if (this.token != null && this.token != "") {
			return true;
		}
		this.hydrateLocalProfile();
		return this.token != null && this.token != "";
	}

	handleSessionExpired(tip: string | null = null) {
		redirectToLoginIfNeeded(tip);
	}

	requireLogin() {
		if (this.isLoggedIn()) {
			return true;
		}
		const path =
			router.path() != "" ? router.path() : router.resolveRoutePathHint();
		if (router.isPublicPage(path)) {
			return false;
		}
		if (!router.isJoinInvitePage(path)) {
			return false;
		}
		const redirectPath = router.captureLoginRedirect();
		redirectToLoginIfNeeded("请先登录", redirectPath);
		return false;
	}

	clear() {
		tabbar.reset();
		storage.remove("userInfo");
		storage.remove("loginPayload");
		storage.remove("token");
		storage.remove("refreshToken");
		uni.removeStorageSync("token_deadtime");
		uni.removeStorageSync("refreshToken_deadtime");
		this.token = null;
		this.remove();
	}

	logout() {
		this.clear();
		if (router.isJoinInvitePage()) {
			router.login();
			return;
		}
		navigateToFirstMenu();
	}

	setToken(data: Token) {
		this.token = data.token;
		storage.set("token", data.token, data.expire - 5);
		storage.set("refreshToken", data.refreshToken, data.refreshExpire - 5);
	}

	refreshToken(): Promise<string> {
		return new Promise((resolve, reject) => {
			request({
				url: "/app/user/login/refreshToken",
				method: "POST",
				data: {
					refreshToken: storage.get("refreshToken")
				}
			})
				.then((res) => {
					if (res != null) {
						const body = res as UTSJSONObject;
						const payload = body["data"] ?? res;
						const token = parse<Token>(payload);
						if (token != null) {
							this.setToken(token);
							resolve(token.token);
						}
					}
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
}

export const user = new User();
export const userInfo = computed(() => user.info.value);

registerSessionClear(() => user.clear());
