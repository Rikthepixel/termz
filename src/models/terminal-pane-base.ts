import { supportedDrivers } from "src/drivers";
import { Infer, array, enums, object, optional, string } from "superstruct";

export const TerminalPaneBaseSchema = object({
    exclude: optional(array(enums(supportedDrivers))),
    include: optional(array(enums(supportedDrivers))),
    displayName: optional(string()),
    profile: optional(string()),
    directory: optional(string()),
    script: optional(string()),
});

export type TerminalPaneBase = Infer<typeof TerminalPaneBaseSchema>;
