import { Terminal } from "../terminal";

// TERM_PROGRAM

export default {
    name: "VSCode terminal",
    features: {
        tabs: true,
        verticalPanes: true,
        horizontalPanes: false,
        tabScript: false,
        paneScript: false,
    },
    detect() {
        return process.env.TERM_PROGRAM === "vscode";
    },
    open(tabs) {
        // NOTE: We'll need some kind of driver (VSCode extension) to make thisone work.
    },
} satisfies Terminal;
