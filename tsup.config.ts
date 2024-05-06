import { defineConfig } from "tsup";

export default defineConfig((options) => {
    return {
        entry: ["src/index.ts"],
        banner: {
            js: '#! /usr/bin/env node\nprocess.env.NODE_ENV = "production"',
        },
        target: "es2022",
        outDir: "bin",
        format: "cjs",
        clean: true,
        dts: false,
        sourcemap: false,
        splitting: false,
        minify: !options.watch,
        bundle: !options.watch,
        noExternal: options.watch ? undefined : [/(.*)/],
    };
});
