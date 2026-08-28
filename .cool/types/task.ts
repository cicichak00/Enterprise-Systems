import type { KeywordSubmitFormItem } from "./keyword";

export type TaskListParams = {
	page?: number;
	limit?: number;
	keyword?: string;
	category_id?: number;
};

/** GET /api/task 列表项 */
export type TaskListItem = {
	id?: number;
	category_id?: number;
	category_text?: string;
	type?: number;
	type_text?: string;
	project_id?: number;
	title?: string;
	logo?: string;
	logo_url?: string;
	is_keyword?: number;
	is_pulish?: number;
	is_batch_back?: number;
	/** 任务项类型，如 compose 组合提词 */
	item_type?: string;
	source?: number;
	status?: number;
	status_text?: string;
	enterprise?: UTSJSONObject | null;
	create_time?: string;
	update_time?: string;
};

/** GET /api/task/detail 查询参数 */
export type TaskDetailParams = {
	id: number;
	page?: number;
	limit?: number;
	keyword?: string;
};

/** GET /api/task/detail list 项（海外故事/短剧） */
export type NovelDetailListItem = {
	id?: number;
	book_logo?: string;
	book_name?: string;
	content?: string;
	[key: string]: any;
};

/** GET /api/task/storyDetail 查询参数 */
export type StoryDetailParams = {
	id: number;
	project_id: number;
};

/** GET /api/task/storyDetail 详情 */
export type StoryDetail = {
	id?: number;
	book_logo?: string;
	book_name?: string;
	code?: string;
	codes?: string[];
	max_code_count?: number;
	tags?: string;
	category_name?: string;
	en_text?: string;
	introduce?: string;
	content?: string;
	img_url?: string;
	spread_url?: string;
	episodes_list?: StoryEpisodeItem[];
	project_info?: string;
	order_info?: string;
	settlement_info?: string;
	special_info?: string;
	[key: string]: any;
};

export type StoryEpisodeItem = {
	content?: string;
	[key: string]: any;
};

export type TaskListPayload = {
	list: TaskListItem[];
	count: number;
};

export type TaskProjectDesc = {
	tag?: string | string[];
	en_name?: string;
	subtitle?: string;
	notice?: string;
	details?: string;
	title_tag?: string;
	pay_way?: TaskPayWayItem[];
	imp_rule?: string;
};

/** 收益项（对齐 overseas projectDetail.pay_way） */
export type TaskPayWayItem = {
	title?: string;
	subtitle?: string;
	value?: number | string;
	is_ratio?: number;
};

export type TaskPayWayDisplay = {
	title: string;
	priceText: string;
};

export type TaskProjectNotice = {
	title?: string;
	desc?: string;
	content?: string;
	image?: string;
	url?: string;
	cover?: string;
};

/** GET /api/task/detail（字段与 overseas task-details / projectDetail 对齐） */
export type TaskDetail = {
	id?: number;
	category_id?: number;
	category_text?: string;
	type?: number;
	type_text?: string;
	project_id?: number;
	title?: string;
	subtitle?: string;
	logo?: string;
	logo_url?: string;
	is_keyword?: number;
	is_pulish?: number;
	status?: number;
	status_text?: string;
	title_tag?: string;
	tag?: string[] | string;
	pay_way?: TaskPayWayItem[];
	imp_rule?: string;
	time?: string;
	project_notice?: TaskProjectNotice | string;
	project_desc?: TaskProjectDesc;
	project_info?: string;
	keyword_info?: string;
	back_info?: string;
	order_info?: string;
	settlement_info?: string;
	special_info?: string;
	details?: string;
	course_url?: string;
	virtual_profit?: string;
	job_num?: UTSJSONObject | null;
	en_name?: string;
	create_time?: string;
	update_time?: string;
	[key: string]: any;
};

export type TaskDetailCollapseItem = {
	key: string;
	title: string;
	html: string;
	open: boolean;
	mustRead: boolean;
};

