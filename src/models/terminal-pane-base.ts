import { Infer, object, optional, string } from "superstruct";

export const TerminalPaneBaseSchema = object({
    displayName: optional(string()),
    profile: optional(string()),
    directory: optional(string()),
    script: optional(string()),
});

export type TerminalPaneBase = Infer<typeof TerminalPaneBaseSchema>;
