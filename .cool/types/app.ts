/** GET /api/app/system → data.menus[] */
export type AppSystemMenuItem = {
	id?: number;
	key?: string;
	title?: string;
	icon?: string;
	icon_active?: string;
	sort?: number;
	badge?: string;
	path?: string;
	[key: string]: any;
};

export type AppSystemData = {
	enterprise?: UTSJSONObject;
	cert?: UTSJSONObject;
	protocols?: UTSJSONObject;
	menus?: AppSystemMenuItem[];
	bind_status?: number;
	status?: number;
	enterprise_code?: string;
	status_text?: string;
	[key: string]: any;
};
