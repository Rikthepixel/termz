import { Command } from "commander";
import { runCommand } from "./commands/run";
// import { createCommand } from "./commands/create";

const program = new Command("termz").description("Setup terminal sessions with ease").version("0.4.0", "-v, --version");

program.addCommand(runCommand, { isDefault: true });
//.addCommand(createCommand);

program.parse();
