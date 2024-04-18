import os from "os";

export function resolveUserHome(path: string) {
    if (path.startsWith("~")) {
        return path.replace("~", os.homedir());
    }
    return path;
}
