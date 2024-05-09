import { Command } from "commander";
import { openCommand } from "./commands/open";
// import { createCommand } from "./commands/create";

const program = new Command("termz")
    .description("Setup terminal sessions with ease")
    .version("0.4.0", "-v, --version")
    .option("--quiet", "Prevents unnecessary output", false)
    .option("--verbose", "Logs everything, helpful for debugging", false);

program.addCommand(openCommand, { isDefault: true });
//.addCommand(createCommand);

program.parse();
