export type Ok<T> = { type: "ok"; value: T } & typeof Result;
export type Err<T> = { type: "err"; error: T } & typeof Result;
export type Result<T, E> = Ok<T> | Err<E>;

type PromiseValue<T> = T extends Promise<infer TP> ? TP : T;

export namespace Result {
    export function Ok<T>(data: T): Ok<T> {
        return Object.setPrototypeOf(
            {
                type: "ok",
                value: data,
            },
            Result,
        );
    }

    export function Err<T>(error: T): Err<T> {
        return Object.setPrototypeOf(
            {
                type: "err",
                error: error,
            },
            Result,
        );
    }

    export function map<T, E, M>(this: Result<T, E>, mapper: (value: T) => M): Result<M, E> {
        if (this.type !== "ok") return this;
        return Result.Ok(mapper(this.value));
    }

    export function match<T, E, MT, ME>(
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

    export function promise<T, E>(this: Result<T, E>): Promise<Result<PromiseValue<T>, PromiseValue<E>>> {
        return Promise.resolve(this);
    }

    export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
        return result.type === "ok";
    }

    export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
        return result.type === "err";
    }
}
