/** GET /api/ad 单条广告 */
export type AdItem = {
	id?: number;
	title?: string;
	image?: string;
	link?: string;
	link_type?: number;
	link_type_text?: string;
	link_extra?: any[];
	sort?: number;
	[key: string]: any;
};

/** GET /api/ad 响应 data */
export type AdListData = {
	page_key?: string;
	position?: string;
	list?: AdItem[];
	total?: number;
	[key: string]: any;
};

export type AdQuery = {
	page_key: string;
	position?: string;
	limit?: number;
};
