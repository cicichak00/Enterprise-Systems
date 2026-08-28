import { getMessageList } from "../api/message";
import { isApiSuccess } from "../index";
import type { Response } from "../service/core";

export function parseMessageUnreadCount(res: any | null): number {
	if (res == null) {
		return 0;
	}
	const envelope = res as UTSJSONObject;
	const data = envelope["data"] ?? envelope;
	if (data == null) {
		return 0;
	}
	const obj = data as UTSJSONObject;
	const raw = obj["unread_count"] ?? obj["unreadCount"];
	if (raw == null) {
		return 0;
	}
	const n = parseInt(`${raw}`);
	return isNaN(n) ? 0 : n;
}

export function formatMessageUnreadBadgeText(count: number): string {
	if (count > 99) {
		return "99+";
	}
	return `${count}`;
}

export function fetchMessageUnreadCount(): Promise<number> {
	return getMessageList({
		page: 1,
		limit: 1
	})
		.then((res) => {
			const envelope = res as Response | null;
			if (envelope != null && envelope.code != null && !isApiSuccess(envelope.code)) {
				return 0;
			}
			return parseMessageUnreadCount(res);
		})
		.catch((_err) => 0);
}
