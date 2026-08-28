import { buildCommonHeaders, resolveRequestUrl } from "../service/core";
import { readStoredToken } from "../utils/auth";
import { parseObject } from "../utils";

function isUploadSuccess(code: number | string | null | undefined): boolean {
	if (code == null) {
		return true;
	}
	return code == 0 || code == 1 || code == "0" || code == "1" || code == 200 || code == "200";
}

function toJSONObject(raw: any | null): UTSJSONObject | null {
	if (raw == null) {
		return null;
	}
	if (typeof raw == "string") {
		const trimmed = raw.trim();
		if (trimmed == "") {
			return null;
		}
		return parseObject<UTSJSONObject>(trimmed);
	}
	return raw as UTSJSONObject;
}

/** 从上传接口响应中取 data.url / data.uri */
export function getUploadImageUrl(raw: any | null): string | null {
	const envelope = toJSONObject(raw);
	if (envelope == null) {
		return null;
	}
	const data = envelope["data"] as UTSJSONObject | null;
	if (data == null) {
		return null;
	}
	const url = (data["url"] ?? data["uri"]) as string | null;
	if (url != null && `${url}`.trim() != "") {
		return `${url}`.trim();
	}
	return null;
}

function isBlobOrDataUrl(path: string): boolean {
	return path.indexOf("blob:") == 0 || path.indexOf("data:") == 0;
}

const ALLOWED_PICK_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

function getPickImageExtension(path: string): string {
	const base = path.split("?")[0].split("#")[0].trim().toLowerCase();
	const idx = base.lastIndexOf(".");
	if (idx < 0 || idx >= base.length - 1) {
		return "";
	}
	return base.substring(idx);
}

function isAllowedPickImageExtension(ext: string): boolean {
	if (ext == "") {
		return false;
	}
	const normalized = ext.startsWith(".") ? ext : `.${ext}`;
	for (let i = 0; i < ALLOWED_PICK_IMAGE_EXTENSIONS.length; i++) {
		if (normalized == ALLOWED_PICK_IMAGE_EXTENSIONS[i]) {
			return true;
		}
	}
	return false;
}

function isAllowedPickImageMime(mime: string): boolean {
	const m = mime.trim().toLowerCase();
	if (m == "") {
		return false;
	}
	return (
		m == "image/jpeg" ||
		m == "image/jpg" ||
		m == "image/pjpeg" ||
		m == "image/png" ||
		m == "image/x-png"
	);
}

function isTempPickImagePath(path: string): boolean {
	const lower = path.trim().toLowerCase();
	if (lower == "") {
		return false;
	}
	if (isBlobOrDataUrl(lower)) {
		return true;
	}
	return (
		lower.indexOf("wxfile://") == 0 ||
		lower.indexOf("file://") == 0 ||
		lower.indexOf("internal://") == 0 ||
		lower.indexOf("content://") == 0 ||
		lower.indexOf("_doc/") == 0 ||
		lower.indexOf("_www/") == 0
	);
}

/** 校验 chooseImage 结果是否为 JPG/JPEG/PNG（兼容 H5 blob、无后缀临时路径） */
export function isAllowedPickImage(
	path: string,
	fileName: string = "",
	mimeType: string = ""
): boolean {
	if (isAllowedPickImageMime(mimeType)) {
		return true;
	}
	const nameExt = fileName != "" ? getPickImageExtension(fileName) : "";
	if (nameExt != "") {
		return isAllowedPickImageExtension(nameExt);
	}
	// blob / 小程序临时路径等无可靠后缀，优先放行（避免 blob:http://127.0.0.1 被 IP 中的点误判）
	if (isTempPickImagePath(path)) {
		return true;
	}
	const pathExt = getPickImageExtension(path);
	if (pathExt != "") {
		return isAllowedPickImageExtension(pathExt);
	}
	return path.trim() != "";
}

/** 选图后尽量转为可展示路径（H5 blob 仅尝试 getImageInfo，失败则原样返回） */
export function normalizePickDisplayPath(path: string): Promise<string> {
	const trimmed = path.trim();
	if (trimmed == "") {
		return Promise.resolve("");
	}
	// #ifdef H5
	if (isBlobOrDataUrl(trimmed)) {
		return new Promise((resolve) => {
			uni.getImageInfo({
				src: trimmed,
				success: (info) => {
					const resolved = info.path;
					if (resolved != null && resolved != "" && !isBlobOrDataUrl(resolved)) {
						resolve(resolved);
						return;
					}
					resolve(trimmed);
				},
				fail: () => {
					resolve(trimmed);
				}
			});
		});
	}
	// #endif
	return Promise.resolve(trimmed);
}

/** 远程图片转本地路径，便于小程序 image 组件展示 */
export function toDisplayImageSrc(url: string): Promise<string> {
	const trimmed = url.trim();
	if (trimmed == "") {
		return Promise.resolve("");
	}
	const isRemote =
		trimmed.indexOf("https://") == 0 || trimmed.indexOf("http://") == 0;
	if (!isRemote) {
		return Promise.resolve(trimmed);
	}
	// #ifdef H5
	return Promise.resolve(trimmed);
	// #endif
	return new Promise((resolve) => {
		uni.downloadFile({
			url: trimmed,
			success: (res) => {
				if (res.statusCode == 200 && res.tempFilePath != "") {
					resolve(res.tempFilePath);
					return;
				}
				resolve(trimmed);
			},
			fail: () => {
				resolve(trimmed);
			}
		});
	});
}

/** 视频上传 POST /api/v1.enterprise.Upload/file（form-data，字段名 file） */
export function uploadVideo(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: resolveRequestUrl("/api/v1.enterprise.Upload/file"),
			filePath,
			name: "file",
			header: buildCommonHeaders(readStoredToken()),
			success(res) {
				if (res.statusCode == 401) {
					reject({ message: "无权限" });
					return;
				}
				if (res.statusCode != 200) {
					reject({ message: `上传失败(${res.statusCode})` });
					return;
				}
				const envelope = toJSONObject(res.data);
				if (envelope != null && envelope["code"] != null && !isUploadSuccess(envelope["code"] as number | string)) {
					reject({ message: (envelope["msg"] as string | null) ?? "上传失败" });
					return;
				}
				const url = getUploadImageUrl(res.data);
				if (url == null) {
					reject({ message: "上传失败：未返回视频地址" });
					return;
				}
				resolve(url);
			},
			fail(err) {
				reject({ message: err.errMsg ?? "上传失败" });
			}
		});
	});
}

/** 图片上传 POST /api/v1.enterprise.Upload/image（form-data，字段名 file） */
export function uploadImage(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: resolveRequestUrl("/api/v1.enterprise.Upload/image"),
			filePath,
			name: "file",
			header: buildCommonHeaders(readStoredToken()),
			success(res) {
				if (res.statusCode == 401) {
					reject({ message: "无权限" });
					return;
				}
				if (res.statusCode != 200) {
					reject({ message: `上传失败(${res.statusCode})` });
					return;
				}
				const envelope = toJSONObject(res.data);
				if (envelope != null && envelope["code"] != null && !isUploadSuccess(envelope["code"] as number | string)) {
					reject({ message: (envelope["msg"] as string | null) ?? "上传失败" });
					return;
				}
				const url = getUploadImageUrl(res.data);
				if (url == null) {
					reject({ message: "上传失败：未返回图片地址" });
					return;
				}
				resolve(url);
			},
			fail(err) {
				reject({ message: err.errMsg ?? "上传失败" });
			}
		});
	});
}
