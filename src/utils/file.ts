import { readFile } from "fs/promises";
import { Result } from "./result";

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

export async function readJsonFile(file: string): Promise<Result<unknown, EoentError | SyntaxError>> {
    return await readFile(file)
        .then((c) => c.toString())
        .then((c) => Result.Ok<unknown>(JSON.parse(c)))
        .catch((e) => {
            if (e instanceof Error && "errno" in e) {
                return Result.Err<EoentError>(EoentError.fromError(e));
            }
            return Result.Err<SyntaxError>(e);
        });
}
