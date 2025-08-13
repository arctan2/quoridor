export interface WsResponse<T> {
	err: boolean,
	msg: string,
	data: T
};
