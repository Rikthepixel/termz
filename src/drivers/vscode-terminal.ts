import { execa } from "execa";
import { Driver, criteria } from "../models/driver";
import { existsSync } from "fs";
import os from "os";
import path from "path";
import { createConnection } from "net";
import { readFile } from "fs/promises";
import { Profile } from "src/models/profile";

const SOCKET_REGISTRY_FILE = path.join(os.tmpdir(), "termz-vscode-sockets");

async function readRegistry(): Promise<Record<string, string>> {
    return await readFile(SOCKET_REGISTRY_FILE)
        .then((content) => {
            const jsonLines = content
                .toString()
                .split("\n")
                .filter((line) => line !== "")
                .join(",");
            return `{${jsonLines}}`;
        })
        .then((content) => JSON.parse(content));
}

async function hasExtension(): Promise<boolean> {
    const { stdout } = await execa(`code --list-extensions`);
    const foundExtension = stdout.split("\n").find((e) => e.endsWith(".termz"));
    return Boolean(foundExtension);
}

async function installExtension() {
    let extPathOrId: null | string = null;

    if (process.env.NODE_ENV === "production") {
        extPathOrId = "rikthepixel.termz";
    } else {
        const pluginVsix = path.resolve(__dirname, "../../", "./plugins/vscode/termz.vsix");

        if (existsSync(pluginVsix)) {
            extPathOrId = pluginVsix;
        } else {
            await execa("npm run package -w plugins/vscode");
            extPathOrId = pluginVsix;
        }
    }

    await execa(`code --install-extension ${extPathOrId}`, { stdout: "inherit" });
    return new Promise<void>((resolve) => setTimeout(resolve, 1000)); // Wait for a second so that the plugin has time to start up
}

async function sendProfileToPipe(profile: Profile, ipcPath: string) {
    return new Promise<void>((resolve) => {
        const json = JSON.stringify(profile);

        try {
            const connection = createConnection({ path: ipcPath })
                .on("error", () => resolve())
                .on("connect", () => {
                    connection.write(json, () => connection.end(resolve));
                });
        } catch {
            resolve();
        }
    });
}

export default {
    name: "VSCode terminal",
    features: {
        tabs: true,
        verticalPanes: true,
        horizontalPanes: false,
        tabScript: true,
        paneScript: true,
    },
    detect() {
        return criteria(
            process.env.TERM_PROGRAM === "vscode",
            Boolean(process.env.TERM_PROGRAM_VERSION),
            Boolean(process.env.VSCODE_INJECTION),
            Boolean(process.env.VSCODE_GIT_IPC_HANDLE),
            Boolean(process.env.TERMZ_VSCODE_UUID),
        );
    },
    async open(profile) {
        if (await hasExtension()) {
            await installExtension();
        }

        const registry = await readRegistry();
        const sendPromises = Object.values(registry).map((ipcPath) =>
            sendProfileToPipe(profile, ipcPath).catch(() => null),
        );
        await Promise.all(sendPromises);
    },
} satisfies Driver;