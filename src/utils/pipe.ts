export function pipe<T1, T2>(input: T1, ...fns: [(input: T1) => T2]): T2;
export function pipe<T1, T2, T3>(input: T1, ...fns: [(input: T1) => T2, (input: T2) => T3]): T3;
export function pipe<T1, T2, T3, T4>(input: T1, ...fns: [(input: T1) => T2, (input: T2) => T3, (input: T3) => T4]): T4;
export function pipe(input: any, ...fns: Array<(input: any) => any>): any {
    return fns.reduce((input, fn) => fn(input), input);
}
