import { Command } from "commander";
import { runCommand } from "./commands/run";
// import { createCommand } from "./commands/create";

const program = new Command("termz").description("Setup terminal sessions with ease").version("0.3.3");

program.addCommand(runCommand, { isDefault: true });
//.addCommand(createCommand);

program.parse();
