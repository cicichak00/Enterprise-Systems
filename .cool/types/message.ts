/** 消息类型：0 普通，1 申请加入企业，2 加入申请审核结果 */
export type MessageType = 0 | 1 | 2;

/** GET /api/message 查询参数 */
export type MessageListParams = {
	page?: number;
	limit?: number;
	is_read?: number | string;
	type?: number | string;
};

/** GET /api/message → data.list 项 */
export type MessageListItem = {
	id?: number;
	title?: string;
	content?: string;
	type?: number;
	type_text?: string;
	is_read?: number;
	create_time?: string;
	path?: string;
	[key: string]: any;
};

export type MessageListPayload = {
	list: MessageListItem[];
	count: number;
	total?: number;
	unread_count?: number;
	page?: number;
	limit?: number;
};

/** GET /api/message/detail → data */
export type MessageDetail = {
	id?: number;
	title?: string;
	content?: string;
	summary?: string;
	type?: number;
	type_text?: string;
	level?: number;
	level_text?: string;
	create_time?: string;
	time_text?: string;
	is_read?: number;
	read_time?: string;
	is_urgent?: boolean;
	is_top?: number;
	relation_id?: string;
	scope?: string;
	enterprise_id?: number;
	[key: string]: any;
};
