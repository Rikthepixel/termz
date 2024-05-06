import chalk from "chalk";
import { SupportedDrivers } from "src/drivers";
import { Driver, DriverFeature } from "src/models/driver";
import { Profile } from "src/models/profile";
import { TerminalPaneBase } from "src/models/terminal-pane-base";

export function shouldRender(pane: TerminalPaneBase, identifier: SupportedDrivers) {
    if (pane.include && pane.exclude) {
        return !pane.exclude.includes(identifier) && pane.include.includes(identifier);
    }

    if (pane.include) {
        return pane.include.includes(identifier);
    }

    if (pane.exclude) {
        return !pane.exclude.includes(identifier);
    }
    return true;
}

export function criteria(...clauses: boolean[]) {
    let trueCount = 0;
    for (const clause of clauses) {
        if (clause) {
            trueCount++;
        }
    }
    return trueCount;
}

export function logIncompatibleFeatures(profile: Profile, features: Driver["features"]) {
    const usedFeatures: Record<DriverFeature, boolean> = {
        tabs: true,
        script: false,
        verticalPanes: false,
        horizontalPanes: false,
    };

    for (const tab of profile.tabs) {
        if (tab.script) usedFeatures.script = true;
        for (const pane of tab.panes ?? []) {
            if (pane.script) usedFeatures.script = true;
            if (pane.axis === "vertical") usedFeatures.script = true;
            if (pane.axis === "horizontal") usedFeatures.script = true;
        }
    }

    const warnings: string[] = [];
    for (const [key, value] of Object.entries(features) as [DriverFeature, true | string][]) {
        const used = usedFeatures[key];
        if (used && value !== true) {
            warnings.push(value);
        }
    }

    if (warnings.length === 0) return;

    console.log();
    console.log(chalk.bgHex("#f08506").white.bold(`   Feature incompatibilities   `));
    for (const warning of warnings) {
        console.log(`- ${chalk.hex("#f08506")(warning)}`);
    }
    console.log();
}
