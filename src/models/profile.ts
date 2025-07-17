import * as z from "zod/mini";
import { TerminalTab } from "./terminal-tab";

export const Profile = z.object({
    tabs: z.array(TerminalTab),
});

export type Profile = z.infer<typeof Profile>;