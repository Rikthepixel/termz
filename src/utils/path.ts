import os from "os";
import { isAbsolute, join } from "path";

export function resolveUserHome(path: string) {
    if (path.startsWith("~")) {
        return path.replace("~", os.homedir());
    }
    return path;
}

export function resolveAbsolute(path: string, from: string = process.cwd()) {
    if (path.startsWith("~")) {
        return path.replace("~", os.homedir());
    }
    if (!isAbsolute(path)) {
        return join(from, path);
    }
    return path;
}
