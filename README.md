# termz

> Setup terminals on your own terms.

## What and why is Termz?

### What

Termz is a CLI tool that automatically sets up your terminal sessions for you. Termz aims for a consistent usage across all platforms, and it works with various different IDEs and terminal applications.

### Why

Imagine a project where you have to open multiple terminal tabs and run multiple different commands to get started.
It can be annoying to keep setting that up every time you work on the project. With Termz you only have to write a configuration once, and it will automatically open all the required tabs when you run `termz`.

## Installation

```bash
npm i -g termz@latest
```

## Supported terminals/multiplexers

-   Windows Terminal
-   VSCode & VSCodium (`v1.70` and above)

## How to Use

Create a `.termz` file in your working directory.

### Create a `.termz` file

#### Autocomplete/JSON Schema

To get autocomplete on the `.termz` files, add the following to the top of your `.termz` file.

```json
{
    "$schema": "https://raw.githubusercontent.com/Rikthepixel/termz/refs/heads/main/schema.json"
}
```

#### Example file

```json
{
    "$schema": "https://raw.githubusercontent.com/Rikthepixel/termz/refs/heads/main/schema.json",
    "tabs": [
        {
            "displayName": "Backend tab", // Name that should be given to the tab
            "script": "nvim", // A script to run in that tab
            "exclude": ["vscode"], // Prevents the tab from opening in VSCode
            "directory": "./backend", // The working directory that the tab should start in.
            "panes": [ // A list of panes/sub-tabs that should be opened
                {
                    "axis": "horizontal", // The axis on which the panes should be split",
                    "displayName": "Frontend pane",
                    "script": "nvim", 
                    "exclude": ["vscode"], 
                    "directory": "./frontend" 
                }
            ]
        },
        {
            "displayName": "Frontend Dev",
            "directory": "./frontend",
            "script": "npm run dev"
        }
    ]
}
```

### Run the `termz` command

When running `termz`, it will automatically look for the `.termz` file in your current working directory. 

```bash
termz
```

Alternatively, you can specify a path to the `.termz` file.

```bash
termz foo.termz
```

## Roadmaps

### V1 Roadmap

-   Document `.termz` file format
-   Support more terminals (drivers):
    -   GNOME Terminal
    -   Konsole
    -   Kitty
    -   iTerm

### V1.1 Roadmap

-   Driver specific features
    -   VSCode:
        -   Open file-tabs
-   Support multiplexers (drivers):
    -   tmux
-   VSCode plugin acks that it is done running
-   Publish on `winget`, `apt`, `apk`, etc.
