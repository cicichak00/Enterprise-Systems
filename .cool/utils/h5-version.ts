/** H5 发版后检测远端 version.json / index.html，提示用户刷新以加载新版本 */

declare const __APP_BUILD_VERSION__: string;

const CHECK_INTERVAL_MS = 60 * 1000;
const VERSION_JSON_NAME = "version.json";
const INDEX_HTML_NAME = "index.html";

let checking = false;
let chunkCheckPending = false;
let timer: number | null = null;
let localBuildVersion = "";

type VersionRequestResult = {
	statusCode: number;
	body: string;
};

function getInlineChecker(): any | null {
	// #ifdef H5
	const checker = (window as any)["__h5CheckVersion"];
	if (checker != null && typeof checker == "function") {
		return checker;
	}
	// #endif
	return null;
}

function getInlineModal(): any | null {
	// #ifdef H5
	const showModal = (window as any)["__h5ShowUpdateModal"];
	if (showModal != null && typeof showModal == "function") {
		return showModal;
	}
	// #endif
	return null;
}

function hasInlineVersionWatch(): boolean {
	return getInlineChecker() != null;
}

function getLocalBuildVersion(): string {
	// #ifdef H5
	const fromDefine = `${__APP_BUILD_VERSION__}`;
	if (fromDefine != "" && fromDefine != "dev" && fromDefine != "undefined") {
		return fromDefine;
	}
	// #endif
	return "";
}

function resolveRuntimeBuildVersion(): string {
	if (localBuildVersion != "") {
		return localBuildVersion;
	}
	const buildVersion = getLocalBuildVersion();
	if (buildVersion != "" && buildVersion != "dev") {
		localBuildVersion = buildVersion;
	}
	return localBuildVersion;
}

function resolveAssetBaseUrl(): string {
	const href = `${window.location.href}`;
	const hashIndex = href.indexOf("#");
	const baseHref = hashIndex >= 0 ? href.substring(0, hashIndex) : href;
	return new URL("./", baseHref).href;
}

function buildCacheBustUrl(fileName: string): string {
	const url = new URL(fileName, resolveAssetBaseUrl());
	url.searchParams.set("t", `${Date.now()}`);
	url.searchParams.set("r", `${Math.random()}`);
	return url.href;
}

function extractBuildVersionFromHtml(html: string): string {
	const metaMatch = html.match(/app-build-version["']\s+content=["']([^"']+)["']/);
	if (metaMatch != null && metaMatch.length > 1) {
		return metaMatch[1]!;
	}
	return "";
}

function extractEntryHashFromHtml(html: string): string {
	const scriptMatch = html.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/i);
	if (scriptMatch != null && scriptMatch.length > 1) {
		return scriptMatch[1]!;
	}
	return "";
}

function requestText(url: string): Promise<VersionRequestResult> {
	return new Promise((resolve) => {
		// #ifdef H5
		try {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			xhr.setRequestHeader("Pragma", "no-cache");
			xhr.onload = function () {
				const statusCode = xhr.status;
				if (statusCode == 200) {
					resolve({ statusCode: statusCode, body: xhr.responseText ?? "" });
					return;
				}
				resolve({ statusCode: statusCode, body: "" });
			};
			xhr.onerror = function () {
				resolve({ statusCode: 0, body: "" });
			};
			xhr.send();
		} catch (_e) {
			resolve({ statusCode: 0, body: "" });
		}
		// #endif
		// #ifndef H5
		resolve({ statusCode: 0, body: "" });
		// #endif
	});
}

function parseVersionJson(body: string): string {
	const text = body.trim();
	if (text == "" || text.startsWith("<")) {
		return "";
	}
	try {
		const data = JSON.parse(text);
		if (data == null || typeof data != "object") {
			return "";
		}
		const version = (data as any)["version"];
		return version != null ? `${version}` : "";
	} catch (_e) {
		return "";
	}
}

type RemoteSnapshot = {
	version: string;
	entryHash: string;
};

