/** GET /api/keyword/assignable → list 项 expand */
export type KeywordExpandItem = {
	name?: string;
	label?: string;
	field?: string;
	field_value?: string;
	value?: string;
	[key: string]: any;
};

/** GET /api/keyword/assignable → list 项 */
export type KeywordAssignableItem = {
	id?: number;
	enterprise_id?: number;
	project_id?: number;
	user_id?: number;
	keyword?: string;
	project_name?: string;
	project_title?: string;
	title?: string;
	status_text?: string;
	expand?: KeywordExpandItem[];
	create_time?: string;
	create_at?: string;
	created_at?: string;
	project?: any;
	[key: string]: any;
};

export type GetAssignableKeywordParams = {
	page?: number;
	limit?: number;
	keyword?: string;
	/** 企业主推广任务列表固定为 enterprise_all */
	scope?: string;
	/** 与企业主首页统计保持一致的时间范围 */
	period?: string;
	start_date?: string;
	end_date?: string;
};

/** GET /api/v1.enterprise.Virtual/keywordList 查询参数（虚拟订单可选关键词） */
export type GetVirtualKeywordListParams = {
	page?: number;
	limit?: number;
	keyword?: string;
};

/** 关键词列表 Tab：全部不传 status；0待审核 1已审核 2审核驳回 3已失效 */
export type KeywordListStatusKey = "all" | "reviewing" | "approved" | "expiring" | "rejected";

/** GET /api/keyword 查询参数 */
export type KeywordListParams = {
	/** 项目 ID（取链接参数 project_id） */
	project_id: number;
	page?: number;
	limit?: number;
	/** 0待审核 1已审核 2审核驳回 3已失效；不传为全部 */
	status?: string;
	/** 关键词搜索 */
	keyword?: string;
};

/** GET /api/keyword → list 项 expand（小说生成记录） */
export type KeywordListExpandObject = {
	story_id?: number | string;
	story_name?: string;
	[key: string]: any;
};

/** GET /api/keyword → 小说生成记录 list 项 */
export type GenerateRecordItem = {
	id?: number;
	keyword?: string;
	create_time?: string;
	expand?: KeywordListExpandObject;
};

/** GET /api/keyword → data.list 项 */
export type KeywordListItem = {
	id?: number;
	keyword?: string;
	title?: string;
	create_time?: string;
	expire_time?: string;
	expired_time?: string;
	expect_expire_time?: string;
	audit_feedback?: string;
	audit_feedback_text?: string;
	status?: number | string;
	status_text?: string;
	/** 是否开启回填（接口常见拼写 is_pulish） */
	is_pulish?: number;
	is_publish?: number;
	remark?: string;
	book_name?: string;
	story_name?: string;
	book_title?: string;
	account_name?: string;
	account_id?: string | number;
	user_book_name?: string;
	expand?: KeywordExpandItem[];
	[key: string]: any;
};

export type KeywordListPayload = {
	list: KeywordListItem[];
	total: number;
	page: number;
	limit: number;
};

/** POST /api/keyword/remove */
export type KeywordRemoveParams = {
	keyword_id: string | number;
};

/** POST /api/keyword/assign */
export type AssignKeywordParams = {
	project_id: string | number;
	keyword_id: number[];
	user_id: number;
};

/** POST /api/keyword/submit → form_info 单项 */
export type KeywordSubmitFormItem = {
	name: string;
	field: string;
	value: string;
};

/** GET /api/keyword/getCapcutLinkInfo */
export type CapcutLinkInfo = {
	uid?: string;
	username?: string;
	capcut_id?: string;
};

/** GET /api/keyword/getTiktokLinkInfo */
export type TiktokLinkInfo = {
	nickname?: string;
	tk_id?: string;
};

/** POST /api/keyword/submit */
export type KeywordSubmitParams = {
	project_id: string | number;
	/** 表单字段列表（二维数组：每组序号对应一行） */
	form_info: KeywordSubmitFormItem[][];
};

/** POST /api/v1.enterprise.keyword/editRejected */
export type KeywordEditRejectedParams = {
	project_id: number;
	/** 企业号关键词 ID */
	id: number;
	form_info: KeywordSubmitFormItem[][];
};

