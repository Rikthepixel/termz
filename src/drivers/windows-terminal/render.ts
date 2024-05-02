import { TerminalTab } from "src/models/terminal-tab";
import { WtProfile, WtSettings } from "./settings";
import { $ } from "execa";
import { TerminalPane } from "src/models/terminal-pane";
import chalk from "chalk";
import { shouldRender } from "src/utils/driver";

const supportedCommandLines = [
    {
        detect(cmd: string) {
            return cmd.endsWith("powershell.exe") && cmd.includes("WindowsPowerShell");
        },
        makeArgs(profile: WtProfile, script: string) {
            return [profile.commandline!, "-NoExit", script];
        },
    },
    {
        detect(cmd: string) {
            return cmd.endsWith("cmd.exe");
        },
        makeArgs(profile: WtProfile, script: string) {
            return [profile.commandline!, "/K", script];
        },
    },
];

function findProfile(profiles: WtProfile[], defaultIdentifier: string, identifier?: string) {
    if (!identifier) return profiles.find((p) => p.guid === defaultIdentifier);
    const lowerCaseIdentifier = identifier.toLowerCase();
    return (
        profiles.find((p) => p.guid === identifier) ||
        profiles.find((p) => p.name.toLowerCase() === lowerCaseIdentifier)
    );
}

function makeScriptArgs(script: string, profile: WtProfile): string[] {
    profile.commandline = profile.commandline?.replace("%SystemRoot%", process.env.SystemRoot ?? "%SystemRoot%");
    const profileCmd = profile.commandline ?? profile.source;
    if (!profileCmd) {
        console.warn(chalk.yellowBright`No commandline or source specified in ${profile.guid} profile`);
        return [];
    }

    for (const cmd of supportedCommandLines) {
        if (!cmd.detect(profileCmd)) continue;
        return cmd.makeArgs(profile, script);
    }

    console.warn(chalk.yellowBright`Commandline not supported, can't spawn session with specified script`);
    return [];
}

export async function makePane(pane: TerminalPane, settings: WtSettings) {
    if (!shouldRender(pane, "wt")) {
        return;
    }
    const args: string[] = [];

    if (pane.displayName) {
        args.push("--title", pane.displayName, "--suppressApplicationTitle");
    }
    if (pane.directory) {
        args.push("--startingDirectory", pane.directory);
    }
    if (pane.profile) {
        args.push("--profile", pane.profile);
    }

    if (pane.axis === "horizontal") {
        args.push("--horizontal");
    } else if (pane.axis === "vertical") {
        args.push("--vertical");
    }

    if (pane.size) {
        args.push("--size", Math.min(Math.max(pane.size, 0.01), 0.99).toString());
    }

    if (pane.profile) {
        args.push("--profile", pane.profile);
    }

    if (pane.script) {
        const profile = findProfile(settings.profiles.list, settings.defaultProfile, pane.profile);
        if (profile) {
            args.push(...makeScriptArgs(pane.script, profile));
        } else {
            console.warn(chalk.yellowBright`Profile couldn't be found. Can't run specified script`);
        }
    }

    await $`wt -w 0 sp ${args}`;
}

export async function makeTab(tab: TerminalTab, settings: WtSettings) {
    if (!shouldRender(tab, "wt")) {
        return;
    }

    const args: string[] = [];

    if (tab.displayName) {
        args.push("--title", tab.displayName, "--suppressApplicationTitle");
    }
    if (tab.directory) {
        args.push("--startingDirectory", tab.directory);
    }

    if (tab.profile) {
        args.push("--profile", tab.profile);
    }

    if (tab.script) {
        const profile = findProfile(settings.profiles.list, settings.defaultProfile, tab.profile);
        if (profile) {
            args.push(...makeScriptArgs(tab.script, profile));
        } else {
            console.warn(chalk.yellowBright`Profile couldn't be found. Can't run specified script`);
        }
    }

    await $`wt -w 0 nt ${args}`;

    for (const pane of tab.panes ?? []) {
        await makePane(pane, settings);
    }
}

export async function focusPrevious() {
    await $`wt -w 0 ft --previous`;
}
