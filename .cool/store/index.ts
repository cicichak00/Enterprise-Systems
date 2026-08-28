import { Dict, dict } from "./dict";
import { Tabbar, tabbar } from "./tabbar";
import { User, user } from "./user";

type Store = {
	user: User;
	dict: Dict;
	tabbar: Tabbar;
};

export function useStore(): Store {
	return {
		user,
		dict,
		tabbar
	};
}

export * from "./dict";
export * from "./tabbar";
export * from "./user";
