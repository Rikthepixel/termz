import { $ } from "execa";
import { Driver } from "../models/driver";
import { existsSync } from "fs";
import os from "os";
import path from "path";
import { createConnection } from "net";
import { Profile } from "src/models/profile";
import which from "which";
import { EoentError, readFile } from "src/utils/file";
import { err, ok } from "src/utils/result";
import { satisfies as satisfiesVersion } from "semver";
import { criteria } from "src/utils/driver";

const SOCKET_REGISTRY_FILE = path.join(os.tmpdir(), "termz-vscode-sockets");
const KNOWN_CLIS = ["code", "code-insiders", "codium", "codium-insiders"] as const;
const EXTENSION_ID = "rikthepixel.termz";
const EXTENSION_MIN_INSTALL_VERSION = "1.2.0";
const SUPPORTED_EXTENSION_VERSION = ">=1.2.0";

async function readRegistry() {
    return (await readFile(SOCKET_REGISTRY_FILE)).map((content) => {
        content = content
            .toString()
            .split("\n")
            .filter((line) => line !== "")
            .join(",");

        try {
            return ok(JSON.parse(`{${content}}`) as Record<string, string>);
        } catch (e) {
            return err(e as SyntaxError);
        }
    });
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
        return EXTENSION_ID;
    } else {
        const pluginVsix = path.resolve(__dirname, "../../", "./plugins/vscode/termz.vsix");

        if (existsSync(pluginVsix)) {
            return pluginVsix;
        } else {
            await $`npm run package -w plugins/vscode"`;
            return pluginVsix;
        }
    }
}

async function installExtension(cli: string, extension: string, version?: string) {
    await $({ stdout: "inherit" })`${cli} --install-extension ${extension}${version ? "@" + version : ""}`;
}

async function syncExtension(cli: string, extensionId: string) {
    const { stdout } = await $`${cli} --list-extensions --show-versions`;

    if (stdout === "") {
        return await installExtension(cli, extensionId);
    }

    const foundExtension = stdout
        .split("\n")
        .map((line) => line.split("@"))
        .find((line) => line[0]!.endsWith(".termz"));

    if (!foundExtension) {
        return await installExtension(cli, extensionId);
    }

    if (satisfiesVersion(foundExtension[1]!, SUPPORTED_EXTENSION_VERSION)) {
        return;
    }

    return await installExtension(cli, extensionId, EXTENSION_MIN_INSTALL_VERSION);
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
        horizontalPanes: "VSCode terminal doesn't support horizontal panes. Will create vertical panes as a fallback",
        script: true,
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
    async open(logger, profile) {
        const [clis, extensionId] = await Promise.all([getInstalledClis(), getExtensionId()]);

        await Promise.all(clis.map((cli) => syncExtension(cli, extensionId)));
        await new Promise<void>((resolve) => setTimeout(resolve, 250)); // Wait for a bit so that the plugin has time to start up

        const registryResult = await readRegistry();
        const sendProfileResult = await registryResult
            .map((registry) => Object.values(registry).map((ipcPath) => sendProfileToPipe(profile, ipcPath)))
            .map(Promise.all.bind(Promise))
            .promise();

        sendProfileResult.match(
            () => null,
            (error) => {
                if (error instanceof EoentError) {
                    logger.error(
                        "Failed to read VSCode registry. Perhaps restart your VSCode windows and try it again.",
                        error,
                    );
                } else if (error instanceof SyntaxError) {
                    logger.error(
                        "VSCode registry appears to be in an inproper format. Please file a bug-report with the error listed below",
                        error,
                    );
                }
            },
        );
    },
} satisfies Driver;
