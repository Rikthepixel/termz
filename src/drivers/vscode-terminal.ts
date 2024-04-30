import { execa } from "execa";
import { Driver, criteria } from "../models/driver";
import { existsSync } from "fs";
import os from "os";
import path from "path";
import { createConnection } from "net";
import { readFile } from "fs/promises";
import { Profile } from "src/models/profile";
import which from "which";

const SOCKET_REGISTRY_FILE = path.join(os.tmpdir(), "termz-vscode-sockets");
const KNOWN_CLIS = ["code", "code-insiders", "codium", "codium-insiders", "mrcode"] as const;

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

/**
 * Checks which VSCode clis are available
 */
async function getInstalledClis(): Promise<string[]> {
    const whichPromises = KNOWN_CLIS.map(async (cli) => {
        const whichPath: string | null = await which(cli, { nothrow: true });
        return whichPath ? cli : null;
    });

    return await Promise.all(whichPromises).then((clis) => clis.filter(Boolean) as string[]);
}

async function getExtensionId(): Promise<string> {
    if (process.env.NODE_ENV === "production") {
        return "rikthepixel.termz";
    } else {
        const pluginVsix = path.resolve(__dirname, "../../", "./plugins/vscode/termz.vsix");

        if (existsSync(pluginVsix)) {
            return pluginVsix;
        } else {
            await execa("npm run package -w plugins/vscode");
            return pluginVsix;
        }
    }
}

async function syncExtension(cli: string, extensionId: string) {
    const { stdout } = await execa(`${cli} --list-extensions`);
    const foundExtension = stdout.split("\n").find((e) => e.endsWith(".termz"));
    if (foundExtension) return;

    await execa(`${cli} --install-extension ${extensionId}`, { stdout: "inherit" });
}

async function sendProfileToPipe(profile: Profile, ipcPath: string) {
    return new Promise<void>((resolve) => {
        const json = JSON.stringify(profile);
        const connection = createConnection({ path: ipcPath })
            .on("error", () => resolve())
            .on("connect", () => {
                connection.write(json, () => connection.end(resolve));
            });
    }).catch(() => null);
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
        const [clis, extensionId] = await Promise.all([getInstalledClis(), getExtensionId()]);

        await Promise.all(clis.map((cli) => syncExtension(cli, extensionId)));
        await new Promise<void>((resolve) => setTimeout(resolve, 250)); // Wait for a bit so that the plugin has time to start up

        const registry = await readRegistry();
        const sendPromises = Object.values(registry).map((ipcPath) => sendProfileToPipe(profile, ipcPath));
        await Promise.all(sendPromises);
    },
} satisfies Driver;