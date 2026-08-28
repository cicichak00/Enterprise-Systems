/** 认证类型状态 POST /api/v1.enterprise.userCertify/getTypeInfo */
export type UserCertifyTypeInfoParams = {
	/** -1 拉全部类型状态 */
	type?: number;
	bind_scope?: number;
	certify_id?: number;
	for_edit?: number;
};

/** 查询/同步实名状态 POST /api/v1.enterprise.userCertify/queryVerify */
export type UserCertifyQueryVerifyParams = {
	/** 可选，不传取当前 scope 最新一条 */
	certify_id?: number;
	/** 可选，1账号 2提现 */
	bind_scope?: number;
	/** 可选，1=强制向云账户同步 */
	force_sync?: number;
};

/** 提交个人实名 POST /api/v1.enterprise.userCertify/submit */
export type UserCertifySubmitParams = {
	/** 必填，仅 0=个人 */
	certify_type: number;
	/** 真实姓名（可用 real_name） */
	name: string;
	/** 联系手机（可用 mobile） */
	contact_mobile: string;
	/** 身份证号（可用 id_card） */
	idNo: string;
	/** 联系地址 */
	address: string;
	/** 人脸照片 URL */
	facePhoto: string;
	/** 身份证人像页 URL */
	idCardFront: string;
	/** 身份证国徽页 URL */
	idCardBack: string;
	/** 可选，1账号 2提现，默认1 */
	bind_scope?: number;
	/** 可选，重提时传 */
	certify_id?: number;
};
