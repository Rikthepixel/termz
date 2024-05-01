import { cp } from "fs/promises";
import { $ } from "execa";
import chalk from "chalk";

console.log(chalk.blueBright("Building VSCode plugin"));
await $({ stdout: "inherit" })`npm run package -w plugins/vscode`;
console.log(chalk.blueBright("Done building VSCode plugin"));

console.log(chalk.blueBright("Copying VSCode plugin into output directory"));
await cp("./plugins/vscode/termz.vsix", "./bin/termz.vsix");