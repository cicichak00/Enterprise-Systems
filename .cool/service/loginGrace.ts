let loginGraceUntil = 0;

export function markLoginGrace(durationMs: number = 5000) {
	loginGraceUntil = new Date().getTime() + durationMs;
}

export function isInLoginGrace(): boolean {
	return new Date().getTime() < loginGraceUntil;
}
