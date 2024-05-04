# Termz

*Setup terminals sessions on your own terms.*

Termz automatically sets up terminal sessions and executes commands. Note that this extensions does not do anything on its own. 
You need to call `termz` in terminal to open sessions. 

See the [Termz Github](https://github.com/Rikthepixel/termz) for an indepth explanation on what Termz is.

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
> termz backend.termz
```

### Show Termz help screen

```sh
> termz -h
```

## Features

- Automatically opens, sets up, and splits terminals when `termz` is executed in the VSCode terminal

## Release Notes

### [1.1.0] Multiple scripts
Termz `0.3.0` added support for executing multiple scripts. Now the VSCode plugin supports it too.

### [1.0.2...1.0.6] Automated deployment

Simply test releases to check if automated deployment is working as expected.

### [1.0.1] Increase compatibility

- Increased compatibility to VSCode 1.70 and above instead of 1.88 and above.
  - Allows for the usage or MrCode and older VSCode versions

### [1.0.0] Intial release

- Initial release
- Create IPC server for Termz (in the terminal) to talk to.

## Planned Features

- Opening terminal sessions from the Command pallette