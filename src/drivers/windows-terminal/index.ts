import { Driver } from "src/models/driver";
import { EoentError } from "src/utils/file";
import { StructError } from "superstruct";
import { NoWtSettingsError, readWtSettings } from "./settings";
import { focusPrevious, makeTab } from "./render";
import { criteria } from "src/utils/driver";
import which from "which";

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
    async validate() {
        return Boolean(which("wt", { nothrow: true }));
    },
    async open(logger, profile) {
        const tabs = profile.tabs;

        return (await readWtSettings()).match(
            async (settings) => {
                for (const tab of tabs) {
                    await makeTab(logger, tab, settings);
                }

                for (let i = 0; i < tabs.length; i++) {
                    await focusPrevious();
                }
            },
            (error) => {
                logger.pad();

                if (error instanceof EoentError) {
                    logger.error(`Failed to read windows terminal settings, perhaps check if it exists.`, error);
                } else if (error instanceof SyntaxError) {
                    logger.error(`The contents of the windows terminal profile were not valid JSON`, error);
                } else if (error instanceof StructError) {
                    logger.structError(
                        `The JSON contents of the windows terminal profile didn't adhere to the expected structure`,
                        error,
                    );
                } else if (error instanceof NoWtSettingsError) {
                    logger.error(
                        `Failed to read Windows terminal settings, perhaps check if it exists.`,
                        "Attempted to find Windows terminal settings at the following locations\n",
                        error.paths.map((path) => `- ${path}`).join("\n"),
                    );
                }

                logger.pad();
            },
        );
    },
} satisfies Driver;
