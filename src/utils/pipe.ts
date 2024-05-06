export type PipeFn<I, O> = (input: I) => O;

export function pipe<T1, T2>(input: T1, ...fns: [PipeFn<T1, T2>]): T2;
export function pipe<T1, T2, T3>(input: T1, ...fns: [PipeFn<T1, T2>, PipeFn<T2, T3>]): T3;
export function pipe<T1, T2, T3, T4>(input: T1, ...fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>]): T4;
export function pipe(input: any, ...fns: PipeFn<any, any>[]): any {
    return fns.reduce((input, fn) => fn(input), input);
}

export type MaybePromise<T> = T | Promise<T>;
export type AsyncPipeFn<I, O> = (input: I) => MaybePromise<O>;

export function asyncPipe<T1, T2>(input: MaybePromise<T1>, ...fns: [AsyncPipeFn<T1, T2>]): Promise<T2>;
export function asyncPipe<T1, T2, T3>(
    input: MaybePromise<T1>,
    ...fns: [AsyncPipeFn<T1, T2>, AsyncPipeFn<T2, T3>]
): Promise<T3>;
export function asyncPipe<T1, T2, T3, T4>(
    input: MaybePromise<T1>,
    ...fns: [AsyncPipeFn<T1, T2>, AsyncPipeFn<T2, T3>, AsyncPipeFn<T3, T4>]
): T4;
export function asyncPipe(input: any, ...fns: Array<(input: any) => any>): any {
    return fns.reduce((input, fn) => input.then(fn), Promise.resolve(input));
}
