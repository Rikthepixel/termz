import { Command } from "commander";
import { runCommand } from "./commands/run";

const program = new Command("termz").description("Setup terminal sessions with ease").version("0.1");

program.addCommand(runCommand, { isDefault: true });

// termz open
// termz

program.parse();