/** GET /api/v1.enterprise.keyword/userRequiredFields 查询参数 */
export type KeywordUserRequiredFieldsParams = {
	project_id: number;
	keyword_id: number;
};

/** GET /api/v1.enterprise.keyword/userRequiredFields → data */
export type KeywordUserRequiredFieldsData = {
	id?: number;
	/** 动态字段，键与 form_config 的 field 对齐 */
	fields?: UTSJSONObject;
};

/** POST /api/keyword/initSelectData */
export type KeywordInitSelectParams = {
	id: number;
	project_id: number;
};

export type KeywordPublishAccountItem = {
	id?: number | string;
	account_title?: string;
	platform_name?: string;
	[key: string]: any;
};

/** 作品回填表单行（legacy） */
export type KeywordPublishFormRow = {
	video_url: string;
	play_num: number;
	like_num: number;
	publish_platform: string;
	account_name: string;
	account_id: string;
	publish_time: string;
	media_image: string[];
	media_video: string[];
	[key: string]: any;
};

/** POST /api/keyword/publish */
export type KeywordPublishSubmitParams = {
	keywordInfo: UTSJSONObject;
	is_add: number;
	/** legacy 为 JSON 字符串；动态表单为数组 */
	formData: string | KeywordPublishFormRow[];
};

/** GET /api/publish/batchIdentify → data.list 项 */
export type KeywordFillResultItem = {
	video_url?: string;
	tk_uid?: string;
	keyword?: string;
	keyword_name?: string;
	keyword_id?: number;
	result?: string;
	status?: string;
	[key: string]: any;
};

/** GET /api/publish/batchIdentify → data.form_list 项（动态表单提交参数） */
export type KeywordFillFormItem = {
	project_id?: number;
	keyword_id?: number;
	form_info?: any[][];
	[key: string]: any;
};

/** GET /api/publish/batchIdentify → data */
export type KeywordIsFillResult = {
	all_num?: number;
	success_num?: number;
	error_num?: number;
	all_list?: KeywordFillResultItem[];
	success_list?: KeywordFillResultItem[];
	error_list?: KeywordFillResultItem[];
	error_url?: string;
	form_list?: KeywordFillFormItem[];
};

/** POST /api/keyword/publishList → data 项 */
export type KeywordPublishListItem = {
	keyword?: string;
	keyword_id?: number;
	video_url?: string;
};

/** POST /api/keyword/publishList */
export type KeywordPublishListParams = {
	project_id: number;
	data: KeywordPublishListItem[];
};

/** POST /api/v1.enterprise.Publish/parseVideoUrl 请求 */
export type ParseVideoUrlParams = {
	project_id: number;
	video_url: string[];
};

/** POST /api/v1.enterprise.Publish/parseVideoUrl → data 列表项 */
export type ParseVideoUrlItem = {
	video_url?: string;
	url?: string;
	video_id?: string;
	success?: boolean | number;
	result?: string;
	status?: string;
	msg?: string;
	message?: string;
	error?: string;
	platform_name?: string;
	platform?: string;
	publish_platform?: string;
	account_name?: string;
	account_title?: string;
	account_id?: string;
	platform_account?: string;
	publish_time?: string;
	index?: number;
	[key: string]: any;
};

/** POST /api/v1.enterprise.Publish/parseVideoUrl → data */
export type ParseVideoUrlResult = {
	list?: ParseVideoUrlItem[];
	/** 实际接口字段 */
	success?: ParseVideoUrlItem[];
	failed?: ParseVideoUrlItem[];
	/** 兼容旧字段 */
	success_list?: ParseVideoUrlItem[];
	error_list?: ParseVideoUrlItem[];
	success_num?: number;
	error_num?: number;
	[key: string]: any;
};

/** GET /api/keyword/switchableProjects → list 项 */
export type SwitchableProjectItem = {
	id?: number;
	project_id?: number;
	title?: string;
	subtitle?: string;
	display_name?: string;
	project?: string;
	logo?: string;
	icon_url?: string;
	/** 是否已产生关键词（仅此类品牌可切换） */
	checkedK?: number | boolean;
	has_keyword?: number | boolean;
	[key: string]: any;
};
