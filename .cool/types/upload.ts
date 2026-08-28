/** POST /api/upload/image 返回的 data */
export type UploadImageData = {
	id?: number;
	name?: string;
	category?: string;
	mime?: string;
	size?: number;
	storage?: string;
	uri?: string;
	url?: string;
};

export type UploadImageResponse = {
	code?: number | string;
	msg?: string;
	data?: UploadImageData;
	show?: number;
};
