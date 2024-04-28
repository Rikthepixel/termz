import { Command } from "commander";
import { createPrompt, useEffect, useState, useKeypress, isEnterKey, isBackspaceKey } from "@inquirer/core";
import { TerminalTab } from "src/models/terminal-tab";
import windowSize from "window-size";
import { AsyncResource } from "async_hooks";
import chalk from "chalk";
import { useHistory } from "src/rendering/hooks/use-history";
import { stack } from "src/rendering/layer";
import { outlinedBox } from "src/rendering/box";

const HIDE_CURSOR = "\u001B[?25l";

type TabsPromptConfig = {
    file: string;
};

const tabsPrompt = createPrompt<TerminalTab[], TabsPromptConfig>((config, done) => {
    const [size, setSize] = useState(() => windowSize.get());
    const [tabs, tabsHistory] = useHistory<TerminalTab[]>([{}, {}]);
    const [unboundSelectedTab, setSelectedTab] = useState(0);
    const [focus, setFocus] = useState<"tabs" | "panes">("tabs");
    const [mode, setMode] = useState<"normal" | "input">("normal");
    const [input, setInput] = useState<string>("");

    const selectedTab = Math.min(Math.max(0, unboundSelectedTab), tabs.length - 1);

    useEffect(() => {
        const refreshWindowSize = AsyncResource.bind(() => setSize(windowSize.get()));

        process.stdout.on("resize", refreshWindowSize);
        return () => process.stdout.off("resize", refreshWindowSize);
    }, []);

    useEffect(() => {
        setSelectedTab(selectedTab);
    }, [selectedTab]);

    useKeypress((key, rl) => {
        if (mode === "normal") {
            // Move left
            if (key.name === "h" || key.name === "left") {
                if (focus === "tabs") {
                    setSelectedTab(Math.max(0, selectedTab - 1));
                }
            }

            // Move right
            if (key.name === "l" || key.name === "right") {
                if (focus === "tabs") {
                    setSelectedTab(Math.min(tabs.length - 1, selectedTab + 1));
                }
                if (focus === "panes") {
                    //
                }
            }

            if (key.name === "k" || key.name === "up") {
                // Move up
            }
            if (key.name === "j" || key.name === "down") {
                // Move down
            }

            if (key.name === "tab") {
                setFocus(focus !== "tabs" ? "tabs" : "panes");
            }

            // New tab or pane
            if (key.name === "n") {
                if (focus === "tabs") {
                    tabsHistory.push([...tabs, {}]);
                }
                if (focus === "panes") {
                }
            }

            // Starting directory
            if (key.name === "s") {
            }

            if (key.name === "d") {
                // Delete selection either pane or tab
                if (focus === "tabs") {
                    if (tabs.length - 1 === 0) {
                        return; // Give error that there needs to be at least one tab
                    }

                    const newTabs = [...tabs];
                    newTabs.splice(selectedTab, 1);
                    tabsHistory.push(newTabs);
                    setSelectedTab(Math.min(selectedTab, newTabs.length - 1));
                }
                if (focus === "panes") {
                    //
                }
            }

            if (key.name === "t") {
                const initial = tabs[selectedTab].displayName ?? selectedTab.toString();
                setMode("input");
                rl.clearLine(0);
                setInput(initial);
                rl.write(initial);
            }

            if (key.name === "u") {
                tabsHistory.undo();
            }
            if (key.name === "r") {
                tabsHistory.redo();
            }
        } else if (mode === "input") {
            if (isEnterKey(key)) {
                // Done changing title
                const newTabs = [...tabs];
                newTabs[selectedTab] = {
                    ...newTabs[selectedTab],
                    displayName: input,
                };

                tabsHistory.push(newTabs);

                rl.clearLine(0);
                setInput("");
                setMode("normal");
            } else if (isBackspaceKey(key) && !input) {
                rl.clearLine(0);
                setInput("");
            } else if (key.name === "escape") {
                rl.clearLine(0);
                setInput("");
                setMode("normal");
            } else {
                setInput(rl.line.replace(/\t/g, ""));
            }
        }
    });

    const aspectRatio = size.width / size.height;

    const tabSize = {
        x: Math.min(100, Math.floor(size.width)),
        y: Math.min(Math.ceil(100 / aspectRatio), Math.floor(size.height)),
    };

    const renderedTabs = tabs
        .map((tab, i) => {
            const text = `  ${tab.displayName ?? i}  `;
            if (selectedTab === i) {
                if (focus === "tabs" && mode === "input") {
                    return chalk.bgBlueBright.black(`  ${input}  `);
                }

                return focus !== "tabs" ? chalk.bgGray.black(text) : chalk.bgWhiteBright.black(text);
            }
            return focus !== "tabs" ? chalk.bgRgb(80, 80, 80).black(text) : chalk.bgGray.black(text);
        })
        .join(" ");

    const renderedTab = stack([
        focus === "tabs"
            ? chalk.gray(outlinedBox(tabSize.x, tabSize.y))
            : chalk.white(outlinedBox(tabSize.x, tabSize.y)),
        chalk.blue("\n hello world"),
    ]);

    return [renderedTabs, renderedTab].join("\n") + (mode === "input" ? "" : HIDE_CURSOR);
});

async function createAction() {
    // const profilePath = await input({
    //     message: "To which file should the profile be saved?",
    //     async validate(input) {
    //         if (typeof input !== "string") return 'Profile must be of type "string"';
    //         return existsSync(input) ? "Profile already exists. Please pick a different name" : true;
    //     },
    // });

    const tabs = await tabsPrompt({
        file: process.cwd(),
    });
    //
    // await writeProfile(profilePath, {
    //     tabs,
    // });
}

export const createCommand = new Command("create").description("Create a new Termz profile").action(createAction);