import { Infer, array, object } from "superstruct";
import { TerminalTabSchema } from "./terminal-tab";

export const ProfileSchema = object({
    tabs: array(TerminalTabSchema),
});

export type Profile = Infer<typeof ProfileSchema>;
