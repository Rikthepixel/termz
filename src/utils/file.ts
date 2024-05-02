import fs from "fs/promises";
import { Err, PromiseResult, Result, err, ok } from "./result";

export class EoentError extends Error {
    constructor(
        public errno: number,
        public code: string,
        public syscall: string,
        public path: string,
        name: string,
        message?: string,
        cause?: unknown,
        stack?: string,
    ) {
        super(message);
        this.name = name;
        this.cause = cause;
        this.stack = stack;
    }

    static fromError(e: Error) {
        return new EoentError(
            (e as any).errno,
            (e as any).code,
            (e as any).syscall,
            (e as any).path,
            e.name,
            e.message,
            e.cause,
            e.stack,
        );
    }
}

export function readFile(file: string) {
    const promise = fs
        .readFile(file)
        .then((c) => ok(c.toString()))
        .catch<Err<EoentError>>((e) => err<EoentError>(EoentError.fromError(e)));

    return PromiseResult.Promise(promise);
}

export function readJsonFile(file: string) {
    return readFile(file).flatMap((c) => {
        try {
            return ok(JSON.parse(c) as unknown);
        } catch (e) {
            return err(e as SyntaxError);
        }
    });
}
