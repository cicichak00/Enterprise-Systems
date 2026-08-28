/** GET /api/v1.enterprise.compose/myListLog 查询参数 */
export type ComposeMyListLogParams = {
	/** 组合入口 id (compose_id) */
	id: number;
	/** 页码，默认 1 */
	page_no?: number;
	/** 每页条数，默认 15，最大 100 */
	page_size?: number;
	/** 关键词模糊搜索 */
	keyword?: string;
};

/** POST /api/v1.enterprise.compose/projectLists 查询参数 */
export type ComposeProjectListsParams = {
	/** 组合入口 id */
	id: number;
};

/** POST /api/v1.enterprise.compose/initPage 查询参数 */
export type ComposeInitPageParams = {
	/** 组合入口锚点项目 ID */
	project_id: number;
};

/** POST /api/v1.enterprise.compose/initPage → projectLists[].list 项目项 */
export type ComposeProjectItem = {
	id?: number;
	project_id?: number;
	title?: string;
	name?: string;
	project_name?: string;
	logo?: string;
	logo_url?: string;
	color?: string;
	/** 是否默认勾选 */
	checked?: boolean | number;
	checkedK?: boolean | number;
	is_anchor?: number;
	required?: number;
	[key: string]: any;
};

/** POST /api/v1.enterprise.compose/initPage → projectLists 分组 */
export type ComposeProjectGroup = {
	id?: number;
	subtitle?: string;
	title?: string;
	name?: string;
	logo?: string;
	logo_url?: string;
	sort?: number;
	list?: ComposeProjectItem[];
	[key: string]: any;
};

/** 组合提词记录 · 平台审核状态 */
export type ComposeListLogPlatformItem = {
	platform?: string;
	platform_name?: string;
	project_name?: string;
	project_id?: number;
	name?: string;
	title?: string;
	book_id?: string | number;
	book_name?: string;
	author?: string;
	status?: number | string;
	status_text?: string;
	msg?: string;
	[key: string]: any;
};

/** GET /api/v1.enterprise.compose/myListLog → lists 项 */
export type ComposeListLogItem = {
	id?: number;
	keyword?: string;
	title?: string;
	create_time?: string;
	created_at?: string;
	book_id?: string | number;
	book_name?: string;
	author?: string;
	expand?: Array<{ field?: string; name?: string; value?: string }>;
	keywordList?: ComposeListLogPlatformItem[];
	keyword_list?: ComposeListLogPlatformItem[];
	platform_list?: ComposeListLogPlatformItem[];
	status_list?: ComposeListLogPlatformItem[];
	platforms?: ComposeListLogPlatformItem[];
	children?: ComposeListLogPlatformItem[];
	[key: string]: any;
};

/** GET /api/v1.enterprise.compose/myListLog → data */
export type ComposeMyListLogResult = {
	lists?: ComposeListLogItem[];
	list?: ComposeListLogItem[];
	records?: ComposeListLogItem[];
	total?: number;
	count?: number;
	page_no?: number;
	page_size?: number;
};

/** POST /api/v1.enterprise.compose/add → projectLists 项 */
export type ComposeAddProjectItem = {
	id: number;
	/** 是否勾选；锚点项目即使 false 也会强制提交 */
	checked: boolean;
};

/** POST /api/v1.enterprise.compose/add → expand 单项（同 keyword/add form_info） */
export type ComposeAddExpandItem = {
	field: string;
	name: string;
	value: string;
};

/** POST /api/v1.enterprise.compose/add */
export type ComposeAddParams = {
	/** 组合入口 id */
	id: number;
	/** 勾选的项目 */
	projectLists: ComposeAddProjectItem[];
	/** 提词数据（支持批量，每组一条） */
	expand: ComposeAddExpandItem[][];
};

/** POST /api/v1.enterprise.compose/del */
export type ComposeDelParams = {
	/** 组合入口 id */
	id: number;
	/** 要删除的关键词文本列表 */
	arrKeyword: string[];
};

/** POST /api/v1.enterprise.compose/publish → form_info 单项 */
export type ComposePublishFormItem = {
	field: string;
	name: string;
	value: string;
};

/** POST /api/v1.enterprise.compose/publish → projectLists 项 */
export type ComposePublishProjectItem = {
	id: number;
	/** 仅 checked=true 的项目会提交 */
	checked: boolean;
};

/** POST /api/v1.enterprise.compose/publish */
export type ComposePublishParams = {
	/** 关键词文本 */
	keyword: string;
	/** 要同步回填的项目 */
	projectLists: ComposePublishProjectItem[];
	/** 回填数据（与单项目 publish/submit 同格式） */
	form_info: ComposePublishFormItem[][];
};
