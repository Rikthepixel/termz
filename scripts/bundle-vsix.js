import { cp } from "fs/promises";
import { execa } from "execa";
import chalk from "chalk";

console.log(chalk.blueBright("Building VSCode plugin"));
await execa("npm run package -w plugins/vscode", { stdout: "inherit" });
console.log(chalk.blueBright("Done building VSCode plugin"));

console.log(chalk.blueBright("Copying VSCode plugin into output directory"));
await cp("./plugins/vscode/termz.vsix", "./bin/termz.vsix");