import { reactive } from "vue";
import type { Config } from "./types";

export const config = reactive<Config>({
	// null：默认正常字号（1.0 倍，不启用全局缩放）
	fontSize: null,
	zIndex: 600,
	startDate: "2000-01-01 00:00:00",
	endDate: "2050-12-31 23:59:59"
});
