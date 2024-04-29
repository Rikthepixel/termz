import { StructError, validate } from "superstruct";
import { Profile, ProfileSchema } from "./models/profile";
import { PromiseResult, Result } from "./utils/result";
import { EoentError, readJsonFile } from "./utils/file";
import { resolveAbsolute } from "./utils/path";
import { writeFile } from "fs/promises";
import path from "path";

export async function readProfile(
    profileFile: string,
): PromiseResult<Profile, SyntaxError | StructError | EoentError> {
    const content = await readJsonFile(profileFile);

    if (Result.isErr(content)) {
        return PromiseResult.Promise(content);
    }

    const validationResult = validate(content.value, ProfileSchema);
    if (validationResult[0]) return Result.Err(validationResult[0]);
    const profile = validationResult[1];

    for (const tab of profile.tabs) {
        tab.directory = resolveAbsolute(tab.directory ?? "./", path.dirname(profileFile));

        for (const pane of tab?.panes ?? []) {
            pane.displayName ??= tab.displayName;
            pane.directory ??= tab.directory;
            pane.profile ??= tab.profile;
        }
    }

    return Result.Ok(profile);
}

export async function writeProfile(profileFile: string, content: Profile) {
    await writeFile(profileFile, JSON.stringify(content, null, 2));
}