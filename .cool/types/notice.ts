/** GET /api/notice → data[] 单项 */
export type AppNoticeItem = {
	type: string;
	title: string;
	content: string;
	path: string;
};
