export type Ok<T> = { type: "ok"; value: T } & typeof Result;
export type Err<T> = { type: "err"; error: T } & typeof Result;
export type Result<T, E> = Ok<T> | Err<E>;
export type MaybePromise<T> = T | Promise<T>;

export module Result {
    export type GetOk<TPossible> = TPossible extends Ok<infer T> ? T : never;
    export type GetErr<TPossible> = TPossible extends Err<infer T> ? T : never;
    type IsNever<T> = (T extends never ? true : false) extends true ? true : false;

    export function ok<T>(data: T): Ok<T> {
        return Object.setPrototypeOf({ type: "ok", value: data }, Result);
    }

    export function err<T>(error: T): Err<T> {
        return Object.setPrototypeOf({ type: "err", error: error }, Result);
    }

    export function map<M, MT = never, ME = never, T = unknown, E = unknown>(
        this: Result<T, E>,
        mapper: (value: T) => M | Result<MT, ME>,
    ): IsNever<MT> extends true ? (IsNever<ME> extends true ? Result<M, E> : Result<MT, ME | E>) : Result<MT, ME | E> {
        if (this.type !== "ok") return this as any;
        const mapped = mapper(this.value);
        if (is(mapped)) return mapped as any;
        return ok(mapped) as any;
    }

    export async function mapPromise<M, MT = never, ME = never, T = unknown, E = unknown>(
        this: Result<T, E>,
        mapper: (value: T) => M | Result<MT, ME> | Promise<M | Result<MT, ME>>,
    ): Promise<
        IsNever<MT> extends true ? (IsNever<ME> extends true ? Result<M, E> : Result<MT, ME | E>) : Result<MT, ME | E>
    > {
        if (isErr(this)) return Promise.resolve(this);
        const mapped = await mapper(this.value);
        if (is(mapped)) return mapped as any;
        return ok(mapped) as any;
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
        return new Promise((resolve) =>
            this.match(
                async (value) => resolve(ok(await value)),
                async (error) => resolve(err(await error)),
            ),
        );
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

export const ok = Result.ok;
export const err = Result.err;
