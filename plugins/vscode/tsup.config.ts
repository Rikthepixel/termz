import { defineConfig } from "tsup";

export default defineConfig((options) => {
    return {
        entry: ["src/extension.ts"],
        target: "es2022",
        outDir: "out",
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
