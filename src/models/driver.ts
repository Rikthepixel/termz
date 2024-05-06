import { Profile } from "./profile";

export type Driver = {
    name: string;
    features: {
        tabs: boolean;
        verticalPanes: boolean;
        horizontalPanes: boolean;
        tabScript: boolean;
        paneScript: boolean;
    };
    detect(): number;
    open(profile: Profile): Promise<any>;
};

export function criteria(...clauses: boolean[]) {
    let trueCount = 0;
    for (const clause of clauses) {
        if (clause) {
            trueCount++;
        }
    }
    return trueCount;
}
