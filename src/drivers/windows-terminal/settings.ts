import { existsSync } from "fs";
import { readJsonFile } from "src/utils/file";
import { resolveUserHome } from "src/utils/path";
import { asyncPipe } from "src/utils/pipe";
import { Result, err, ok } from "src/utils/result";
import * as z from "zod/mini";

const WtProfileSchema = z.looseObject({
    guid: z.string(),
    name: z.string(),
    commandline: z.optional(z.string()),
    source: z.optional(z.string()),
});

const WtSettingsSchema = z.looseObject({
    defaultProfile: z.string(),
    profiles: z.looseObject({
        list: z.array(WtProfileSchema),
    }),
});

export type WtSettings = z.infer<typeof WtSettingsSchema>;
export type WtProfile = z.infer<typeof WtProfileSchema>;

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
    return asyncPipe(
        getWtSettingsPath(),
        (r) => r.mapPromise(readJsonFile),
        (r) => r.map((content) => Result.into(() => WtSettingsSchema.parse(content))),
    );
}
