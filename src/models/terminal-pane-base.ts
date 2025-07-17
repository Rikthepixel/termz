import { supportedDrivers } from "src/drivers";
import * as z from "zod/mini";

export const TerminalPaneBase = z.object({
    exclude: z.optional(z.array(z.literal(supportedDrivers))),
    include: z.optional(z.array(z.literal(supportedDrivers))),
    displayName: z.optional(z.string()),
    profile: z.optional(z.string()),
    directory: z.optional(z.string()),
    script: z.optional(z.union([z.string(), z.array(z.string())])),
});

export type TerminalPaneBase = z.infer<typeof TerminalPaneBase>;
