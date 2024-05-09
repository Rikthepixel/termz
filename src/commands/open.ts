import chalk from "chalk";
import { Argument, Command } from "commander";
import { readProfile } from "src/profile";
import { drivers } from "src/drivers";
import { StructError } from "superstruct";
import { logErrorBanner, logStructError } from "src/utils/logging";
import { EoentError } from "src/utils/file";
import { Driver } from "src/models/driver";
import { logIncompatibleFeatures } from "src/utils/driver";

async function openAction(profileFile: string) {
    console.log();

    let likelyhood = 0;
    let driver: null | Driver = null;

    for (const searchDriver of drivers) {
        const searchLikelyhood = searchDriver.detect();
        if (likelyhood <= searchLikelyhood) {
            likelyhood = searchLikelyhood;
            driver = searchDriver;
        }
    }

    if (!driver) {
        logErrorBanner("No terminal/multiplexer could be detected.");
        console.log("It may not be supported yet, consider opening an issue on the Termz GitHub\n");
        return;
    }

    console.log(chalk.gray("Detected terminal/multiplexer:"), driver.name);

    const profileResult = await readProfile(profileFile);
    profileResult.match(
        async (profile) => {
            console.log(chalk.gray(`Setting up:`), profileFile);
            
            logIncompatibleFeatures(profile, driver.features);
            await driver.open(profile);

            console.log(chalk.greenBright("Successfully set-up terminal session 🎉\n"));
        },
        (error) => {
            console.log();

            if (error instanceof EoentError) {
                logErrorBanner(`Failed to read "${profileFile}", perhaps check if it exists.`);
                console.log(error);
            } else if (error instanceof SyntaxError) {
                logErrorBanner(`The contents of "${profileFile}" was not valid JSON`);
                console.log(error);
            } else if (error instanceof StructError) {
                logStructError(`The JSON contents "${profileFile}" didn't adhere to the expected structure`, error);
            }

            console.log();
        },
    );
}

export const openCommand = new Command("open")
    .description("opens a termz profile")
    .addArgument(new Argument("[profile]", "the profile to open").default(".termz", ".termz"))
    .action(openAction);
