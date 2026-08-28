function toPhoneString(phone: any): string {
	if (phone == null) {
		return "";
	}
	if (typeof phone == "number") {
		const n = phone as number;
		if (isNaN(n)) {
			return "";
		}
		return `${Math.trunc(n)}`;
	}
	return `${phone}`.trim();
}

function appendDigit(digits: string, code: number): string {
	if (code >= 48 && code <= 57) {
		return digits + String.fromCharCode(code);
	}
	if (code >= 0xff10 && code <= 0xff19) {
		return digits + String.fromCharCode(code - 65248);
	}
	return digits;
}

/** 提取 11 位大陆手机号数字（去空格、+86、全角数字等） */
export function normalizePhone(phone: any): string {
	let raw = toPhoneString(phone);
	if (raw.startsWith("+86")) {
		raw = raw.substring(3);
	} else if (raw.startsWith("86") && raw.length > 11) {
		raw = raw.substring(2);
	}
	let digits = "";
	for (let i = 0; i < raw.length; i++) {
		digits = appendDigit(digits, raw.charCodeAt(i));
	}
	if (digits.length > 11) {
		return digits.substring(0, 11);
	}
	return digits;
}

/** 不依赖 RegExp，兼容 UTS 编译环境 */
export function isValidPhone(phone: any): boolean {
	const p = normalizePhone(phone);
	if (p.length != 11) {
		return false;
	}
	if (p.charCodeAt(0) != 49) {
		return false;
	}
	const second = p.charCodeAt(1);
	if (second < 51 || second > 57) {
		return false;
	}
	for (let i = 2; i < 11; i++) {
		const c = p.charCodeAt(i);
		if (c < 48 || c > 57) {
			return false;
		}
	}
	return true;
}

export function validatePhoneValue(phone: any, showEmptyError: boolean, emptyTip: string): string {
	const normalized = normalizePhone(phone);
	if (normalized == "") {
		return showEmptyError ? emptyTip : "";
	}
	if (!isValidPhone(normalized)) {
		return "请输入正确的11位手机号";
	}
	return "";
}

function extractAllDigits(raw: any): string {
	const text = toPhoneString(raw);
	let digits = "";
	for (let i = 0; i < text.length; i++) {
		digits = appendDigit(digits, text.charCodeAt(i));
	}
	return digits;
}

/** 统计输入中的数字个数（用于判断 autofill 是否超长） */
export function countInputDigits(raw: any): number {
	const text = toPhoneString(raw);
	let count = 0;
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		if ((c >= 48 && c <= 57) || (c >= 0xff10 && c <= 0xff19)) {
			count += 1;
		}
	}
	return count;
}

/** 提取最多 6 位短信验证码数字（保留前导 0） */
export function normalizeSmsCode(raw: any): string {
	let digits = extractAllDigits(raw);
	// iOS / 微信短信 autofill 偶发将相同验证码写入两遍
	if (digits.length >= 12 && digits.length % 6 == 0) {
		const half = digits.length / 2;
		const first = digits.substring(0, half);
		const second = digits.substring(half);
		if (first == second && half == 6) {
			digits = first;
		}
	}
	if (digits.length > 6) {
		return digits.substring(0, 6);
	}
	return digits;
}

/** 从 input 事件读取并规范化短信验证码（勿与 v-model 同时使用，避免 iOS 重复写入） */
export function readSmsCodeInput(e: UniInputEvent | UniInputBlurEvent | null): string {
	return normalizeSmsCode(readInputValue(e, ""));
}

/** 从 input 事件读取并规范化手机号 */
export function readPhoneInput(e: UniInputEvent | UniInputBlurEvent | null): string {
	return normalizePhone(readInputValue(e, ""));
}

export function readInputValue(e: UniInputEvent | UniInputBlurEvent | null, fallback: string): string {
	if (e != null) {
		const val = e.detail.value;
		if (val != null) {
			return `${val}`;
		}
	}
	return fallback;
}
