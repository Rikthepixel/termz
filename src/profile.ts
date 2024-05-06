import { Profile, ProfileSchema } from "./models/profile";
import { readJsonFile } from "./utils/file";
import { resolveAbsolute } from "./utils/path";
import { writeFile } from "fs/promises";
import path from "path";
import { asyncPipe } from "./utils/pipe";
import { validate } from "./utils/validation";

export function readProfile(profileFile: string) {
    return asyncPipe(
        readJsonFile(profileFile),
        (r) => r.flatMap((content) => validate(content, ProfileSchema)),
        (r) =>
            r.map((profile) => {
                for (const tab of profile.tabs) {
                    tab.directory = resolveAbsolute(tab.directory ?? "./", path.dirname(profileFile));

                    for (const pane of tab?.panes ?? []) {
                        pane.displayName ??= tab.displayName;
                        pane.directory ??= tab.directory;
                        pane.profile ??= tab.profile;
                    }
                }
                return profile;
            }),
    );
}

export async function writeProfile(profileFile: string, content: Profile) {
    await writeFile(profileFile, JSON.stringify(content, null, 2));
}
