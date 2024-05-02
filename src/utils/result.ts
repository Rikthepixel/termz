export type Ok<T> = { type: "ok"; value: T } & typeof Result;
export type Err<T> = { type: "err"; error: T } & typeof Result;
export type Result<T, E> = Ok<T> | Err<E>;
export type PromiseResult<T, E> = Promise<Result<T, E>> & typeof PromiseResult;
export type MaybePromise<T> = T | Promise<T>;

export module Result {
    export type GetOk<TPossible> = TPossible extends Ok<infer T> ? T : never;
    export type GetErr<TPossible> = TPossible extends Err<infer T> ? T : never;

    export function Ok<T>(data: T): Ok<T> {
        return Object.setPrototypeOf({ type: "ok", value: data }, Result);
    }

    export function Err<T>(error: T): Err<T> {
        return Object.setPrototypeOf({ type: "err", error: error }, Result);
    }

    export function map<M, T, E>(this: Result<T, E>, mapper: (value: T) => M): Result<M, E> {
        if (this.type !== "ok") return this;
        return Ok(mapper(this.value));
    }

    export function flat<T, E>(
        this: Result<T, E>,
    ): Result<Exclude<T, Result<GetOk<T>, GetErr<T>>> | GetOk<T>, E | GetErr<T>> {
        if (this.type !== "ok") return this;

        if (is(this.value)) {
            return this.value as any;
        }

        return this as any;
    }

    export function match<MT, ME, T, E>(
        this: Result<T, E>,
        okMapper: (value: T) => MT,
        errMapper: (error: E) => ME,
    ): MT | ME {
        switch (this.type) {
            case "ok": {
                return okMapper(this.value);
            }
            case "err": {
                return errMapper(this.error);
            }
        }
    }

    export function await<T, E>(this: Result<T, E>): PromiseResult<Awaited<T>, Awaited<E>> {
        const promise = new Promise<Result<Awaited<T>, Awaited<E>>>(async (resolve) => {
            await this.match(
                async (value) => resolve(Ok(await value)),
                async (error) => resolve(Err(await error)),
            );
        });

        return PromiseResult.Promise(promise);
    }

    export function is(value: unknown): value is Result<unknown, unknown> {
        return Object.getPrototypeOf(value) === Result;
    }

    export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
        return result.type === "ok";
    }

    export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
        return result.type === "err";
    }
}

export const ok = Result.Ok;
export const err = Result.Err;

const intoPromise = Promise.resolve;

export module PromiseResult {
    export function Ok<T>(value: MaybePromise<T>): PromiseResult<T, unknown> {
        const promise = intoPromise(value).then((v) => ok(v));
        return Promise(promise);
    }
    export function Err<E>(error: Promise<E>): PromiseResult<unknown, E> {
        const promise = intoPromise(error).then((v) => err(v));
        return Promise(promise);
    }

    export function Result<T, E>(result: Result<T, E>): PromiseResult<T, E> {
        return Promise(intoPromise(result));
    }

    export function Promise<T, E>(promise: Promise<Result<T, E>>): PromiseResult<T, E> {
        return Object.setPrototypeOf(intoPromise(promise), PromiseResult);
    }

    export function map<M, T, E>(
        this: PromiseResult<T, E>,
        mapper: (value: T) => M,
    ): PromiseResult<Awaited<M>, Awaited<E>> {
        const result = this.then((result) => result.map(mapper).await());
        return PromiseResult.Promise(result);
    }

    export function flat<T, E>(
        this: PromiseResult<T, E>,
    ): PromiseResult<
        | Exclude<T, Promise<Result<Result.GetOk<T>, Result.GetErr<T>>> | Result<Result.GetOk<T>, Result.GetErr<T>>>
        | Result.GetOk<T>,
        E | Result.GetErr<T>
    > {
        const result = this.then((result) => {
            if (result.type === "ok" && PromiseResult.is(result.value)) {
                return result.value;
            }
            return result;
        }).then((result) => result.flat());

        return PromiseResult.Promise(result) as any;
    }

    export function flatMap<M, T, E>(this: PromiseResult<T, E>, mapper: (value: T) => MaybePromise<M>) {
        const result = this.then((result) => result.map(mapper));
        return PromiseResult.Promise(result).flat();
    }

    export async function match<MT, ME, T, E>(
        this: PromiseResult<T, E>,
        okMapper: (value: T) => MT,
        errMapper: (error: E) => ME,
    ): Promise<Awaited<MT | ME>> {
        return await this.then((result) => result.match(okMapper, errMapper));
    }

    export function is(value: unknown): value is PromiseResult<unknown, unknown> {
        return Object.getPrototypeOf(value) === PromiseResult;
    }
}
Object.setPrototypeOf(PromiseResult, Promise);