import { Driver } from "src/models/driver";

export default {
    name: "GNOME Terminal",
    features: {
        tabs: true,
        script: true,
        horizontalPanes: false,
        verticalPanes: false,
    },
    detect() {
        return 0;
    },
    async validate() {
        return false
    },
    async open() {},
} satisfies Driver;
