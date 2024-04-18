import { StructError, validate } from "superstruct";
import { Profile, ProfileSchema } from "./models/profile";
import { Result } from "./utils/result";
import { EoentError, readJsonFile } from "./utils/file";
import { resolveUserHome as resolveUserHome } from "./utils/path";

export async function readProfile(
    profileFile: string,
): Promise<Result<Profile, SyntaxError | StructError | EoentError>> {
    const content = await readJsonFile(profileFile);

    if (Result.isErr(content)) {
        return content;
    }

    const validationResult = validate(content.value, ProfileSchema);
    if (validationResult[0]) return Result.Err(validationResult[0]);
    const profile = validationResult[1];

    for (const tab of profile.tabs) {
        tab.directory = resolveUserHome(tab.directory ?? process.cwd());

        for (const pane of tab?.panes ?? []) {
            pane.displayName ??= tab.displayName;
            pane.directory ??= tab.directory;
            pane.profile ??= tab.profile;
        }
    }

    return Result.Ok(profile);
}
