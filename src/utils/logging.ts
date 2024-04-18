import chalk from "chalk";
import { StructError } from "superstruct";

export function logErrorBanner(text: string) {
    console.log(chalk.bgRed.white(`   ${text}   `));
}

export function logStructError(message: string, error: StructError) {
    logErrorBanner(message);
    for (const failure of error.failures()) {
        console.log(
            "-",
            chalk.redBright(`"${failure.key}" was expected to be ${failure.type}`),
            chalk.gray(`(${failure.message})`),
        );
    }
}
