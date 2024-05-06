import { window, ExtensionContext } from "vscode";
import { v4 as uuidV4 } from "uuid";
import { createIpcServer } from "./ipc";
import { makeTab } from "./render";

function isActiveWindow() {
    return window.state.focused && window.activeTerminal && window.activeTerminal.state.isInteractedWith;
}

export async function activate(ctx: ExtensionContext) {
    const uuid = uuidV4();
    console.log("Starting server");

    const serverDispose = await createIpcServer(uuid, async (profile) => {
        if (!isActiveWindow()) {
            return;
        }

        for (const tab of profile.tabs) {
            makeTab(tab);
        }
    });

    ctx.subscriptions.push(serverDispose);
}

export function deactivate() {}
