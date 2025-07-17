import * as z from "zod/mini";
import { TerminalPaneBase } from "./terminal-pane-base";

export const TerminalPane = z.object({
    ...TerminalPaneBase.shape,
    axis: z.literal(["vertical", 'horizontal']),
    size: z.optional(z.number()),
});

export type TerminalPane = z.infer<typeof TerminalPane>;
