import { TerminalTab } from "./terminal-tab";

export type Driver = {
    name: string;
    features: {
        tabs: boolean;
        verticalPanes: boolean;
        horizontalPanes: boolean;
        tabScript: boolean;
        paneScript: boolean;
    };
    detect(): boolean;
    open(tabs: TerminalTab[]): Promise<void>;
};
