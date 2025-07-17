import windowsTerminal from "./windows-terminal";
import vscodeTerminal from "./vscode-terminal";

export const supportedDrivers = ["wt", "vscode"] as const;
export type SupportedDrivers = (typeof supportedDrivers)[number];

export const drivers = [
    windowsTerminal,
    vscodeTerminal,
    // gnomeTerminal
];

export const defaultWindowsDriver = windowsTerminal;
