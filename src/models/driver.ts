import { Profile } from "./profile";

export type DriverFeature = "tabs" | "verticalPanes" | "horizontalPanes" | "script";

export type Driver = {
    name: string;
    features: Record<DriverFeature, true | string>;
    detect(): number;
    open(profile: Profile): Promise<any>;
};
