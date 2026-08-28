let clearSessionHandler: (() => void) | null = null;

export function registerSessionClear(handler: () => void) {
	clearSessionHandler = handler;
}

export function clearSession() {
	if (clearSessionHandler != null) {
		clearSessionHandler();
	}
}
