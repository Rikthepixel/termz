export type TerminalPaneBase = {
    exclude?: string[];
    include?: string[];
    displayName?: string;
    profile?: string;
    directory: string;
    script?: string | string[];
};
