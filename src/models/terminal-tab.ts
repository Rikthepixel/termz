import * as z from "zod/mini";
import { TerminalPaneBase } from "./terminal-pane-base";
import { TerminalPane } from "./terminal-pane";

export const TerminalTab = z.object({
    ...TerminalPaneBase.shape,
    panes: z.optional(z.array(TerminalPane)),
});

export type TerminalTab = z.infer<typeof TerminalTab>;