async function fetchRemoteSnapshot(): Promise<RemoteSnapshot> {
	let version = "";
	let entryHash = "";

	const versionRes = await requestText(buildCacheBustUrl(VERSION_JSON_NAME));
	if (versionRes.statusCode == 200 && versionRes.body != "") {
		version = parseVersionJson(versionRes.body);
	}

	const indexRes = await requestText(buildCacheBustUrl(INDEX_HTML_NAME));
	if (indexRes.statusCode == 200 && indexRes.body != "") {
		if (version == "") {
			version = extractBuildVersionFromHtml(indexRes.body);
		}
		entryHash = extractEntryHashFromHtml(indexRes.body);
	}

	return { version: version, entryHash: entryHash };
}

/** 仅当远端版本明确更新时提示；请求失败或旧缓存不弹窗 */
function shouldUpdate(localVersion: string, remoteVersion: string, _remoteHash: string): boolean {
	if (remoteVersion == "" || localVersion == "") {
		return false;
	}
	const remoteNum = Number(remoteVersion);
	const localNum = Number(localVersion);
	if (!isNaN(remoteNum) && !isNaN(localNum)) {
		return remoteNum > localNum;
	}
	return remoteVersion != localVersion;
}

function promptReload(): void {
	// #ifdef H5
	const showModal = getInlineModal();
	if (showModal != null) {
		showModal();
		return;
	}
	location.reload();
	// #endif
}

function isChunkLoadError(message: string): boolean {
	return (
		message.includes("Failed to fetch dynamically imported module") ||
		message.includes("Loading chunk") ||
		message.includes("Importing a module script failed") ||
		message.includes("error loading dynamically imported module")
	);
}

async function runFallbackVersionCheck(): Promise<void> {
	const localVersion = resolveRuntimeBuildVersion();
	if (localVersion == "" || localVersion == "dev") {
		return;
	}
	if (checking) {
		return;
	}
	checking = true;
	try {
		const remote = await fetchRemoteSnapshot();
		if (shouldUpdate(localVersion, remote.version, remote.entryHash)) {
			console.warn("[h5-version] update detected", {
				localVersion: localVersion,
				remoteVersion: remote.version,
				remoteHash: remote.entryHash
			});
			promptReload();
		}
	} catch (_e) {
		// 网络异常时忽略
	} finally {
		checking = false;
	}
}

/** chunk 失败时先确认远端是否真有新版本，避免弱网误弹 */
async function confirmUpdateAfterChunkError(): Promise<void> {
	if (chunkCheckPending) {
		return;
	}
	chunkCheckPending = true;
	try {
		const localVersion = resolveRuntimeBuildVersion();
		if (localVersion == "" || localVersion == "dev") {
			return;
		}
		const remote = await fetchRemoteSnapshot();
		if (shouldUpdate(localVersion, remote.version, remote.entryHash)) {
			console.warn("[h5-version] chunk error + update confirmed", {
				localVersion: localVersion,
				remoteVersion: remote.version
			});
			promptReload();
		} else {
			console.warn("[h5-version] chunk error ignored (no newer remote version)");
		}
	} catch (_e) {
		// ignore
	} finally {
		chunkCheckPending = false;
	}
}

export async function checkH5VersionUpdate(): Promise<void> {
	// #ifdef H5
	const checker = getInlineChecker();
	if (checker != null) {
		checker();
		return;
	}
	await runFallbackVersionCheck();
	// #endif
}

export function initH5VersionWatch(): void {
	// #ifdef H5
	const localVersion = resolveRuntimeBuildVersion();
	if (localVersion == "" || localVersion == "dev") {
		return;
	}

	if (!hasInlineVersionWatch()) {
		checkH5VersionUpdate();
		if (timer == null) {
			timer = setInterval(() => {
				checkH5VersionUpdate();
			}, CHECK_INTERVAL_MS) as unknown as number;
		}

		window.addEventListener(
			"error",
			(event) => {
				const msg = `${event.message ?? ""}`;
				if (isChunkLoadError(msg)) {
					confirmUpdateAfterChunkError();
				}
			},
			true
		);

		window.addEventListener("unhandledrejection", (event) => {
			const reason = `${event.reason ?? ""}`;
			if (isChunkLoadError(reason)) {
				confirmUpdateAfterChunkError();
			}
		});
	}

	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState == "visible") {
			checkH5VersionUpdate();
		}
	});
	// #endif
}
