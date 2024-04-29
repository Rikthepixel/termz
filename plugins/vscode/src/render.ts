import { Terminal, ViewColumn, window } from "vscode";
import { TerminalPaneBase } from "./models/terminal-pane-base";
import { TerminalTab } from "./models/terminal-tab";
import { TerminalPane } from "./models/terminal-pane";

const DRIVER_IDENTIFIER = "vscode" as const;
function shouldRender(pane: TerminalPaneBase) {
    if (pane.include && pane.exclude) {
        return !pane.exclude.includes(DRIVER_IDENTIFIER) && pane.include.includes(DRIVER_IDENTIFIER);
    }

    if (pane.include) {
        return pane.include.includes(DRIVER_IDENTIFIER);
    }

    if (pane.exclude) {
        return !pane.exclude.includes(DRIVER_IDENTIFIER);
    }
    return true;
}

export function makePane(pane: TerminalPane, parent: Terminal) {
    if (!shouldRender(pane)) {
        return;
    }

    const size = Math.round((pane.size ?? 0.5) * 10) as ViewColumn;

    const paneTerminal = window.createTerminal({
        name: pane.displayName,
        cwd: pane.directory,
        location: {
            parentTerminal: parent,
            viewColumn: size,
        },
    });

    if (pane.script) {
        paneTerminal.sendText(pane.script, true);
    }
}

export function makeTab(tab: TerminalTab) {
    if (!shouldRender(tab)) {
        return;
    }

    const tabTerminal = window.createTerminal({
        name: tab.displayName,
        cwd: tab.directory,
    });

    if (tab.script) {
        tabTerminal.sendText(tab.script, true);
    }

    if (tab.panes) {
        for (const pane of tab.panes) {
            makePane(pane, tabTerminal);
        }
    }
}
