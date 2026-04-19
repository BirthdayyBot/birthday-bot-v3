export interface ControllerWarning<TCode extends string = string> {
	status: 'warning';
	code: TCode;
	args?: Record<string, unknown>;
}

export interface ControllerSuccess<TKey extends string = string, TArgs extends object | undefined = undefined, TData = undefined> {
	status: 'success';
	key: TKey;
	args?: TArgs;
	data?: TData;
}

export interface ControllerReady<TData = undefined> {
	status: 'ready';
	data?: TData;
}

export type ControllerResult<
	TKey extends string = string,
	TCode extends string = string,
	TArgs extends object | undefined = undefined,
	TData = undefined
> = ControllerWarning<TCode> | ControllerSuccess<TKey, TArgs, TData>;

export type ControllerPrepareResult<TCode extends string = string, TData = undefined> = ControllerWarning<TCode> | ControllerReady<TData>;

export interface ControllerData<TData> {
	status: 'success';
	data: TData;
}
