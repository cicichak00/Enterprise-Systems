export type LoginSmsParams = {
	mobile: string;
	code: string;
	terminal: string;
};

export type LoginPasswordParams = {
	mobile: string;
	password: string;
	terminal: string;
};

export type SendSmsParams = {
	mobile: string;
};

export type LoginResponseData = {
	token: string;
	user_id?: number;
	id?: number;
	sn?: number;
	nickname?: string;
	avatar?: string;
	mobile?: string;
	[key: string]: any;
};

export type LoginEnvelope = {
	code?: number;
	msg?: string;
	data?: LoginResponseData;
};
