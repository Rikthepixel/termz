import { Infer, assign, enums, number, object, optional } from "superstruct";
import { TerminalPaneBaseSchema } from "./terminal-pane-base";

export const TerminalPaneSchema = assign(
    TerminalPaneBaseSchema,
    object({
        axis: enums(["vertical", "horizontal"]),
        size: optional(number()),
    }),
);

export type TerminalPane = Infer<typeof TerminalPaneSchema>;
