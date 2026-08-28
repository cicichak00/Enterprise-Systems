import { request } from "../service/core";
import { isApiSuccess } from "../utils/comm";
import type { AppNoticeItem } from "../types/notice";

/** 首页公告/提醒 GET /api/v1.enterprise.Message/notice */
export function getNotice() {
	return request({
		url: "/api/v1.enterprise.Message/notice",
		method: "GET"
	});
}

function pickNoticeField(row: UTSJSONObject, key: string): string {
	const val = row[key];
	return val != null ? `${val}`.trim() : "";
}

/** 解析 GET /api/v1.enterprise.Message/notice 的 data 数组 */
export function parseAppNoticeList(res: any | null): AppNoticeItem[] {
	if (res == null) {
		return [];
	}
	const envelope = res as UTSJSONObject;
	const code = envelope["code"];
	if (code != null && !isApiSuccess(code)) {
		return [];
	}
	const data = envelope["data"];
	if (data == null) {
		return [];
	}
	const arr = data as any[];
	if (arr.length == 0) {
		return [];
	}
	const list: AppNoticeItem[] = [];
	for (let i = 0; i < arr.length; i++) {
		const raw = arr[i];
		if (raw == null) {
			continue;
		}
		const row = raw as UTSJSONObject;
		const title = pickNoticeField(row, "title");
		const content = pickNoticeField(row, "content");
		const path = pickNoticeField(row, "path");
		if (title == "" && content == "") {
			continue;
		}
		const type = pickNoticeField(row, "type");
		list.push({
			type: type != "" ? type : "info",
			title: title != "" ? title : "提醒",
			content: content,
			path: path
		});
	}
	return list;
}
