import { Infer, array, assign, object, optional } from "superstruct";
import { TerminalPaneBaseSchema } from "./terminal-pane-base";
import { TerminalPaneSchema } from "./terminal-pane";

export const TerminalTabSchema = assign(
    TerminalPaneBaseSchema,
    object({
        panes: optional(array(TerminalPaneSchema)),
    }),
);

export type TerminalTab = Infer<typeof TerminalTabSchema>;
