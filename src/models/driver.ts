import { Logger } from "src/utils/logging";
import { Profile } from "./profile";

export type DriverFeature = "tabs" | "verticalPanes" | "horizontalPanes" | "script";

export type Driver = {
    name: string;
    features: Record<DriverFeature, boolean | string>;
    detect(): number;
    validate(): Promise<boolean>;
    open(logger: Logger, profile: Profile): Promise<any>;
};