export type TaskDetailTabItem = {
	id: number;
	title: string;
	sub: string;
	mode: string;
};

/** 参与记录筛选：不传=全部；0待审核 1已审核 2审核驳回 3已失效(即将过期) */
export type TaskParticipationStatusKey =
	| "all"
	| "reviewing"
	| "approved"
	| "expiring"
	| "rejected";

export type TaskParticipationListParams = {
	task_id?: number;
	project_id?: number;
	status?: string;
	page?: number;
	limit?: number;
};

export type TaskParticipationItem = {
	id?: number;
	keyword?: string;
	title?: string;
	create_time?: string;
	expire_time?: string;
	audit_feedback?: string;
	audit_feedback_text?: string;
	book_name?: string;
	book_title?: string;
	account_name?: string;
	account_id?: string | number;
	status?: number | string;
	status_key?: string;
	[key: string]: any;
};

export type TaskParticipationStat = {
	all?: number;
	reviewing?: number;
	approved?: number;
	expiring?: number;
	rejected?: number;
	invalid?: number;
};

export type TaskParticipationListPayload = {
	list: TaskParticipationItem[];
	count: number;
	stat?: TaskParticipationStat;
};

/** 动态表单字段（对齐 overseas keyword_add formField） */
export type TaskRawFormField = {
	id: string;
	/** 业务判断用（book_name 等），优先 formFields 的 value，否则 field/key */
	field: string;
	/** 提交 form_info.field，固定取 formFields 接口返回的 value */
	submitField: string;
	name: string;
	type: number;
	value: string;
	is_empty: number;
	is_hide: number;
	is_copy: number;
	var_type: number;
	max_len: number;
	typeList: string[];
	/** 选项来源：platform_account 表示平台账号下拉 */
	optionsProvider: string;
	relation_field: TaskRawFormField[];
	relation_value: string[];
	front_msg: string;
	front_msg_copy: string;
	previewUrl: string;
	multiUrls: string[];
	/** capcut/tiktok 主页链接解析后自动填充标记 */
	linkFilledBy?: string;
};

export type TaskFormAccountItem = {
	account_id: string;
	account_title: string;
	platform_name: string;
};

export type TaskFormNameItem = {
	name: string;
};

export type TaskFormParams = {
	task_id?: number;
	project_id?: number;
};

/** GET /api/task/formFields 查询参数 */
export type TaskFormFieldsParams = {
	/** 任务(项目) ID */
	id: number;
	/** keyword | publish，参与表单固定 keyword */
	type?: string;
};

/** GET /api/publish 查询参数 */
export type PublishListParams = {
	project_id: number;
	page?: number;
	limit?: number;
	/** 关键词记录 ID（从参与记录进入时传入） */
	keyword_id?: number;
};

/** GET /api/publish → list 项 */
export type PublishListItem = {
	id?: number;
	title?: string;
	keyword?: string;
	video_url?: string;
	create_time?: string;
	publish_platform?: string;
	account_name?: string;
	account_id?: string | number;
	status?: number | string;
	status_text?: string;
	feedback_status?: string | number;
	feedback_msg?: string;
	expand?: UTSJSONObject[];
	[key: string]: any;
};

export type PublishListPayload = {
	list: PublishListItem[];
	total: number;
	page?: number;
	limit?: number;
};

/** POST /api/publish/submit */
export type PublishSubmitParams = {
	project_id: string | number;
	keyword_id: string | number;
	/** 每组作品一行 */
	form_info: KeywordSubmitFormItem[][];
};

export type TaskFormSubmitField = {
	id: string;
	field: string;
	name: string;
	value: string;
	type: number;
	[key: string]: any;
};

export type TaskFormSubmitParams = {
	task_id?: number;
	project_id?: number;
	/** 扁平化后的多组表单（对齐 KeywordV5/add 的 formData） */
	formData?: TaskFormSubmitField[][];
	form_data?: TaskFormSubmitField[];
};
