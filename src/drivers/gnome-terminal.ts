import { Driver } from "src/models/driver";

export default {
    name: "GNOME Terminal",
    features: {
        tabs: true,
        horizontalPanes: false,
        verticalPanes: false,
        tabScript: false,
        paneScript: false,
    },
    detect() {
        return 0;
    },
    async open() {},
} satisfies Driver;
