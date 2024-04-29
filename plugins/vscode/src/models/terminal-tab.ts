import { TerminalPaneBase } from "./terminal-pane-base";
import { TerminalPane } from "./terminal-pane";

export type TerminalTab = {
    panes?: TerminalPane[];
} & TerminalPaneBase;
