import { appendFile, readFile, writeFile } from "fs/promises";
import { Socket, createConnection, createServer } from "net";
import { Disposable } from "vscode";
import os from "os";
import path from "path";
import { Profile } from "./models/profile";

const SOCKET_REGISTRY_FILE = path.join(os.tmpdir(), "termz-vscode-sockets");

function getIpcPath(uuid: string) {
    const socket = `termz-vscode-${uuid}.sock`;

    if (process.platform === "win32") {
        return `\\\\.\\pipe\\${socket.replace(/^\//, "").replace(/\//g, "-")}`;
    }

    return path.join(os.tmpdir(), socket);
}

function makeIpcRecord(uuid: string, ipcPath?: string) {
    return `${JSON.stringify(uuid)}: ${JSON.stringify(ipcPath ?? getIpcPath(uuid))}`;
}

async function readRegistry(signal?: AbortSignal): Promise<Record<string, string>> {
    return await readFile(SOCKET_REGISTRY_FILE, { signal })
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

async function writeRegistry(registry: Record<string, string>, signal?: AbortSignal) {
    const lines: string[] = [];

    for (const [uuid, ipcPath] of Object.entries(registry)) {
        lines.push(makeIpcRecord(uuid, ipcPath));
    }

    await writeFile(SOCKET_REGISTRY_FILE, lines.join("\n"), { signal });
}

function pingConnection(connectionPath: string, signal?: AbortSignal): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        try {
            createConnection({ path: connectionPath, signal })
                .on("error", () => resolve(false))
                .on("connect", () => resolve(true));
        } catch {
            resolve(false);
        }
    });
}

/**
 * Prunes non-responsive registry entries
 */
async function pruneRegistry(currentUuid: string, signal: AbortSignal) {
    const registry = await readRegistry(signal);

    const pingPromises = Object.entries(registry).map(async (entry) => {
        const [pingUuid, pingPath] = entry;
        if (pingUuid === currentUuid) {
            return entry;
        }

        const isOpen = await pingConnection(pingPath, signal);
        if (isOpen) {
            return entry;
        }

        console.log(`Pruned ${pingUuid}`);
        return null;
    });

    const pingedRegistry = await Promise.all(pingPromises);
    const activeRegistry = Object.fromEntries(pingedRegistry.filter(Boolean) as [string, string][]);

    await writeRegistry(activeRegistry, signal);
}

export async function createIpcServer(
    uuid: string,
    openProfile: (profile: Profile) => Promise<void>,
): Promise<Disposable> {
    const controller = new AbortController();

    function attachSocket(socket: Socket) {
        socket.on("data", async (data) => {
            await openProfile(JSON.parse(data.toString()));
        });
    }

    const server = createServer(attachSocket).listen(getIpcPath(uuid));
    await appendFile(SOCKET_REGISTRY_FILE, "\n" + makeIpcRecord(uuid));
    pruneRegistry(uuid, controller.signal).catch(() => null);

    return new Disposable(async () => {
        controller.abort();
        server.close();

        const registry = await readRegistry();
        delete registry[uuid];
        await writeRegistry(registry);

        console.log("Disposed of server");
    });
}
