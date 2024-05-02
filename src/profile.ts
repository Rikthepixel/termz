import { validate } from "superstruct";
import { Profile, ProfileSchema } from "./models/profile";
import { err, ok } from "./utils/result";
import { readJsonFile } from "./utils/file";
import { resolveAbsolute } from "./utils/path";
import { writeFile } from "fs/promises";
import path from "path";

export function readProfile(profileFile: string) {
    return readJsonFile(profileFile).flatMap((content) => {
        const validationResult = validate(content, ProfileSchema);
        if (validationResult[0]) return err(validationResult[0]);
        const profile = validationResult[1];

        for (const tab of profile.tabs) {
            tab.directory = resolveAbsolute(tab.directory ?? "./", path.dirname(profileFile));

            for (const pane of tab?.panes ?? []) {
                pane.displayName ??= tab.displayName;
                pane.directory ??= tab.directory;
                pane.profile ??= tab.profile;
            }
        }

        return ok(profile);
    });
}

export async function writeProfile(profileFile: string, content: Profile) {
    await writeFile(profileFile, JSON.stringify(content, null, 2));
}