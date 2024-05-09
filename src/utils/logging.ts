import chalk from "chalk";
import { Command } from "commander";
import { StructError } from "superstruct";

export const LOG_LEVELS = {
    quiet: 1,
    normal: 2,
    verbose: 3,
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export class Logger {
    constructor(private level: LogLevel) {}

    static fromCmd(cmd: Command) {
        const opts = cmd.optsWithGlobals();
        let level: LogLevel = LOG_LEVELS.normal;
        if (opts.quiet === true) {
            level = LOG_LEVELS.quiet;
        }
        if (opts.verbose === true) {
            level = LOG_LEVELS.verbose;
        }
        return new Logger(level);
    }

    pad() {
        if (this.level < 2) return;
        console.log();
    }

    log(...text: string[]) {
        if (this.level < 2) return;
        console.log(...text);
    }

    debug(...text: string[]) {
        if (this.level < 3) return;
        console.log(...text);
    }

    error(banner: string, ...body: any[]) {
        if (this.level < 2) return;
        this.errorBanner(banner);
        console.log(...body);
    }

    errorBanner(text: string) {
        if (this.level < 2) return;
        console.log(chalk.bgRed.white(`   ${text}   `));
    }

    structError(message: string, error: StructError) {
        if (this.level < 2) return;
        this.errorBanner(message);
        for (const failure of error.failures()) {
            console.log(
                "-",
                chalk.redBright(`"${failure.key}" was expected to be ${failure.type}`),
                chalk.gray(`(${failure.message})`),
            );
        }
    }
}
