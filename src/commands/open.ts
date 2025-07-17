import chalk from "chalk";
import { Argument, Command } from "commander";
import { readProfile } from "src/profile";
import { drivers, defaultWindowsDriver } from "src/drivers";
import { StructError } from "superstruct";
import { Logger } from "src/utils/logging";
import { EoentError } from "src/utils/file";
import { Driver } from "src/models/driver";
import { logIncompatibleFeatures } from "src/utils/driver";

async function openAction(logger: Logger, profileFile: string) {
    logger.pad();

    let likelyhood = 0;
    let driver: null | Driver = null;

    for (const searchDriver of drivers) {
        const searchLikelyhood = searchDriver.detect();
        if (likelyhood <= searchLikelyhood) {
            likelyhood = searchLikelyhood;
            driver = searchDriver;
        }
    }

    if (likelyhood === 0 && process.platform === "win32") {
        driver = defaultWindowsDriver;
        likelyhood = 1; // Set a default likelihood for Windows Terminal
    }

    if (!driver || likelyhood === 0 || !(await driver?.validate())) {
        logger.error(
            "No terminal/multiplexer could be detected.",
            "It may not be supported yet, consider opening an issue on the Termz GitHub\n",
        );
        return;
    }

    logger.log(chalk.gray("Detected terminal/multiplexer:"), driver.name);

    const profileResult = await readProfile(profileFile);
    profileResult.match(
        async (profile) => {
            logger.log(chalk.gray(`Setting up:`), profileFile);

            logIncompatibleFeatures(logger, profile, driver.features);
            await driver.open(logger, profile);

            logger.log(chalk.greenBright("Successfully set-up terminal session 🎉\n"));
        },
        (error) => {
            logger.pad();

            if (error instanceof EoentError) {
                logger.error(`Failed to read "${profileFile}", perhaps check if it exists.`, error);
            } else if (error instanceof SyntaxError) {
                logger.error(`The contents of "${profileFile}" was not valid JSON`, error);
            } else if (error instanceof StructError) {
                logger.structError(`The JSON contents "${profileFile}" didn't adhere to the expected structure`, error);
            }

            logger.pad();
        },
    );
}

export const openCommand = new Command("open")
    .description("opens a termz profile")
    .addArgument(new Argument("[profile]", "the profile to open").default(".termz", ".termz"))
    .action((profileFile) => openAction(Logger.fromCmd(openCommand), profileFile));
