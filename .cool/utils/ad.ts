import { router } from "../router";

/** 点击广告：link_type 为 0 或无 link 时不跳转 */
export function openAdLink(link: string | null | undefined, linkType: number | string | null | undefined) {
	const url = `${link ?? ""}`.trim();
	let typeNum = 0;
	if (typeof linkType == "number") {
		typeNum = linkType as number;
	} else if (linkType != null) {
		const parsed = parseInt(`${linkType}`);
		typeNum = isNaN(parsed) ? 0 : parsed;
	}
	if (url == "" || typeNum == 0) {
		return;
	}
	if (url.startsWith("/pages/") || (url.startsWith("/") && !url.startsWith("//"))) {
		router.push({ path: url });
	}
}
