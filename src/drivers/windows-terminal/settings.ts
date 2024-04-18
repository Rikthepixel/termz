import { existsSync } from "fs";
import { EoentError, readJsonFile } from "src/utils/file";
import { resolveUserHome } from "src/utils/path";
import { Result } from "src/utils/result";
import { Infer, StructError, array, optional, string, type, validate } from "superstruct";

const WtProfileSchema = type({
    guid: string(),
    name: string(),
    commandline: optional(string()),
    source: optional(string()),
});

const WtSettingsSchema = type({
    defaultProfile: string(),
    profiles: type({
        list: array(WtProfileSchema),
    }),
});

export type WtSettings = Infer<typeof WtSettingsSchema>;
export type WtProfile = Infer<typeof WtProfileSchema>;

export class NoWtSettingsError extends Error {
    constructor(
        message: string,
        public paths: string[],
    ) {
        super(message);
    }
}

async function getWtSettingsPath(): Promise<Result<string, NoWtSettingsError>> {
    const possiblePaths = [
        "~/AppData/Local/Microsoft/Windows Terminal/settings.json",
        "~/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json",
    ];

    const pathPromises = possiblePaths.map(
        (path) =>
            new Promise<{ path: string; exists: boolean }>((resolve) => {
                resolve({
                    path,
                    exists: existsSync(resolveUserHome(path)),
                });
            }),
    );

    const paths = await Promise.all(pathPromises);
    const path = paths.find((path) => path.exists);
    if (!path) {
        return Result.Err(new NoWtSettingsError("Windows Terminal settings could not be found.", possiblePaths));
    }

    return Result.Ok(resolveUserHome(path.path));
}

export async function readWtSettings(): Promise<
    Result<WtSettings, EoentError | SyntaxError | StructError | NoWtSettingsError>
> {
    const path = await getWtSettingsPath();
    if (Result.isErr(path)) {
        return path;
    }

    const content = await readJsonFile(path.value);
    if (Result.isErr(content)) {
        return content;
    }

    const validationResult = validate(content.value, WtSettingsSchema, { coerce: true });
    if (validationResult[0]) {
        return Result.Err(validationResult[0]);
    }

    return Result.Ok(validationResult[1]);
}
