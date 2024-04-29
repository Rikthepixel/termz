# Termz

*Setup terminals sessions on your own terms.*

Termz automatically sets up terminal sessions and executes commands. Note that this extensions does not do anything on its own. 
You need to call `termz` in terminal to open sessions. 

See ther [Termz Github](https://github.com/Rikthepixel/termz) for an indepth explanation on what Termz is.

## Usage

### Ways to call Termz

Open the VSCode integrated terminal and type one of the following:

#### 1. With `npx` 
```sh
> npx termz
```

#### 2. Globally install
```sh
> npm i -g termz
> termz
```

### Open a specific Termz file

```sh
> termz backend.trmz
```

### Show Termz help screen

```sh
> termz -h
```

## Features

- Automatically opens, sets up, and splits terminals when `termz` is executed in the VSCode terminal

## Release Notes

### [1.0.0] Intial release

- Initial release
- Create IPC server for Termz (in the terminal) to talk to.

## Planned Features

- Opening terminal sessions from the Command pallette