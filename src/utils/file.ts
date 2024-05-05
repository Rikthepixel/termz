import fs from "fs/promises";
import { err, ok } from "./result";

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

export async function readFile(file: string) {
    return await fs
        .readFile(file)
        .then((c) => ok(c.toString()))
        .catch((e) => err(EoentError.fromError(e)));
}

export async function readJsonFile(file: string) {
    return readFile(file).then((result) =>
        result.flatMap((c) => {
            try {
                return ok(JSON.parse(c) as unknown);
            } catch (e) {
                return err(e as SyntaxError);
            }
        }),
    );
}
