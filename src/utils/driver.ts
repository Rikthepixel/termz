import { SupportedDrivers } from "src/drivers";
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
