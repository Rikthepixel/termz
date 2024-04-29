import { TerminalPaneBase } from "./terminal-pane-base";

export type TerminalPane = {
    axis: "vertical" | "horizontal";
    size?: number;
} & TerminalPaneBase;
