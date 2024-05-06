import { Driver } from "src/models/driver";
import { EoentError } from "src/utils/file";
import { logErrorBanner, logStructError } from "src/utils/logging";
import { StructError } from "superstruct";
import { NoWtSettingsError, readWtSettings } from "./settings";
import { focusPrevious, makeTab } from "./render";
import { criteria } from "src/utils/driver";

export default {
    name: "Windows Terminal",
    features: {
        tabs: true,
        verticalPanes: true,
        horizontalPanes: true,
        script: "Windows Terminal has limited support (powershell & cmd) for executing startup scripts",
    },
    detect() {
        return criteria(Boolean(process.env.WT_SESSION), Boolean(process.env.WT_PROFILE_ID));
    },
    async open(profile) {
        const tabs = profile.tabs;

        return (await readWtSettings()).match(
            async (settings) => {
                for (const tab of tabs) {
                    await makeTab(tab, settings);
                }

                for (let i = 0; i < tabs.length; i++) {
                    await focusPrevious();
                }
            },
            (error) => {
                console.log();

                if (error instanceof EoentError) {
                    logErrorBanner(`Failed to read windows terminal settings, perhaps check if it exists.`);
                    console.log(error);
                } else if (error instanceof SyntaxError) {
                    logErrorBanner(`The contents of the windows terminal profile were not valid JSON`);
                    console.log(error);
                } else if (error instanceof StructError) {
                    logStructError(
                        `The JSON contents of the windows terminal profile didn't adhere to the expected structure`,
                        error,
                    );
                } else if (error instanceof NoWtSettingsError) {
                    logErrorBanner(`Failed to read Windows terminal settings, perhaps check if it exists.`);
                    console.log("Attempted to find Windows terminal settings at the following locations");
                    for (const path of error.paths) {
                        console.log("-", path);
                    }
                }

                console.log();
            },
        );
    },
} satisfies Driver;
