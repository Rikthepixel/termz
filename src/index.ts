import { Command } from "commander";
import { openCommand } from "./commands/open";
// import { createCommand } from "./commands/create";
import { version } from "../package.json";

const program = new Command("termz")
    .description("Setup terminal sessions with ease")
    .version(version, "-v, --version")
    .option("--quiet", "Prevents unnecessary output", false)
    .option("--verbose", "Logs everything, helpful for debugging", false);

program.addCommand(openCommand, { isDefault: true });
//.addCommand(createCommand);

program.parse();