/** 项目类型 GET /api/project/types → data[] */
export type ProjectTypeItem = {
	id?: number;
	title?: string;
	label?: string;
	[key: string]: any;
};
