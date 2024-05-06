import { existsSync } from "fs";
import { readJsonFile } from "src/utils/file";
import { resolveUserHome } from "src/utils/path";
import { err, ok } from "src/utils/result";
import { Infer, array, optional, string, type, validate } from "superstruct";

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

type PathExists = { path: string; exists: boolean };

async function getWtSettingsPath() {
    const possiblePaths = [
        "~/AppData/Local/Microsoft/Windows Terminal/settings.json",
        "~/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json",
    ];
    const pathPromises = possiblePaths.map((path) => {
        return new Promise<PathExists>((resolve) => {
            resolve({
                path,
                exists: existsSync(resolveUserHome(path)),
            });
        });
    });

    const path = await Promise.all(pathPromises).then((p) => p.find((path) => path.exists));

    if (!path) {
        return err(new NoWtSettingsError("Windows Terminal settings could not be found.", possiblePaths));
    }

    return ok(resolveUserHome(path.path));
}

export async function readWtSettings() {
    const settings = await getWtSettingsPath();
    const mapped = settings
        .map(readJsonFile)
        // .resolve()
        // .then((r) => r.flat());

    // .then((r) => {
    //     return r.flatMap((content) => {
    //         const validationResult = validate(content, WtSettingsSchema, { coerce: true });
    //         if (validationResult[0]) return err(validationResult[0]);
    //         return ok(validationResult[1]);
    //     });
    // });
}
