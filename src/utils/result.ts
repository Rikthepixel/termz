export type Ok<T> = { type: "ok"; value: T } & typeof Result;
export type Err<T> = { type: "err"; error: T } & typeof Result;
export type Result<T, E> = Ok<T> | Err<E>;

export class PromiseResult<T, E> extends Promise<Result<T, E>> {
    static Promise<T, E>(promise: Promise<Result<T, E>>): PromiseResult<Awaited<T>, Awaited<E>> {
        return new PromiseResult((resolve) => promise.then(resolve));
    }

    map<T, E, M>(this: PromiseResult<T, E>, mapper: (value: T) => M): PromiseResult<M, E> {
        return Pr;
        return this.then((result) => result.map(mapper));
    }

    match<T, E, MT, ME>(
        this: PromiseResult<T, E>,
        okMapper: (value: T) => MT,
        errMapper: (error: E) => ME,
    ): Promise<MT | ME> {
        return await this.promise.then((result) => result.match(okMapper, errMapper));
    }
}
export module PromiseResult {
    export function Resolve<T, E>(result: Result<T, E>): PromiseResult<T, E> {
        return PromiseResult.Promise(Promise.resolve());
    }

    export function Promise<T, E>(promise: Promise<Result<T, E>>): PromiseResult<T, E> {
        return Object.setPrototypeOf({ promise }, PromiseResult);
    }
}

export module Result {
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

    export function promise<T, E>(this: Result<T, E>): PromiseResult<Awaited<T>, Awaited<E>> {
        return new PromiseResult(async (resolve) => {
            await this.match(
                async (value) => resolve(Result.Ok(await value)),
                async (error) => resolve(Result.Err(await error)),
            );
        });
    }

    export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
        return result.type === "ok";
    }

    export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
        return result.type === "err";
    }
}