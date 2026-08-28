export function readStoredToken(): string | null {
	const token = uni.getStorageSync("token") as string | null;
	if (token == null || token == "") {
		return null;
	}
	return token;
}
