export type Ok<T> = { type: "ok"; value: T } & typeof Result;
export type Err<T> = { type: "err"; error: T } & typeof Result;
export type Result<T, E> = Ok<T> | Err<E>;
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

    export function flatMap<M extends Result<unknown, unknown>, T, E>(
        this: Result<T, E>,
        mapper: (value: T) => M,
    ): Result<GetOk<M>, E | GetErr<M>> {
        if (this.type !== "ok") return this;
        return mapper(this.value) as any;
    }

    export async function flatMapPromise<M extends Result<unknown, unknown>, T, E>(
        this: Result<T, E>,
        mapper: (value: T) => M | Promise<M>,
    ): Promise<Result<GetOk<M>, E | GetErr<M>>> {
        if (this.type !== "ok") return this;
        return Promise.resolve(mapper(this.value)) as any;
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

    export function promise<T, E>(this: Result<T, E>): Promise<Result<Awaited<T>, Awaited<E>>> {
        return new Promise((resolve) => {});
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
